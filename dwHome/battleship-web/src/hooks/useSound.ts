import { useState, useEffect, useCallback, useRef } from 'react'
import { SoundManager, getSoundManager } from '../utils/sound'
import type { SoundType } from '../utils/sound'

export function useSound(): {
  play: (type: SoundType) => void
  muted: boolean
  setMuted: (muted: boolean) => void
  volume: number
  setVolume: (volume: number) => void
  init: () => Promise<void>
  isInitialized: boolean
} {
  const soundManager = useRef<SoundManager>(getSoundManager())
  const [muted, setMutedState] = useState(soundManager.current.getMuted())
  const [volume, setVolumeState] = useState(soundManager.current.getVolume())
  const [isInitialized, setIsInitialized] = useState(soundManager.current.isInitialized())

  useEffect(() => {
    // Auto-initialize on first user interaction
    const handleUserInteraction = () => {
      if (!isInitialized) {
        soundManager.current.init().then(() => {
          setIsInitialized(true)
        })
      }
    }

    window.addEventListener('click', handleUserInteraction, { once: true })
    window.addEventListener('keydown', handleUserInteraction, { once: true })

    return () => {
      window.removeEventListener('click', handleUserInteraction)
      window.removeEventListener('keydown', handleUserInteraction)
    }
  }, [isInitialized])

  const play = useCallback((type: SoundType) => {
    soundManager.current.play(type)
  }, [])

  const setMuted = useCallback((newMuted: boolean) => {
    soundManager.current.setMuted(newMuted)
    setMutedState(newMuted)
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    soundManager.current.setVolume(newVolume)
    setVolumeState(newVolume)
  }, [])

  const init = useCallback(async () => {
    await soundManager.current.init()
    setIsInitialized(true)
  }, [])

  return {
    play,
    muted,
    setMuted,
    volume,
    setVolume,
    init,
    isInitialized
  }
}
