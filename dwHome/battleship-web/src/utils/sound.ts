export type SoundType = 'hit' | 'miss' | 'sunk' | 'win' | 'lose' | 'click'

interface SoundConfig {
  frequency: number
  duration: number
  type: OscillatorType
  attack?: number
  decay?: number
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  hit: { frequency: 440, duration: 0.15, type: 'square', attack: 0.01, decay: 0.1 },
  miss: { frequency: 200, duration: 0.2, type: 'sine', attack: 0.01, decay: 0.15 },
  sunk: { frequency: 300, duration: 0.5, type: 'sawtooth', attack: 0.01, decay: 0.4 },
  win: { frequency: 523, duration: 0.8, type: 'sine', attack: 0.05, decay: 0.6 },
  lose: { frequency: 150, duration: 1.0, type: 'triangle', attack: 0.05, decay: 0.8 },
  click: { frequency: 800, duration: 0.05, type: 'square', attack: 0.001, decay: 0.04 }
}

export class SoundManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<SoundType, AudioBuffer> = new Map()
  private muted: boolean = false
  private volume: number = 0.5
  private initialized: boolean = false

  async init(): Promise<void> {
    if (this.initialized) return
    
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      
      // Generate all sounds using Web Audio API
      for (const type of Object.keys(SOUND_CONFIGS) as SoundType[]) {
        const buffer = this.generateSound(SOUND_CONFIGS[type])
        this.sounds.set(type, buffer)
      }
      
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize SoundManager:', error)
    }
  }

  private generateSound(config: SoundConfig): AudioBuffer {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized')
    }

    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * config.duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    const attack = config.attack ?? 0.01
    const decay = config.decay ?? config.duration * 0.5
    const attackSamples = attack * sampleRate
    const decaySamples = decay * sampleRate

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      let envelope = 1

      // Attack
      if (i < attackSamples) {
        envelope = i / attackSamples
      }
      // Decay
      else if (i > length - decaySamples) {
        envelope = (length - i) / decaySamples
      }

      // Generate waveform based on type
      let sample = 0
      const phase = 2 * Math.PI * config.frequency * t

      switch (config.type) {
        case 'sine':
          sample = Math.sin(phase)
          break
        case 'square':
          sample = Math.sin(phase) > 0 ? 1 : -1
          break
        case 'sawtooth':
          sample = 2 * ((config.frequency * t) % 1) - 1
          break
        case 'triangle':
          sample = 2 * Math.abs(2 * ((config.frequency * t) % 1) - 1) - 1
          break
      }

      data[i] = sample * envelope * 0.5
    }

    return buffer
  }

  async loadSound(type: SoundType, url: string): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized')
    }

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      this.sounds.set(type, audioBuffer)
    } catch (error) {
      console.error(`Failed to load sound ${type}:`, error)
      // Fall back to generated sound
      const buffer = this.generateSound(SOUND_CONFIGS[type])
      this.sounds.set(type, buffer)
    }
  }

  play(type: SoundType): void {
    if (this.muted || !this.audioContext || !this.initialized) return

    const buffer = this.sounds.get(type)
    if (!buffer) return

    try {
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }

      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = buffer
      gainNode.gain.value = this.volume

      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      source.start(0)
    } catch (error) {
      console.error(`Failed to play sound ${type}:`, error)
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  getMuted(): boolean {
    return this.muted
  }

  getVolume(): number {
    return this.volume
  }

  isInitialized(): boolean {
    return this.initialized
  }
}

// Singleton instance
let soundManagerInstance: SoundManager | null = null

export function getSoundManager(): SoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager()
  }
  return soundManagerInstance
}

// Convenience functions
export function playSound(type: SoundType): void {
  const manager = getSoundManager()
  if (!manager.isInitialized()) {
    manager.init().then(() => {
      manager.play(type)
    })
  } else {
    manager.play(type)
  }
}

export function setMuted(muted: boolean): void {
  getSoundManager().setMuted(muted)
}
