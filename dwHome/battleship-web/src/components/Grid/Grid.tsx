import type { Board, Position, CellStatus } from '../../types/game'
import { Cell } from '../Cell'

export interface GridProps {
  /** The game board to render */
  board: Board
  /** Click handler for cells, receives row and column indices */
  onCellClick?: (row: number, col: number) => void
  /** Whether the grid is interactive (clickable) */
  isInteractive?: boolean
  /** Optional label for the grid (e.g., "Your Fleet", "Enemy Waters") */
  label?: string
  /** Whether to show ships (false for enemy board during play) */
  showShips?: boolean
  /** Positions to highlight for ship placement preview */
  highlightPositions?: Position[]
  /** Positions to show as invalid for collision preview */
  invalidPositions?: Position[]
  /** Test ID for the grid container */
  dataTestId?: string
}

const ROW_LABELS = 'ABCDEFGHIJ'.split('')
const COL_LABELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function Grid({
  board,
  onCellClick,
  isInteractive = false,
  label,
  showShips = true,
  highlightPositions = [],
  invalidPositions = [],
  dataTestId = 'grid',
}: GridProps) {
  // Helper to check if a position is in the highlight list
  const isHighlighted = (row: number, col: number): boolean => {
    return highlightPositions.some(([r, c]) => r === row && c === col)
  }

  // Helper to check if a position is in the invalid list
  const isInvalid = (row: number, col: number): boolean => {
    return invalidPositions.some(([r, c]) => r === row && c === col)
  }

  // Get the display status for a cell
  const getCellStatus = (row: number, col: number): CellStatus => {
    const cell = board[row][col]
    // If showShips is false, hide ships as empty (for enemy board)
    if (!showShips && cell.status === 'ship') {
      return 'empty'
    }
    return cell.status
  }

  return (
    <div data-testid={dataTestId} className="flex flex-col items-center">
      {label && (
        <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
          {label}
        </h3>
      )}
      
      <div className="flex">
        {/* Left spacer for column labels alignment */}
        <div className="flex flex-col">
          <div className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
          {ROW_LABELS.map((rowLabel) => (
            <div
              key={rowLabel}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-medium text-gray-600 dark:text-gray-300"
              aria-hidden="true"
            >
              {rowLabel}
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          {/* Column labels */}
          <div className="flex" role="presentation">
            {COL_LABELS.map((colLabel) => (
              <div
                key={colLabel}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-medium text-gray-600 dark:text-gray-300"
                aria-hidden="true"
              >
                {colLabel}
              </div>
            ))}
          </div>

          {/* Grid cells */}
          <div
            data-testid={`${dataTestId}-cells`}
            className="grid grid-cols-10"
            role="grid"
            aria-label={label || 'Game board'}
          >
            {board.map((row, rowIndex) =>
              row.map((_, colIndex) => {
                const highlighted = isHighlighted(rowIndex, colIndex)
                const invalid = isInvalid(rowIndex, colIndex)
                const status = getCellStatus(rowIndex, colIndex)

                return (
                  <Cell
                    key={`${rowIndex}-${colIndex}`}
                    status={status}
                    onClick={
                      isInteractive && onCellClick
                        ? () => onCellClick(rowIndex, colIndex)
                        : undefined
                    }
                    isHoverable={highlighted || isInteractive}
                    isInvalid={invalid}
                    dataTestId={`${dataTestId}-cell-${rowIndex}-${colIndex}`}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
