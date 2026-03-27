import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SoundManager, getSoundManager } from './sound'

// Mock Web Audio API
const mockCreateBufferSource = vi.fn()
const mockCreateGain = vi.fn()
const mockCreateBuffer = vi.fn()
const mockResume = vi.fn()

class MockAudioContext {
  state = 'running'
  sampleRate = 44100
  
  createBuffer = mockCreateBuffer.mockImplementation((channels: number, length: number, sampleRate: number) => ({
    getChannelData: () => new Float32Array(length),
    length,
    sampleRate,
    numberOfChannels: channels
  }))
  
  createBufferSource = mockCreateBufferSource.mockImplementation(() => ({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn()
  }))
  
  createGain = mockCreateGain.mockImplementation(() => ({
    gain: { value: 0.5 },
    connect: vi.fn()
  }))
  
  resume = mockResume
}

// Store original
const originalAudioContext = window.AudioContext

describe('SoundManager', () => {
  let soundManager: SoundManager

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Mock AudioContext constructor
    window.AudioContext = MockAudioContext as unknown as typeof AudioContext
    
    // Create new instance for each test
    soundManager = new SoundManager()
  })

  afterEach(() => {
    // Restore original
    window.AudioContext = originalAudioContext
  })

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await soundManager.init()
      
      expect(soundManager.isInitialized()).toBe(true)
    })

    it('should not reinitialize if already initialized', async () => {
      await soundManager.init()
      const firstContextCount = mockCreateBuffer.mock.calls.length
      
      await soundManager.init()
      
      // Should not create more buffers since already initialized
      expect(mockCreateBuffer.mock.calls.length).toBe(firstContextCount)
    })

    it('should create AudioContext on init', async () => {
      await soundManager.init()
      
      expect(mockCreateBuffer).toHaveBeenCalled()
    })
  })

  describe('mute/unmute functionality', () => {
    beforeEach(async () => {
      await soundManager.init()
    })

    it('should start unmuted', () => {
      expect(soundManager.getMuted()).toBe(false)
    })

    it('should set muted state', () => {
      soundManager.setMuted(true)
      expect(soundManager.getMuted()).toBe(true)
    })

    it('should toggle muted state', () => {
      soundManager.setMuted(true)
      expect(soundManager.getMuted()).toBe(true)
      
      soundManager.setMuted(false)
      expect(soundManager.getMuted()).toBe(false)
    })

    it('should not play sound when muted', async () => {
      soundManager.setMuted(true)
      
      // Clear previous calls from init
      mockCreateBufferSource.mockClear()
      
      soundManager.play('hit')
      
      expect(mockCreateBufferSource).not.toHaveBeenCalled()
    })
  })

  describe('volume setting', () => {
    beforeEach(async () => {
      await soundManager.init()
    })

    it('should have default volume of 0.5', () => {
      expect(soundManager.getVolume()).toBe(0.5)
    })

    it('should set volume', () => {
      soundManager.setVolume(0.8)
      expect(soundManager.getVolume()).toBe(0.8)
    })

    it('should clamp volume to 0-1 range', () => {
      soundManager.setVolume(-0.5)
      expect(soundManager.getVolume()).toBe(0)
      
      soundManager.setVolume(1.5)
      expect(soundManager.getVolume()).toBe(1)
    })
  })

  describe('sound playback', () => {
    beforeEach(async () => {
      await soundManager.init()
      // Clear calls from init
      mockCreateBufferSource.mockClear()
      mockCreateGain.mockClear()
    })

    it('should play sound when not muted', () => {
      soundManager.play('hit')
      
      expect(mockCreateBufferSource).toHaveBeenCalled()
      expect(mockCreateGain).toHaveBeenCalled()
    })

    it('should not play when not initialized', () => {
      const uninitializedManager = new SoundManager()
      
      mockCreateBufferSource.mockClear()
      uninitializedManager.play('hit')
      
      expect(mockCreateBufferSource).not.toHaveBeenCalled()
    })
  })

  describe('getSoundManager singleton', () => {
    it('should return the same instance', () => {
      // Note: This test may be affected by other tests creating instances
      // In a real scenario, we'd reset the singleton between tests
      const instance1 = getSoundManager()
      const instance2 = getSoundManager()
      
      expect(instance1).toBe(instance2)
    })
  })
})
