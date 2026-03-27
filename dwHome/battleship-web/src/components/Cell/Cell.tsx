import type { CellStatus } from '../../types/game'

export interface CellProps {
  /** Current status of the cell */
  status: CellStatus
  /** Click handler for the cell */
  onClick?: () => void
  /** Whether the cell should show hover effects */
  isHoverable?: boolean
  /** Whether the cell shows invalid placement state */
  isInvalid?: boolean
  /** Test ID for the cell element */
  dataTestId?: string
}

const statusStyles: Record<CellStatus, string> = {
  empty: 'bg-gray-200 dark:bg-gray-600',
  ship: 'bg-blue-800 dark:bg-blue-600',
  hit: 'bg-red-600',
  miss: 'bg-white dark:bg-gray-800',
}

const cellContent: Record<CellStatus, string> = {
  empty: '',
  ship: '',
  hit: '✕',
  miss: '●',
}

export function Cell({
  status,
  onClick,
  isHoverable = false,
  isInvalid = false,
  dataTestId = 'cell',
}: CellProps) {
  const baseStyles = 'w-8 h-8 sm:w-10 sm:h-10 border border-gray-400 flex items-center justify-center text-white font-bold transition-colors duration-150'
  
  const hoverStyles = isHoverable 
    ? 'hover:bg-blue-300 dark:hover:bg-blue-400 cursor-pointer' 
    : ''
  
  const invalidStyles = isInvalid ? 'bg-red-300 dark:bg-red-400' : ''
  
  const statusStyle = isInvalid ? '' : statusStyles[status]

  return (
    <button
      type="button"
      data-testid={dataTestId}
      className={`${baseStyles} ${statusStyle} ${hoverStyles} ${invalidStyles}`}
      onClick={onClick}
      disabled={!onClick}
      aria-label={`Cell ${status}${isInvalid ? ' (invalid placement)' : ''}`}
    >
      {cellContent[status]}
    </button>
  )
}
