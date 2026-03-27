import type { Board, Ship, GamePhase } from '../../types/game'
import { Grid } from '../Grid'

export interface EnemyBoardProps {
  /** The enemy's game board */
  board: Board
  /** The enemy's ships for displaying sunk status */
  ships: Ship[]
  /** Callback when player fires at a cell */
  onFire: (row: number, col: number) => void
  /** Whether it's the player's turn (can fire) */
  isPlayerTurn: boolean
  /** Current game phase */
  gamePhase: GamePhase
}

export function EnemyBoard({
  board,
  ships,
  onFire,
  isPlayerTurn,
  gamePhase,
}: EnemyBoardProps) {
  // Show ships only when game is over
  const showShips = gamePhase === 'gameover'
  
  // Board is interactive only during player's turn and game is still playing
  const isInteractive = isPlayerTurn && gamePhase === 'playing'

  // Get sunk ships for display
  const sunkShips = ships.filter(ship => ship.sunk)

  return (
    <div 
      className="flex flex-col items-center"
      data-testid="enemy-board"
    >
      <Grid
        board={board}
        label="적 함대"
        showShips={showShips}
        isInteractive={isInteractive}
        onCellClick={onFire}
        dataTestId="enemy-grid"
      />

      {/* Sunk ships indicator */}
      {sunkShips.length > 0 && (
        <div 
          className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg"
          data-testid="sunk-ships-list"
        >
          <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
            격침시킨 함선:
          </p>
          <div className="flex flex-wrap gap-2">
            {sunkShips.map(ship => (
              <span
                key={ship.id}
                className="px-2 py-1 bg-green-200 dark:bg-green-800 rounded text-sm text-green-800 dark:text-green-200"
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

      {/* Instructions */}
      {gamePhase === 'playing' && isPlayerTurn && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
          공격할 위치를 클릭하세요
        </p>
      )}
    </div>
  )
}
