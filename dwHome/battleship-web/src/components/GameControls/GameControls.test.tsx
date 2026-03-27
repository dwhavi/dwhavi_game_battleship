import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameControls } from './GameControls'
import type { Difficulty, GamePhase } from '../../types/game'

describe('GameControls Component', () => {
  const defaultProps = {
    difficulty: 'medium' as Difficulty,
    onDifficultyChange: vi.fn(),
    onStart: vi.fn(),
    onRestart: vi.fn(),
    gamePhase: 'setup' as GamePhase,
    isMuted: false,
    onMuteToggle: vi.fn(),
    disabled: false,
  }

  describe('difficulty selector', () => {
    it('renders difficulty selector', () => {
      render(<GameControls {...defaultProps} />)
      expect(screen.getByTestId('difficulty-selector')).toBeInTheDocument()
    })

    it('displays all difficulty options (Easy/Medium/Hard)', () => {
      render(<GameControls {...defaultProps} />)
      const selector = screen.getByTestId('difficulty-selector')
      expect(selector).toHaveTextContent('Easy')
      expect(selector).toHaveTextContent('Medium')
      expect(selector).toHaveTextContent('Hard')
    })

    it('shows currently selected difficulty', () => {
      render(<GameControls {...defaultProps} difficulty="hard" />)
      const selector = screen.getByTestId('difficulty-selector')
      expect(selector).toHaveValue('hard')
    })
  })

  describe('difficulty change', () => {
    it('calls onDifficultyChange when difficulty is changed', async () => {
      const user = userEvent.setup()
      const onDifficultyChange = vi.fn()
      render(<GameControls {...defaultProps} onDifficultyChange={onDifficultyChange} />)

      const selector = screen.getByTestId('difficulty-selector')
      await user.selectOptions(selector, 'easy')

      expect(onDifficultyChange).toHaveBeenCalledWith('easy')
    })
  })

  describe('start button', () => {
    it('renders start button', () => {
      render(<GameControls {...defaultProps} gamePhase="setup" />)
      expect(screen.getByTestId('start-button')).toBeInTheDocument()
    })

    it('calls onStart when start button is clicked', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      render(<GameControls {...defaultProps} gamePhase="setup" onStart={onStart} />)

      await user.click(screen.getByTestId('start-button'))
      expect(onStart).toHaveBeenCalledTimes(1)
    })

    it('start button is disabled when disabled prop is true', () => {
      render(<GameControls {...defaultProps} gamePhase="setup" disabled={true} />)
      expect(screen.getByTestId('start-button')).toBeDisabled()
    })
  })

  describe('restart button', () => {
    it('renders restart button', () => {
      render(<GameControls {...defaultProps} />)
      expect(screen.getByTestId('restart-button')).toBeInTheDocument()
    })

    it('calls onRestart when restart button is clicked', async () => {
      const user = userEvent.setup()
      const onRestart = vi.fn()
      render(<GameControls {...defaultProps} onRestart={onRestart} />)

      await user.click(screen.getByTestId('restart-button'))
      expect(onRestart).toHaveBeenCalledTimes(1)
    })

    it('restart button is disabled when disabled prop is true', () => {
      render(<GameControls {...defaultProps} disabled={true} />)
      expect(screen.getByTestId('restart-button')).toBeDisabled()
    })
  })

  describe('mute toggle', () => {
    it('renders mute toggle button', () => {
      render(<GameControls {...defaultProps} />)
      expect(screen.getByTestId('mute-button')).toBeInTheDocument()
    })

    it('calls onMuteToggle when mute button is clicked', async () => {
      const user = userEvent.setup()
      const onMuteToggle = vi.fn()
      render(<GameControls {...defaultProps} onMuteToggle={onMuteToggle} />)

      await user.click(screen.getByTestId('mute-button'))
      expect(onMuteToggle).toHaveBeenCalledTimes(1)
    })

    it('shows unmuted state when isMuted is false', () => {
      render(<GameControls {...defaultProps} isMuted={false} />)
      const muteButton = screen.getByTestId('mute-button')
      expect(muteButton).toHaveAttribute('aria-label', expect.stringContaining('unmuted'))
    })

    it('shows muted state when isMuted is true', () => {
      render(<GameControls {...defaultProps} isMuted={true} />)
      const muteButton = screen.getByTestId('mute-button')
      expect(muteButton).toHaveAttribute('aria-label', expect.stringContaining('muted'))
    })
  })

  describe('game phase display', () => {
    it('shows current game phase', () => {
      render(<GameControls {...defaultProps} gamePhase="setup" />)
      expect(screen.getByTestId('game-phase')).toBeInTheDocument()
    })

    it('displays "Setup" when gamePhase is setup', () => {
      render(<GameControls {...defaultProps} gamePhase="setup" />)
      expect(screen.getByTestId('game-phase')).toHaveTextContent(/setup/i)
    })

    it('displays "Playing" when gamePhase is playing', () => {
      render(<GameControls {...defaultProps} gamePhase="playing" />)
      expect(screen.getByTestId('game-phase')).toHaveTextContent(/playing/i)
    })

    it('displays "Game Over" when gamePhase is gameover', () => {
      render(<GameControls {...defaultProps} gamePhase="gameover" />)
      expect(screen.getByTestId('game-phase')).toHaveTextContent(/game over/i)
    })
  })

  describe('disabled state', () => {
    it('disables difficulty selector when disabled is true', () => {
      render(<GameControls {...defaultProps} disabled={true} />)
      expect(screen.getByTestId('difficulty-selector')).toBeDisabled()
    })

    it('disables all buttons when disabled is true', () => {
      render(<GameControls {...defaultProps} disabled={true} />)
      expect(screen.getByTestId('start-button')).toBeDisabled()
      expect(screen.getByTestId('restart-button')).toBeDisabled()
      expect(screen.getByTestId('mute-button')).toBeDisabled()
    })
  })
})
