import type { GameState } from '../../types/game'
import { PlayerBoard } from './PlayerBoard'
import { EnemyBoard } from './EnemyBoard'

export interface GameBoardProps {
  /** Current game state */
  gameState: GameState
  /** Callback when player fires at enemy board */
  onFire: (row: number, col: number) => void
  /** Whether it's currently the player's turn */
  isPlayerTurn: boolean
}

export function GameBoard({
  gameState,
  onFire,
  isPlayerTurn,
}: GameBoardProps) {
  const { phase, player, enemy, winner } = gameState

  return (
    <div 
      className="flex flex-col lg:flex-row gap-6 p-4"
      data-testid="gameboard-container"
    >
      {/* Turn Indicator / Game Result */}
      <div className="w-full lg:hidden">
        {phase === 'gameover' ? (
          <div 
            data-testid="game-result"
            className={`
              p-4 rounded-xl text-center text-xl font-bold
              ${winner === 'player' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}
            `}
          >
            {winner === 'player' ? '🎉 승리! 축하합니다!' : '😢 패배... 다음에 다시!'}
          </div>
        ) : (
          <div 
            data-testid="turn-indicator"
            className={`
              p-3 rounded-xl text-center text-lg font-semibold
              ${isPlayerTurn 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}
            `}
          >
            {isPlayerTurn ? '🎯 당신의 차례' : '🤖 AI의 차례'}
          </div>
        )}
      </div>

      {/* Player Board - Left on desktop, bottom on mobile */}
      <div className="flex-1 flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <PlayerBoard
            board={player.board}
            ships={player.ships}
          />
        </div>
      </div>

      {/* Center - Turn indicator for desktop */}
      <div className="hidden lg:flex flex-col items-center justify-center gap-4">
        {phase === 'gameover' ? (
          <div 
            data-testid="game-result"
            className={`
              p-6 rounded-xl text-center
              ${winner === 'player' 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'}
            `}
          >
            <div className="text-4xl mb-2">
              {winner === 'player' ? '🎉' : '😢'}
            </div>
            <div 
              className={`
                text-xl font-bold
                ${winner === 'player' 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'}
              `}
            >
              {winner === 'player' ? '승리!' : '패배'}
            </div>
          </div>
        ) : (
          <div 
            data-testid="turn-indicator"
            className={`
              p-4 rounded-xl text-center min-w-[120px]
              ${isPlayerTurn 
                ? 'bg-blue-100 dark:bg-blue-900/30' 
                : 'bg-yellow-100 dark:bg-yellow-900/30'}
            `}
          >
            <div className="text-2xl mb-1">
              {isPlayerTurn ? '🎯' : '🤖'}
            </div>
            <div 
              className={`
                text-sm font-semibold
                ${isPlayerTurn 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-yellow-700 dark:text-yellow-300'}
              `}
            >
              {isPlayerTurn ? '당신의\n차례' : 'AI의\n차례'}
            </div>
          </div>
        )}
      </div>

      {/* Enemy Board - Right on desktop, top on mobile */}
      <div className="flex-1 flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <EnemyBoard
            board={enemy.board}
            ships={enemy.ships}
            onFire={onFire}
            isPlayerTurn={isPlayerTurn}
            gamePhase={phase}
          />
        </div>
      </div>
    </div>
  )
}
