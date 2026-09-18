import { describe, it, expect, beforeEach } from 'vitest'
import { useEngineStore } from '../store/engineStore'
import { useAudioStore } from '../store/audioStore'

describe('Zustand Engine Store', () => {
  beforeEach(() => {
    useEngineStore.setState({
      activeEngineId: 'mock',
      voices: [],
      activeVoiceId: '',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      currentResult: null,
      error: null
    })
  })

  it('should adjust speed, pitch, and volume properties', () => {
    useEngineStore.getState().setSpeed(1.5)
    useEngineStore.getState().setPitch(1.2)
    useEngineStore.getState().setVolume(0.8)
    
    const updated = useEngineStore.getState()
    expect(updated.speed).toBe(1.5)
    expect(updated.pitch).toBe(1.2)
    expect(updated.volume).toBe(0.8)
  })

  it('should load initial voice configuration for mock engine', async () => {
    await useEngineStore.getState().setEngine('mock')
    const updated = useEngineStore.getState()
    
    expect(updated.activeEngineId).toBe('mock')
    expect(updated.voices.length).toBeGreaterThan(0)
    expect(updated.activeVoiceId).toBe(updated.voices[0].id)
  })
})

describe('Zustand Audio Store', () => {
  beforeEach(() => {
    useAudioStore.getState().reset()
  })

  it('should toggle playing state parameters', () => {
    const store = useAudioStore.getState()
    expect(store.isPlaying).toBe(false)
    expect(store.currentTime).toBe(0)
  })
})
