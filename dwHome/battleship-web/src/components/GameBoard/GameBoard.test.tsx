import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameBoard } from './GameBoard'
import type { GameState, Board, Ship, Player } from '../../types/game'

// Helper to create an empty 10x10 board
function createEmptyBoard(): Board {
  return Array(10).fill(null).map(() =>
    Array(10).fill(null).map(() => ({ status: 'empty' as const }))
  )
}

// Helper to create a board with ships
function createBoardWithShips(positions: [number, number][]): Board {
  const board = createEmptyBoard()
  positions.forEach(([row, col]) => {
    board[row][col] = { status: 'ship', shipId: 'test-ship' }
  })
  return board
}

// Helper to create a board with hits and misses
function createBoardWithAttacks(
  board: Board,
  hits: [number, number][],
  misses: [number, number][]
): Board {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  hits.forEach(([row, col]) => {
    newBoard[row][col] = { status: 'hit', shipId: newBoard[row][col].shipId || 'test-ship' }
  })
  misses.forEach(([row, col]) => {
    newBoard[row][col] = { status: 'miss' }
  })
  return newBoard
}

// Helper to create a ship
function createShip(
  id: string,
  type: Ship['type'],
  positions: [number, number][],
  hits: number = 0,
  sunk: boolean = false
): Ship {
  return {
    id,
    type,
    positions,
    hits,
    sunk,
    size: positions.length,
  }
}

// Helper to create a player
function createPlayer(board: Board, ships: Ship[]): Player {
  const shipsRemaining = ships.filter(s => !s.sunk).length
  return { board, ships, shipsRemaining }
}

// Helper to create a default game state
function createGameState(overrides: Partial<GameState> = {}): GameState {
  const playerBoard = createBoardWithShips([[0, 0], [0, 1]])
  const enemyBoard = createBoardWithShips([[5, 5], [5, 6]])
  
  const playerShips = [createShip('player-ship', 'destroyer', [[0, 0], [0, 1]])]
  const enemyShips = [createShip('enemy-ship', 'destroyer', [[5, 5], [5, 6]])]

  return {
    phase: 'playing',
    player: createPlayer(playerBoard, playerShips),
    enemy: createPlayer(enemyBoard, enemyShips),
    currentTurn: 'player',
    difficulty: 'medium',
    ...overrides,
  }
}

