import { useState, useCallback, useEffect } from 'react'
import type { GameState, Ship, Difficulty, Position, Theme, ShipType } from './types/game'
import { SHIP_SIZES, SHIP_ORDER, BOARD_SIZE } from './types/game'
import { ShipPlacement } from './components/ShipPlacement'
import { GameBoard } from './components/GameBoard'
import { GameControls } from './components/GameControls'
import { Customization } from './components/Customization'
import { createEmptyBoard, placeShip, isValidPosition, checkCollision } from './utils/gameLogic'
import { getEasyAIMove } from './utils/ai/easy'
import { createMediumAIState, getMediumAIMove, recordHit } from './utils/ai/medium'
import { getHardAIMove } from './utils/ai/hard'
import { playSound, setMuted } from './utils/sound'
import { saveGameResult, getStats, resetStats } from './utils/stats'
import './App.css'

function getRandomPos(): Position {
  return [Math.floor(Math.random() * BOARD_SIZE), Math.floor(Math.random() * BOARD_SIZE)]
}

function generateRandomShips(): Ship[] {
  const ships: Ship[] = []
  let board = createEmptyBoard()

  SHIP_ORDER.forEach((type) => {
    let placed = false
    let attempts = 0

    while (!placed && attempts < 100) {
      const startPos = getRandomPos()
      const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical'
      const size = SHIP_SIZES[type]
      const positions: Position[] = []

      for (let i = 0; i < size; i++) {
        const row = orientation === 'horizontal' ? startPos[0] : startPos[0] + i
        const col = orientation === 'horizontal' ? startPos[1] + i : startPos[1]
        positions.push([row, col])
      }

      if (isValidPosition(positions) && !checkCollision(board, positions)) {
        const ship: Ship = {
          id: `ship-${type}`,
          type,
          positions,
          hits: 0,
          sunk: false,
          size,
        }
        ships.push(ship)
        board = placeShip(board, ship)
        placed = true
      }
      attempts++
    }
  })

  return ships
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'setup',
    player: { board: createEmptyBoard(), ships: [], shipsRemaining: 5 },
    enemy: { board: createEmptyBoard(), ships: [], shipsRemaining: 5 },
    currentTurn: 'player',
    difficulty: 'medium',
  })

  const [isMuted, setIsMuted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<Theme>('classic')
  const [showCustomization, setShowCustomization] = useState(false)
  const [playerShips, setPlayerShips] = useState<Ship[]>([])
  const [aiPreviousShots, setAiPreviousShots] = useState<Set<string>>(new Set())
  const [mediumAiState, setMediumAiState] = useState(() => createMediumAIState())

  const stats = getStats()

  // Sync muted state with sound manager
  useEffect(() => {
    setMuted(isMuted)
  }, [isMuted])

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  const handleShipsPlaced = useCallback((ships: Ship[]) => {
    setPlayerShips(ships)
  }, [])

  const handleLoadPreset = useCallback((presetShips: { type: ShipType; positions: Position[] }[]) => {
    const ships: Ship[] = presetShips.map((p) => ({
      id: `ship-${p.type}`,
      type: p.type,
      positions: p.positions,
      hits: 0,
      sunk: false,
      size: SHIP_SIZES[p.type],
    }))
    setPlayerShips(ships)
  }, [])

  const handleStartGame = useCallback(() => {
    if (playerShips.length !== 5) return

    let playerBoard = createEmptyBoard()
    playerShips.forEach((ship) => {
      playerBoard = placeShip(playerBoard, ship)
    })

    const enemyShips = generateRandomShips()
    let enemyBoard = createEmptyBoard()
    enemyShips.forEach((ship) => {
      enemyBoard = placeShip(enemyBoard, ship)
    })

    setGameState({
      phase: 'playing',
      player: { board: playerBoard, ships: playerShips, shipsRemaining: 5 },
      enemy: { board: enemyBoard, ships: enemyShips, shipsRemaining: 5 },
      currentTurn: 'player',
      difficulty: gameState.difficulty,
    })
    setAiPreviousShots(new Set())
    setMediumAiState(createMediumAIState())
  }, [playerShips, gameState.difficulty])

  const handlePlayerFire = useCallback((row: number, col: number) => {
    if (gameState.phase !== 'playing' || gameState.currentTurn !== 'player') return

    const cell = gameState.enemy.board[row]?.[col]
    if (!cell || cell.status === 'hit' || cell.status === 'miss') return

    const newBoard = gameState.enemy.board.map((r) => r.map((c) => ({ ...c })))
    newBoard[row][col] = {
      status: cell.status === 'ship' ? 'hit' : 'miss',
      shipId: cell.shipId,
    }

    const updatedShips = gameState.enemy.ships.map((ship) => {
      const hitOnThisShip = ship.positions.some(([r, c]) => r === row && c === col)
      if (!hitOnThisShip) return ship
      const newHits = ship.hits + 1
      const isSunk = newHits >= ship.size
      if (isSunk) playSound('sunk')
      else playSound('hit')
      return { ...ship, hits: newHits, sunk: isSunk }
    })

    const shipsRemaining = updatedShips.filter((s) => !s.sunk).length

    if (shipsRemaining === 0) {
      playSound('win')
      saveGameResult('win', gameState.difficulty)
      setGameState((prev) => ({
        ...prev,
        phase: 'gameover',
        winner: 'player',
        enemy: { ...prev.enemy, board: newBoard, ships: updatedShips, shipsRemaining: 0 },
      }))
      return
    }

    playSound('miss')
    setGameState((prev) => ({
      ...prev,
      enemy: { ...prev.enemy, board: newBoard, ships: updatedShips, shipsRemaining },
      currentTurn: 'enemy',
    }))
  }, [gameState])

  // AI turn effect
  useEffect(() => {
    if (gameState.phase !== 'playing' || gameState.currentTurn !== 'enemy') return

    const timer = setTimeout(() => {
      let position: Position | null = null

      if (gameState.difficulty === 'easy') {
        position = getEasyAIMove(gameState.player.board, aiPreviousShots)
      } else if (gameState.difficulty === 'medium') {
        position = getMediumAIMove(gameState.player.board, mediumAiState)
      } else {
        // Hard AI - need to pass remaining ship types
        const remainingShips = gameState.player.ships
          .filter((s) => !s.sunk)
          .map((s) => s.type)
        position = getHardAIMove(gameState.player.board, aiPreviousShots, remainingShips)
      }

      if (!position) {
        setGameState((prev) => ({ ...prev, currentTurn: 'player' }))
        return
      }

      const [aiRow, aiCol] = position
      const shotKey = `${aiRow},${aiCol}`

      setAiPreviousShots((prev) => new Set([...prev, shotKey]))

      const cellStatus = gameState.player.board[aiRow]?.[aiCol]?.status
      const isHit = cellStatus === 'ship'

      // For medium AI, record the result
      if (gameState.difficulty === 'medium' && isHit) {
        setMediumAiState((prev) => {
          const newState = { ...prev }
          recordHit([aiRow, aiCol], newState)
          return newState
        })
      }

      const newBoard = gameState.player.board.map((r) => r.map((c) => ({ ...c })))
      newBoard[aiRow][aiCol] = {
        status: isHit ? 'hit' : 'miss',
        shipId: gameState.player.board[aiRow][aiCol].shipId,
      }

      const updatedShips = gameState.player.ships.map((ship) => {
        const hitOnThisShip = ship.positions.some(([r, c]) => r === aiRow && c === aiCol)
        if (!hitOnThisShip) return ship
        const newHits = ship.hits + 1
        const isSunk = newHits >= ship.size
        if (isSunk) playSound('sunk')
        else playSound('hit')
        return { ...ship, hits: newHits, sunk: isSunk }
      })

      const shipsRemaining = updatedShips.filter((s) => !s.sunk).length

      if (shipsRemaining === 0) {
        playSound('lose')
        saveGameResult('lose', gameState.difficulty)
        setGameState((prev) => ({
          ...prev,
          phase: 'gameover',
          winner: 'enemy',
          player: { ...prev.player, board: newBoard, ships: updatedShips, shipsRemaining: 0 },
        }))
        return
      }

      setGameState((prev) => ({
        ...prev,
        player: { ...prev.player, board: newBoard, ships: updatedShips, shipsRemaining },
        currentTurn: 'player',
      }))
    }, 800)

    return () => clearTimeout(timer)
  }, [gameState, aiPreviousShots, mediumAiState])

  const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
    setGameState((prev) => ({ ...prev, difficulty }))
  }, [])

  const handleRestart = useCallback(() => {
    setGameState({
      phase: 'setup',
      player: { board: createEmptyBoard(), ships: [], shipsRemaining: 5 },
      enemy: { board: createEmptyBoard(), ships: [], shipsRemaining: 5 },
      currentTurn: 'player',
      difficulty: gameState.difficulty,
    })
    setPlayerShips([])
    setAiPreviousShots(new Set())
    setMediumAiState(createMediumAIState())
  }, [gameState.difficulty])

  const handleThemeChange = useCallback((theme: Theme) => {
    setCurrentTheme(theme)
  }, [])

  const handleResetStats = useCallback(() => {
    if (window.confirm('모든 통계를 초기화하시겠습니까?')) {
      resetStats()
      // Force re-render to show reset stats
      setGameState((prev) => ({ ...prev }))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            🚢 배틀십
          </h1>
          <button
            type="button"
            onClick={() => setShowCustomization(!showCustomization)}
            className="px-4 py-2 rounded-lg font-medium transition-colors
              bg-gray-200 hover:bg-gray-300 text-gray-800
              dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            aria-label="커스터마이징"
          >
            ⚙️ 설정
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Game Controls */}
        <div className="mb-6">
          <GameControls
            difficulty={gameState.difficulty}
            onDifficultyChange={handleDifficultyChange}
            onStart={handleStartGame}
            onRestart={handleRestart}
            gamePhase={gameState.phase}
            isMuted={isMuted}
            onMuteToggle={handleMuteToggle}
            disabled={gameState.phase === 'playing'}
          />
        </div>

        {/* Game Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Game Panel */}
          <div className="flex-1">
            {gameState.phase === 'setup' && (
              <ShipPlacement
                onShipsPlaced={handleShipsPlaced}
                initialShips={playerShips}
                disabled={false}
              />
            )}

            {gameState.phase === 'playing' && (
              <GameBoard
                gameState={gameState}
                onFire={handlePlayerFire}
                isPlayerTurn={gameState.currentTurn === 'player'}
              />
            )}

            {gameState.phase === 'gameover' && (
              <div className="flex flex-col items-center gap-6">
                <GameBoard
                  gameState={gameState}
                  onFire={() => {}}
                  isPlayerTurn={false}
                />
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-6 py-3 rounded-lg font-medium text-lg
                    bg-blue-600 hover:bg-blue-700 text-white
                    dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  다시 시작
                </button>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="lg:w-72 flex-shrink-0">
            {/* Stats Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
                📊 통계
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">게임 수:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {stats.gamesPlayed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">승리:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {stats.wins}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">패배:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {stats.losses}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">승률:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {stats.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">연승:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {stats.currentStreak}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">최고 연승:</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {stats.bestStreak}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetStats}
                className="mt-4 w-full py-2 px-4 rounded-lg font-medium text-sm
                  bg-gray-200 hover:bg-gray-300 text-gray-800
                  dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
              >
                통계 초기화
              </button>
            </div>

            {/* Customization Panel (collapsible) */}
            {showCustomization && (
              <Customization
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
                onLoadPreset={handleLoadPreset}
                currentShips={playerShips}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>배틀십 웹 게임 | React + TypeScript + Vite</p>
      </footer>
    </div>
  )
}

export default App
