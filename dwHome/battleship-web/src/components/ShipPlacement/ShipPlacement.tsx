import { useState, useCallback, useEffect, useMemo } from 'react'
import type { Ship, ShipType, Orientation, Position, Board } from '../../types/game'
import { SHIP_SIZES } from '../../types/game'
import { Grid } from '../Grid'
import { ShipItem } from './ShipItem'
import {
  createEmptyBoard,
  canPlaceShip,
  generateShipPositions,
  placeShip,
  getRandomPosition,
} from '../../utils/gameLogic'

export interface ShipPlacementProps {
  /** Callback when all ships are placed */
  onShipsPlaced: (ships: Ship[]) => void
  /** Initial ships to load (for presets) */
  initialShips?: Ship[]
  /** Disable all interactions */
  disabled?: boolean
}

// Ship types in order
const SHIP_ORDER: ShipType[] = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer']

export function ShipPlacement({
  onShipsPlaced,
  initialShips = [],
  disabled = false,
}: ShipPlacementProps) {
  // Initialize board and ships state
  const [board, setBoard] = useState<Board>(() => createEmptyBoard())
  const [ships, setShips] = useState<Map<ShipType, Ship>>(() => {
    const map = new Map<ShipType, Ship>()
    SHIP_ORDER.forEach((type) => {
      const existing = initialShips.find((s) => s.type === type)
      if (existing) {
        map.set(type, existing)
      } else {
        map.set(type, {
          id: `${type}-ship`,
          type,
          positions: [],
          hits: 0,
          sunk: false,
          size: SHIP_SIZES[type],
        })
      }
    })
    return map
  })

  // Selection and orientation state
  const [selectedShip, setSelectedShip] = useState<ShipType | null>(null)
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Calculate placed count
  const placedCount = useMemo(() => {
    let count = 0
    ships.forEach((ship) => {
      if (ship.positions.length > 0) count++
    })
    return count
  }, [ships])

  // Initialize board with initial ships
  useEffect(() => {
    if (initialShips.length > 0) {
      let newBoard = createEmptyBoard()
      initialShips.forEach((ship) => {
        if (ship.positions.length > 0) {
          newBoard = placeShip(newBoard, ship)
        }
      })
      setBoard(newBoard)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Call onShipsPlaced when all ships are placed
  useEffect(() => {
    if (placedCount === 5) {
      const allShips = Array.from(ships.values())
      onShipsPlaced(allShips)
    }
  }, [placedCount, ships, onShipsPlaced])

  // Keyboard handler for rotation
  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' && selectedShip) {
        setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedShip, disabled])

  // Calculate preview positions for hover
  const previewPositions = useMemo((): Position[] => {
    if (!selectedShip || !hoverPosition) return []
    return generateShipPositions(board, selectedShip, hoverPosition, orientation)
  }, [selectedShip, hoverPosition, orientation, board])

  // Check if preview positions are valid
  const isPreviewValid = useMemo((): boolean => {
    if (!selectedShip || previewPositions.length === 0) return false
    const currentShip = ships.get(selectedShip)
    if (!currentShip) return false
    return canPlaceShip(board, selectedShip, hoverPosition!, orientation)
  }, [selectedShip, previewPositions, board, orientation, hoverPosition, ships])

  // Handle ship selection
  const handleSelectShip = useCallback((type: ShipType) => {
    if (disabled) return
    const ship = ships.get(type)
    if (ship?.positions.length === 0) {
      setSelectedShip(type)
      setErrorMessage(null)
    }
  }, [disabled, ships])

  // Handle cell click to place ship
  const handleCellClick = useCallback((row: number, col: number) => {
    if (disabled || !selectedShip) return

    const position: Position = [row, col]
    const ship = ships.get(selectedShip)
    
    if (!ship) return

    // Check if placement is valid
    if (!canPlaceShip(board, selectedShip, position, orientation)) {
      // Determine error type
      const positions = generateShipPositions(board, selectedShip, position, orientation)
      if (positions.length === 0) {
        setErrorMessage('함선이 보드 밖으로 나갑니다')
      } else {
        setErrorMessage('다른 함선과 겹칩니다')
      }
      return
    }

    // Generate positions and update state
    const newPositions = generateShipPositions(board, selectedShip, position, orientation)
    const updatedShip: Ship = {
      ...ship,
      positions: newPositions,
    }

    // Update board
    const newBoard = placeShip(board, updatedShip)
    setBoard(newBoard)

    // Update ships map
    setShips((prev) => {
      const newMap = new Map(prev)
      newMap.set(selectedShip, updatedShip)
      return newMap
    })

    // Clear selection and error
    setSelectedShip(null)
    setHoverPosition(null)
    setErrorMessage(null)
  }, [disabled, selectedShip, ships, board, orientation])

  // Handle rotate button
  const handleRotate = useCallback(() => {
    if (disabled || !selectedShip) return
    setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
  }, [disabled, selectedShip])

  // Handle randomize
  const handleRandomize = useCallback(() => {
    if (disabled) return

    let newBoard = createEmptyBoard()
    const newShips = new Map<ShipType, Ship>()
    const maxAttempts = 100

    SHIP_ORDER.forEach((type) => {
      let placed = false
      let attempts = 0

      while (!placed && attempts < maxAttempts) {
        const pos = getRandomPosition()
        const orient: Orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical'

        if (canPlaceShip(newBoard, type, pos, orient)) {
          const positions = generateShipPositions(newBoard, type, pos, orient)
          const newShip: Ship = {
            id: `${type}-ship`,
            type,
            positions,
            hits: 0,
            sunk: false,
            size: SHIP_SIZES[type],
          }
          newBoard = placeShip(newBoard, newShip)
          newShips.set(type, newShip)
          placed = true
        }
        attempts++
      }
    })

    setBoard(newBoard)
    setShips(newShips)
    setSelectedShip(null)
    setHoverPosition(null)
    setErrorMessage(null)
  }, [disabled])

  // Handle clear
  const handleClear = useCallback(() => {
    if (disabled) return

    setBoard(createEmptyBoard())
    setShips((prev) => {
      const newMap = new Map<ShipType, Ship>()
      prev.forEach((ship, type) => {
        newMap.set(type, {
          ...ship,
          positions: [],
        })
      })
      return newMap
    })
    setSelectedShip(null)
    setHoverPosition(null)
    setErrorMessage(null)
  }, [disabled])

  // Determine highlight and invalid positions
  const highlightPositions = isPreviewValid ? previewPositions : []
  const invalidPositions = !isPreviewValid && previewPositions.length > 0 ? previewPositions : []

  return (
    <div 
      className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4"
      role="region"
      aria-label="함선 배치"
    >
      {/* Ship Inventory Panel */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
            함선 목록
          </h2>

          {/* Placement counter */}
          <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">배치 현황: </span>
            <span 
              className={`font-bold ${placedCount === 5 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}
              data-testid="placement-counter"
            >
              {placedCount} / 5
            </span>
            {placedCount === 5 && (
              <span className="ml-2 text-green-600 dark:text-green-400 text-sm">완료!</span>
            )}
          </div>

          {/* Ship list */}
          <div className="space-y-2 mb-4">
            {SHIP_ORDER.map((type) => {
              const ship = ships.get(type)
              if (!ship) return null
              return (
                <ShipItem
                  key={type}
                  shipType={type}
                  isPlaced={ship.positions.length > 0}
                  isSelected={selectedShip === type}
                  orientation={orientation}
                  onSelect={() => handleSelectShip(type)}
                  disabled={disabled}
                />
              )
            })}
          </div>

          {/* Orientation indicator */}
          <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">방향: </span>
            <span 
              className="font-medium text-gray-800 dark:text-gray-200"
              data-testid="orientation-indicator"
            >
              {orientation === 'horizontal' ? '가로' : '세로'}
            </span>
          </div>

          {/* Control buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleRotate}
              disabled={disabled || !selectedShip}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors
                bg-blue-500 hover:bg-blue-600 text-white
                disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
              aria-label="함선 회전"
            >
              회전 (R)
            </button>

            <button
              type="button"
              onClick={handleRandomize}
              disabled={disabled}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors
                bg-purple-500 hover:bg-purple-600 text-white
                disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
              aria-label="무작위 배치"
            >
              무작위 배치
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors
                bg-red-500 hover:bg-red-600 text-white
                disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
              aria-label="전체 초기화"
            >
              전체 초기화
            </button>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mt-4 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Grid Panel */}
      <div className="flex-1 flex flex-col items-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 text-center">
            배치 보드
          </h2>

          <div
            onMouseLeave={() => setHoverPosition(null)}
            data-testid="placement-grid"
          >
            <Grid
              board={board}
              onCellClick={handleCellClick}
              isInteractive={!disabled && selectedShip !== null}
              label="내 함대"
              showShips={true}
              highlightPositions={highlightPositions}
              invalidPositions={invalidPositions}
              dataTestId="placement-grid"
            />
          </div>

          {/* Instructions */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            <p>함선을 선택한 후 보드의 칸을 클릭하여 배치하세요.</p>
            <p className="mt-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">R</kbd>
              키로 회전
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