describe('GameBoard Component', () => {
  describe('renders both player and enemy boards', () => {
    it('renders player board with correct label', () => {
      const gameState = createGameState()
      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={true}
        />
      )

      expect(screen.getByText('내 함대')).toBeInTheDocument()
      expect(screen.getByTestId('player-grid')).toBeInTheDocument()
    })

    it('renders enemy board with correct label', () => {
      const gameState = createGameState()
      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={true}
        />
      )

      expect(screen.getByText('적 함대')).toBeInTheDocument()
      expect(screen.getByTestId('enemy-grid')).toBeInTheDocument()
    })

    it('renders both grids with 100 cells each', () => {
      const gameState = createGameState()
      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={true}
        />
      )

      const playerCells = screen.getAllByTestId(/player-grid-cell-\d+-\d+/)
      const enemyCells = screen.getAllByTestId(/enemy-grid-cell-\d+-\d+/)

      expect(playerCells).toHaveLength(100)
      expect(enemyCells).toHaveLength(100)
    })
  })

  describe('shows turn indicator', () => {
    it('shows "Player\'s Turn" when isPlayerTurn is true', () => {
      const gameState = createGameState()
      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={true}
        />
      )

      // Both mobile and desktop turn indicators should show player's turn
      const indicators = screen.getAllByTestId('turn-indicator')
      expect(indicators.length).toBeGreaterThan(0)
      expect(indicators[0]).toHaveTextContent('당신의 차례')
    })

    it('shows "AI\'s Turn" when isPlayerTurn is false', () => {
      const gameState = createGameState()
      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={false}
        />
      )

      // Both mobile and desktop turn indicators should show AI's turn
      const indicators = screen.getAllByTestId('turn-indicator')
      expect(indicators.length).toBeGreaterThan(0)
      expect(indicators[0]).toHaveTextContent('AI의 차례')
    })

    it('shows winner message when game is over', () => {
      const gameState = createGameState({
        phase: 'gameover',
        winner: 'player',
      })
      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={false}
        />
      )

      // Both mobile and desktop game results should exist
      const results = screen.getAllByTestId('game-result')
      expect(results.length).toBeGreaterThan(0)
      // Use getAllByText since there are multiple elements with "승리"
      expect(screen.getAllByText(/승리/).length).toBeGreaterThan(0)
    })
  })

  describe('enemy board is clickable during player turn', () => {
    it('allows clicking enemy cells when isPlayerTurn is true', async () => {
      const user = userEvent.setup()
      const handleFire = vi.fn()
      const gameState = createGameState()

      render(
        <GameBoard
          gameState={gameState}
          onFire={handleFire}
          isPlayerTurn={true}
        />
      )

      await user.click(screen.getByTestId('enemy-grid-cell-3-4'))

      expect(handleFire).toHaveBeenCalledWith(3, 4)
    })

    it('allows clicking multiple cells during player turn', async () => {
      const user = userEvent.setup()
      const handleFire = vi.fn()
      const gameState = createGameState()

      render(
        <GameBoard
          gameState={gameState}
          onFire={handleFire}
          isPlayerTurn={true}
        />
      )

      await user.click(screen.getByTestId('enemy-grid-cell-0-0'))
      await user.click(screen.getByTestId('enemy-grid-cell-9-9'))

      expect(handleFire).toHaveBeenCalledTimes(2)
      expect(handleFire).toHaveBeenNthCalledWith(1, 0, 0)
      expect(handleFire).toHaveBeenNthCalledWith(2, 9, 9)
    })
  })

  describe('player board is not clickable during game', () => {
    it('does not trigger any action when player board cells are clicked', async () => {
      const user = userEvent.setup()
      const handleFire = vi.fn()
      const gameState = createGameState()

      render(
        <GameBoard
          gameState={gameState}
          onFire={handleFire}
          isPlayerTurn={true}
        />
      )

      await user.click(screen.getByTestId('player-grid-cell-0-0'))

      expect(handleFire).not.toHaveBeenCalled()
    })

    it('player board shows ships visibly', () => {
      const gameState = createGameState()
      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={true}
        />
      )

      // Player ship at 0,0 should be visible (blue)
      const playerShipCell = screen.getByTestId('player-grid-cell-0-0')
      expect(playerShipCell.className).toMatch(/bg-blue-800/)
    })
  })

  describe('hit/miss animations work', () => {
    it('shows hit marker (X) on cells with hit status', () => {
      const playerBoard = createBoardWithShips([[0, 0]])
      const playerBoardWithHit = createBoardWithAttacks(playerBoard, [[0, 0]], [])
      
      const gameState = createGameState({
        player: createPlayer(playerBoardWithHit, [
          createShip('test-ship', 'destroyer', [[0, 0]], 1),
        ]),
      })

      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={true}
        />
      )

      const hitCell = screen.getByTestId('player-grid-cell-0-0')
      expect(hitCell.className).toMatch(/bg-red-600/)
      expect(hitCell.textContent).toMatch(/✕/)
    })

    it('shows miss marker (●) on cells with miss status', () => {
      const gameState = createGameState()
      // Add a miss to enemy board
      gameState.enemy.board[2][2] = { status: 'miss' }

      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={true}
        />
      )

      const missCell = screen.getByTestId('enemy-grid-cell-2-2')
      expect(missCell.className).toMatch(/bg-white|bg-gray-800/)
      expect(missCell.textContent).toMatch(/●/)
    })
  })

  describe('sunk ships are displayed', () => {
    it('shows sunk ship indicator when all cells are hit', () => {
      const playerBoard = createBoardWithShips([[0, 0], [0, 1]])
      const playerBoardWithHits = createBoardWithAttacks(playerBoard, [[0, 0], [0, 1]], [])
      
      const gameState = createGameState({
        player: createPlayer(playerBoardWithHits, [
          createShip('destroyer', 'destroyer', [[0, 0], [0, 1]], 2, true),
        ]),
      })

      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={true}
        />
      )

      // Check sunk indicator is shown
      expect(screen.getByTestId('sunk-ships-list')).toBeInTheDocument()
    })

    it('displays ship name when sunk', () => {
      const playerBoard = createBoardWithShips([[0, 0], [0, 1]])
      const playerBoardWithHits = createBoardWithAttacks(playerBoard, [[0, 0], [0, 1]], [])
      
      const gameState = createGameState({
        phase: 'playing',
        player: createPlayer(playerBoardWithHits, [
          createShip('destroyer', 'destroyer', [[0, 0], [0, 1]], 2, true),
        ]),
        enemy: createPlayer(createEmptyBoard(), []),
      })

      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={true}
        />
      )

      // The sunk ship should be indicated somewhere
      expect(screen.getByText(/구축함/)).toBeInTheDocument()
    })
  })

  describe('game over reveals all ships', () => {
    it('shows enemy ships when game is over', () => {
      const gameState = createGameState({
        phase: 'gameover',
        winner: 'player',
      })

      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={false}
        />
      )

      // Enemy ship at 5,5 should now be visible
      const enemyShipCell = screen.getByTestId('enemy-grid-cell-5-5')
      expect(enemyShipCell.className).toMatch(/bg-blue-800/)
    })

    it('disables enemy board clicks when game is over', async () => {
      const user = userEvent.setup()
      const handleFire = vi.fn()
      const gameState = createGameState({
        phase: 'gameover',
        winner: 'player',
      })

      render(
        <GameBoard
          gameState={gameState}
          onFire={handleFire}
          isPlayerTurn={false}
        />
      )

      await user.click(screen.getByTestId('enemy-grid-cell-0-0'))

      expect(handleFire).not.toHaveBeenCalled()
    })

    it('shows game result with winner', () => {
      const gameState = createGameState({
        phase: 'gameover',
        winner: 'player',
      })

      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={false}
        />
      )

      // Both mobile and desktop game results should exist
      const results = screen.getAllByTestId('game-result')
      expect(results.length).toBeGreaterThan(0)
    })

    it('shows defeat message when enemy wins', () => {
      const gameState = createGameState({
        phase: 'gameover',
        winner: 'enemy',
      })

      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={false}
        />
      )

      // Both mobile and desktop show defeat
      const defeatMessages = screen.getAllByText(/패배/)
      expect(defeatMessages.length).toBeGreaterThan(0)
    })
  })

  describe('responsive layout', () => {
    it('has responsive container classes', () => {
      const gameState = createGameState()
      render(
        <GameBoard
          gameState={gameState}
          onFire={vi.fn()}
          isPlayerTurn={true}
        />
      )

      const container = screen.getByTestId('gameboard-container')
      expect(container.className).toMatch(/flex/)
      expect(container.className).toMatch(/flex-col|lg:flex-row/)
    })
  })
})
