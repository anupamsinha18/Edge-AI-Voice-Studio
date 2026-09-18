import type { SpeechEngine } from './types'
import { MockSpeechEngine } from './engines/MockSpeechEngine'
import { BrowserSpeechEngine } from './engines/BrowserSpeechEngine'
import { KokoroSpeechEngine } from './engines/KokoroSpeechEngine'

class SpeechEngineRegistry {
  private engines = new Map<string, SpeechEngine>()
  private activeEngineId = 'mock' // Default to mock for instant offline startup

  constructor() {
    this.register(new MockSpeechEngine())
    this.register(new BrowserSpeechEngine())
    this.register(new KokoroSpeechEngine())
  }

  register(engine: SpeechEngine) {
    this.engines.set(engine.id, engine)
  }

  getEngine(id: string): SpeechEngine | undefined {
    return this.engines.get(id)
  }

  getAvailableEngines(): SpeechEngine[] {
    return Array.from(this.engines.values())
  }

  getActiveEngine(): SpeechEngine {
    const engine = this.getEngine(this.activeEngineId)
    if (!engine) {
      throw new Error(`Active speech engine "${this.activeEngineId}" is not registered.`)
    }
    return engine
  }

  async setActiveEngine(id: string): Promise<SpeechEngine> {
    const engine = this.getEngine(id)
    if (!engine) {
      throw new Error(`Speech engine "${id}" is not registered.`)
    }
    
    if (!engine.isReady()) {
      await engine.initialize()
    }
    
    this.activeEngineId = id
    return engine
  }
}

export const speechEngineRegistry = new SpeechEngineRegistry()
