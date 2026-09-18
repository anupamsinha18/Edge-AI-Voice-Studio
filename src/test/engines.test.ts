import { describe, it, expect, beforeEach } from 'vitest'
import { speechEngineRegistry } from '../core/SpeechEngineRegistry'
import { estimateDuration } from '../utils/audio'

describe('Audio Utilities', () => {
  it('should correctly estimate duration based on text length and speed', () => {
    // base estimation WPM/chars calculation:
    // length = 12.8 chars, speed = 1.0 => should estimate ~1.0 sec
    const est1 = estimateDuration(13, 1.0)
    expect(est1).toBeCloseTo(1.0, 1)

    // speed = 2.0 => should estimate ~0.5 sec
    const est2 = estimateDuration(13, 2.0)
    expect(est2).toBeCloseTo(0.5, 1)

    // empty text => should estimate 0
    expect(estimateDuration(0)).toBe(0)
  })
})

describe('Speech Engine Registry', () => {
  it('should list all available speech engines', () => {
    const engines = speechEngineRegistry.getAvailableEngines()
    expect(engines.length).toBe(3)
    
    const ids = engines.map(e => e.id)
    expect(ids).toContain('mock')
    expect(ids).toContain('browser')
    expect(ids).toContain('kokoro')
  })

  it('should fetch engines by ID', () => {
    const mockEngine = speechEngineRegistry.getEngine('mock')
    expect(mockEngine).toBeDefined()
    expect(mockEngine?.id).toBe('mock')
  })

  it('should switch the active engine', async () => {
    const engine = await speechEngineRegistry.setActiveEngine('mock')
    expect(engine.id).toBe('mock')
    expect(speechEngineRegistry.getActiveEngine().id).toBe('mock')
  })
})

describe('Mock Speech Engine', () => {
  beforeEach(async () => {
    const mock = speechEngineRegistry.getEngine('mock')
    if (mock && !mock.isReady()) {
      await mock.initialize()
    }
  })

  it('should generate simulated audio tracks', async () => {
    const mock = speechEngineRegistry.getEngine('mock')!
    expect(mock.isReady()).toBe(true)

    const text = 'Hello world'
    const result = await mock.generate(text, {
      voiceId: 'mock_female_1',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0
    })

    expect(result.audioBlob).toBeInstanceOf(Blob)
    expect(result.audioBlob.type).toBe('audio/wav')
    expect(result.audioUrl).toContain('blob:')
    expect(result.duration).toBeGreaterThan(0)
    expect(result.sampleRate).toBe(22050)
  })
})
