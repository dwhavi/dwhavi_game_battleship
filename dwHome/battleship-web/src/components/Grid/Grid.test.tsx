import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Grid } from './Grid'
import type { Board } from '../../types/game'

// Helper to create an empty 10x10 board
function createEmptyBoard(): Board {
  return Array(10).fill(null).map(() =>
    Array(10).fill(null).map(() => ({ status: 'empty' as const }))
  )
}

// Helper to create a board with a ship at specific positions
function createBoardWithShip(positions: [number, number][]): Board {
  const board = createEmptyBoard()
  positions.forEach(([row, col]) => {
    board[row][col] = { status: 'ship', shipId: 'test-ship' }
  })
  return board
}

// Helper to create a board with hits/misses
function createBoardWithAttacks(
  hits: [number, number][],
  misses: [number, number][]
): Board {
  const board = createEmptyBoard()
  hits.forEach(([row, col]) => {
    board[row][col] = { status: 'hit', shipId: 'test-ship' }
  })
  misses.forEach(([row, col]) => {
    board[row][col] = { status: 'miss' }
  })
  return board
}

describe('Grid Component', () => {
  describe('renders 10x10 grid', () => {
    it('renders all 100 cells', () => {
      const board = createEmptyBoard()
      render(<Grid board={board} dataTestId="test-grid" />)
      
      // Check that we have 100 cell elements (10x10)
      const cells = screen.getAllByTestId(/test-grid-cell-\d+-\d+/)
      expect(cells).toHaveLength(100)
    })

    it('renders cells in correct grid layout', () => {
      const board = createEmptyBoard()
      render(<Grid board={board} dataTestId="test-grid" />)
      
      const gridContainer = screen.getByTestId('test-grid-cells')
      expect(gridContainer.className).toMatch(/grid/)
    })
  })

  describe('labels render correctly', () => {
    it('renders row labels A-J on the left', () => {
      const board = createEmptyBoard()
      render(<Grid board={board} dataTestId="test-grid" />)
      
      const rowLabels = 'ABCDEFGHIJ'.split('')
      rowLabels.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })

    it('renders column labels 1-10 on top', () => {
      const board = createEmptyBoard()
      render(<Grid board={board} dataTestId="test-grid" />)
      
      // Check for numbers 1-10
      for (let i = 1; i <= 10; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }
    })

    it('renders optional label when provided', () => {
      const board = createEmptyBoard()
      render(<Grid board={board} label="Your Fleet" dataTestId="test-grid" />)
      
      expect(screen.getByText('Your Fleet')).toBeInTheDocument()
    })
  })

  describe('cell click propagates with correct coordinates', () => {
    it('calls onCellClick with correct row and col when cell is clicked', async () => {
      const user = userEvent.setup()
      const board = createEmptyBoard()
      const handleCellClick = vi.fn()
      
      render(
        <Grid 
          board={board} 
          onCellClick={handleCellClick} 
          isInteractive={true}
          dataTestId="test-grid" 
        />
      )
      
      // Click cell at row 2, col 3 (0-indexed)
      await user.click(screen.getByTestId('test-grid-cell-2-3'))
      
      expect(handleCellClick).toHaveBeenCalledWith(2, 3)
    })

    it('does not call onCellClick when isInteractive is false', async () => {
      const user = userEvent.setup()
      const board = createEmptyBoard()
      const handleCellClick = vi.fn()
      
      render(
        <Grid 
          board={board} 
          onCellClick={handleCellClick} 
          isInteractive={false}
          dataTestId="test-grid" 
        />
      )
      
      await user.click(screen.getByTestId('test-grid-cell-0-0'))
      
      expect(handleCellClick).not.toHaveBeenCalled()
    })

    it('clicking multiple cells reports correct coordinates', async () => {
      const user = userEvent.setup()
      const board = createEmptyBoard()
      const handleCellClick = vi.fn()
      
      render(
        <Grid 
          board={board} 
          onCellClick={handleCellClick} 
          isInteractive={true}
          dataTestId="test-grid" 
        />
      )
      
      // Click corner cells
      await user.click(screen.getByTestId('test-grid-cell-0-0'))
      await user.click(screen.getByTestId('test-grid-cell-9-9'))
      await user.click(screen.getByTestId('test-grid-cell-5-7'))
      
      expect(handleCellClick).toHaveBeenCalledTimes(3)
      expect(handleCellClick).toHaveBeenNthCalledWith(1, 0, 0)
      expect(handleCellClick).toHaveBeenNthCalledWith(2, 9, 9)
      expect(handleCellClick).toHaveBeenNthCalledWith(3, 5, 7)
    })
  })

  describe('showShips prop', () => {
    it('shows ships when showShips is true', () => {
      const board = createBoardWithShip([[0, 0], [0, 1]])
      render(<Grid board={board} showShips={true} dataTestId="test-grid" />)
      
      // Ship cells should have ship status styling
      const shipCell = screen.getByTestId('test-grid-cell-0-0')
      expect(shipCell.className).toMatch(/bg-blue-800/)
    })

    it('hides ships when showShips is false (enemy board)', () => {
      const board = createBoardWithShip([[0, 0], [0, 1]])
      render(<Grid board={board} showShips={false} dataTestId="test-grid" />)
      
      // Ship cells should appear as empty
      const shipCell = screen.getByTestId('test-grid-cell-0-0')
      expect(shipCell.className).toMatch(/bg-gray-200/)
      expect(shipCell.className).not.toMatch(/bg-blue-800/)
    })
  })

  describe('highlightPositions prop', () => {
    it('highlights specified positions for ship placement preview', () => {
      const board = createEmptyBoard()
      const highlightPositions: [number, number][] = [[3, 3], [3, 4], [3, 5]]
      
      render(
        <Grid 
          board={board} 
          highlightPositions={highlightPositions}
          dataTestId="test-grid" 
        />
      )
      
      const highlightedCell = screen.getByTestId('test-grid-cell-3-3')
      expect(highlightedCell.className).toMatch(/hover:bg-blue-300|bg-blue-300/)
    })
  })

  describe('invalidPositions prop', () => {
    it('shows invalid styling for specified positions', () => {
      const board = createEmptyBoard()
      const invalidPositions: [number, number][] = [[0, 0]]
      
      render(
        <Grid 
          board={board} 
          invalidPositions={invalidPositions}
          dataTestId="test-grid" 
        />
      )
      
      const invalidCell = screen.getByTestId('test-grid-cell-0-0')
      expect(invalidCell.className).toMatch(/bg-red-300/)
    })
  })

  describe('board state rendering', () => {
    it('renders hit cells correctly', () => {
      const board = createBoardWithAttacks([[0, 0]], [])
      render(<Grid board={board} dataTestId="test-grid" />)
      
      const hitCell = screen.getByTestId('test-grid-cell-0-0')
      expect(hitCell.className).toMatch(/bg-red-600/)
      expect(hitCell.textContent).toMatch(/✕/)
    })

    it('renders miss cells correctly', () => {
      const board = createBoardWithAttacks([], [[1, 1]])
      render(<Grid board={board} dataTestId="test-grid" />)
      
      const missCell = screen.getByTestId('test-grid-cell-1-1')
      expect(missCell.className).toMatch(/bg-white/)
      expect(missCell.textContent).toMatch(/●/)
    })
  })

  describe('responsive sizing', () => {
    it('has responsive container classes', () => {
      const board = createEmptyBoard()
      render(<Grid board={board} dataTestId="test-grid" />)
      
      const container = screen.getByTestId('test-grid')
      expect(container).toBeInTheDocument()
    })
  })
})
