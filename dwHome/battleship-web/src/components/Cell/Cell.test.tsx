import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Cell } from './Cell'
import type { CellStatus } from '../../types/game'

describe('Cell Component', () => {
  describe('renders all 4 statuses correctly', () => {
    const statuses: CellStatus[] = ['empty', 'ship', 'hit', 'miss']
    
    statuses.forEach((status) => {
      it(`renders ${status} status with correct styling`, () => {
        render(<Cell status={status} dataTestId={`cell-${status}`} />)
        const cell = screen.getByTestId(`cell-${status}`)
        expect(cell).toBeInTheDocument()
      })
    })

    it('renders empty cell with gray background class', () => {
      render(<Cell status="empty" dataTestId="cell-empty" />)
      const cell = screen.getByTestId('cell-empty')
      expect(cell.className).toMatch(/bg-gray-200/)
    })

    it('renders ship cell with blue background class', () => {
      render(<Cell status="ship" dataTestId="cell-ship" />)
      const cell = screen.getByTestId('cell-ship')
      expect(cell.className).toMatch(/bg-blue-800/)
    })

    it('renders hit cell with red background class', () => {
      render(<Cell status="hit" dataTestId="cell-hit" />)
      const cell = screen.getByTestId('cell-hit')
      expect(cell.className).toMatch(/bg-red-600/)
    })

    it('renders miss cell with white/gray background class', () => {
      render(<Cell status="miss" dataTestId="cell-miss" />)
      const cell = screen.getByTestId('cell-miss')
      expect(cell.className).toMatch(/bg-white/)
    })
  })

  describe('hit and miss visual indicators', () => {
    it('renders hit indicator (X) for hit status', () => {
      render(<Cell status="hit" dataTestId="cell-hit" />)
      const cell = screen.getByTestId('cell-hit')
      // Should contain an X or explosion indicator
      expect(cell.textContent).toMatch(/✕|×|X/)
    })

    it('renders miss indicator (dot/O) for miss status', () => {
      render(<Cell status="miss" dataTestId="cell-miss" />)
      const cell = screen.getByTestId('cell-miss')
      // Should contain a dot or circle indicator
      expect(cell.textContent).toMatch(/●|○|•/)
    })
  })

  describe('click handler', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Cell status="empty" onClick={handleClick} dataTestId="clickable-cell" />)
      
      await user.click(screen.getByTestId('clickable-cell'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when not provided', async () => {
      const user = userEvent.setup()
      render(<Cell status="empty" dataTestId="non-clickable-cell" />)
      
      // Should not throw when clicked without handler
      await user.click(screen.getByTestId('non-clickable-cell'))
      // Just verify it doesn't throw
      expect(screen.getByTestId('non-clickable-cell')).toBeInTheDocument()
    })
  })

  describe('hoverable state', () => {
    it('applies hover styles when isHoverable is true', () => {
      render(<Cell status="empty" isHoverable={true} dataTestId="hoverable-cell" />)
      const cell = screen.getByTestId('hoverable-cell')
      expect(cell.className).toMatch(/hover:bg-blue-300/)
      expect(cell.className).toMatch(/cursor-pointer/)
    })

    it('does not apply hover styles when isHoverable is false', () => {
      render(<Cell status="empty" isHoverable={false} dataTestId="non-hoverable-cell" />)
      const cell = screen.getByTestId('non-hoverable-cell')
      expect(cell.className).not.toMatch(/hover:bg-blue-300/)
    })

    it('does not apply hover styles by default', () => {
      render(<Cell status="empty" dataTestId="default-cell" />)
      const cell = screen.getByTestId('default-cell')
      expect(cell.className).not.toMatch(/hover:bg-blue-300/)
    })
  })

  describe('invalid state', () => {
    it('renders with invalid styling when isInvalid is true', () => {
      render(<Cell status="empty" isInvalid={true} dataTestId="invalid-cell" />)
      const cell = screen.getByTestId('invalid-cell')
      expect(cell.className).toMatch(/bg-red-300/)
    })

    it('does not apply invalid styling when isInvalid is false', () => {
      render(<Cell status="empty" isInvalid={false} dataTestId="valid-cell" />)
      const cell = screen.getByTestId('valid-cell')
      expect(cell.className).not.toMatch(/bg-red-300/)
    })
  })

  describe('accessibility', () => {
    it('has correct base styling classes', () => {
      render(<Cell status="empty" dataTestId="base-cell" />)
      const cell = screen.getByTestId('base-cell')
      // Should have size classes
      expect(cell.className).toMatch(/w-8 h-8/)
      // Should have border classes
      expect(cell.className).toMatch(/border/)
    })

    it('accepts custom dataTestId', () => {
      render(<Cell status="empty" dataTestId="custom-test-id" />)
      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument()
    })
  })
})
