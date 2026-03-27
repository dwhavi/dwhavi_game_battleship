import type { ShipType, Orientation } from '../../types/game'
import { SHIP_SIZES, SHIP_NAMES } from '../../types/game'

export interface ShipItemProps {
  /** Type of ship */
  shipType: ShipType
  /** Whether the ship has been placed on the board */
  isPlaced: boolean
  /** Whether this ship is currently selected */
  isSelected: boolean
  /** Current orientation for preview */
  orientation: Orientation
  /** Click handler to select this ship */
  onSelect: () => void
  /** Whether the component is disabled */
  disabled?: boolean
}

export function ShipItem({
  shipType,
  isPlaced,
  isSelected,
  orientation,
  onSelect,
  disabled = false,
}: ShipItemProps) {
  const size = SHIP_SIZES[shipType]
  const name = SHIP_NAMES[shipType]

  // Create ship preview blocks
  const renderShipPreview = () => {
    const blocks = []
    for (let i = 0; i < size; i++) {
      blocks.push(
        <div
          key={i}
          className={`
            w-3 h-3 sm:w-4 sm:h-4 rounded-sm
            ${isPlaced 
              ? 'bg-green-500 dark:bg-green-400' 
              : isSelected 
                ? 'bg-blue-600 dark:bg-blue-400' 
                : 'bg-gray-400 dark:bg-gray-500'
            }
          `}
        />
      )
    }
    return blocks
  }

  return (
    <button
      type="button"
      data-testid={`ship-item-${shipType}`}
      onClick={onSelect}
      disabled={disabled || isPlaced}
      className={`
        w-full p-2 sm:p-3 rounded-lg
        flex items-center gap-2 sm:gap-3
        transition-all duration-150
        ${isPlaced
          ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
          : isSelected
            ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-600'
            : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-blue-500
      `}
      aria-label={`${name} - ${size}칸 - ${isPlaced ? '배치됨' : '배치 대기'}`}
      aria-pressed={isSelected}
    >
      {/* Ship preview blocks */}
      <div 
        className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} gap-0.5`}
        aria-hidden="true"
      >
        {renderShipPreview()}
      </div>

      {/* Ship info */}
      <div className="flex-1 text-left">
        <div className={`
          text-sm sm:text-base font-medium
          ${isPlaced 
            ? 'text-green-700 dark:text-green-300' 
            : isSelected 
              ? 'text-blue-700 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-200'
          }
        `}>
          {name}
        </div>
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {size}칸
        </div>
      </div>

      {/* Status indicator */}
      <div 
        className={`
          px-2 py-1 rounded text-xs font-medium
          ${isPlaced
            ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }
        `}
      >
        {isPlaced ? '배치됨' : '미배치'}
      </div>
    </button>
  )
}
