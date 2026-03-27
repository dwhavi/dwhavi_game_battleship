import type { Difficulty, GamePhase } from '../../types/game'

export interface GameControlsProps {
  /** Current difficulty level */
  difficulty: Difficulty
  /** Callback when difficulty changes */
  onDifficultyChange: (difficulty: Difficulty) => void
  /** Callback when start button is clicked */
  onStart: () => void
  /** Callback when restart button is clicked */
  onRestart: () => void
  /** Current game phase */
  gamePhase: GamePhase
  /** Whether sound is muted */
  isMuted: boolean
  /** Callback when mute toggle is clicked */
  onMuteToggle: () => void
  /** Whether all controls are disabled */
  disabled?: boolean
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

const PHASE_LABELS: Record<GamePhase, string> = {
  setup: 'Setup',
  playing: 'Playing',
  gameover: 'Game Over',
}

export function GameControls({
  difficulty,
  onDifficultyChange,
  onStart,
  onRestart,
  gamePhase,
  isMuted,
  onMuteToggle,
  disabled = false,
}: GameControlsProps) {
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDifficultyChange(e.target.value as Difficulty)
  }

  const baseButtonStyles = `
    px-4 py-2 rounded-lg font-medium
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center gap-2 justify-center
  `

  const primaryButtonStyles = `
    ${baseButtonStyles}
    bg-blue-600 hover:bg-blue-700 text-white
    dark:bg-blue-500 dark:hover:bg-blue-600
  `

  const secondaryButtonStyles = `
    ${baseButtonStyles}
    bg-gray-200 hover:bg-gray-300 text-gray-800
    dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200
  `

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
      {/* Difficulty Selector */}
      <div className="flex items-center gap-2">
        <label 
          htmlFor="difficulty" 
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          난이도:
        </label>
        <select
          id="difficulty"
          data-testid="difficulty-selector"
          value={difficulty}
          onChange={handleDifficultyChange}
          disabled={disabled}
          className="
            px-3 py-2 rounded-lg border border-gray-300
            bg-white dark:bg-gray-700 dark:border-gray-600
            text-gray-800 dark:text-gray-200
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {DIFFICULTY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Game Phase Display */}
      <div 
        data-testid="game-phase"
        className="
          px-3 py-1 rounded-full text-sm font-medium
          bg-gray-200 dark:bg-gray-700
          text-gray-700 dark:text-gray-300
        "
      >
        {PHASE_LABELS[gamePhase]}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Start Button */}
        <button
          type="button"
          data-testid="start-button"
          onClick={onStart}
          disabled={disabled}
          className={primaryButtonStyles}
          aria-label="Start Game"
        >
          <span role="img" aria-hidden="true">▶️</span>
          <span>Start</span>
        </button>

        {/* Restart Button */}
        <button
          type="button"
          data-testid="restart-button"
          onClick={onRestart}
          disabled={disabled}
          className={secondaryButtonStyles}
          aria-label="Restart Game"
        >
          <span role="img" aria-hidden="true">🔄</span>
          <span>Restart</span>
        </button>

        {/* Mute Toggle */}
        <button
          type="button"
          data-testid="mute-button"
          onClick={onMuteToggle}
          disabled={disabled}
          className={secondaryButtonStyles}
          aria-label={isMuted ? 'Sound is muted - click to unmute' : 'Sound is unmuted - click to mute'}
        >
          <span role="img" aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
          <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>
      </div>
    </div>
  )
}
