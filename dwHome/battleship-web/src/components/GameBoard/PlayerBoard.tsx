import type { Board, Ship } from '../../types/game'
import { Grid } from '../Grid'

export interface PlayerBoardProps {
  /** The player's game board */
  board: Board
  /** The player's ships for displaying sunk status */
  ships: Ship[]
}

export function PlayerBoard({ board, ships }: PlayerBoardProps) {
  // Get sunk ships for display
  const sunkShips = ships.filter(ship => ship.sunk)

  return (
    <div 
      className="flex flex-col items-center"
      data-testid="player-board"
    >
      <Grid
        board={board}
        label="내 함대"
        showShips={true}
        isInteractive={false}
        dataTestId="player-grid"
      />

      {/* Sunk ships indicator */}
      {sunkShips.length > 0 && (
        <div 
          className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg"
          data-testid="sunk-ships-list"
        >
          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
            격침된 함선:
          </p>
          <div className="flex flex-wrap gap-2">
            {sunkShips.map(ship => (
              <span
                key={ship.id}
                className="px-2 py-1 bg-red-200 dark:bg-red-800 rounded text-sm text-red-800 dark:text-red-200"
              >
                {ship.type === 'carrier' && '항공모함'}
                {ship.type === 'battleship' && '전함'}
                {ship.type === 'cruiser' && '순양함'}
                {ship.type === 'submarine' && '잠수함'}
                {ship.type === 'destroyer' && '구축함'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
