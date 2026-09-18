import { create } from 'zustand'
import { speechEngineRegistry } from '../core/SpeechEngineRegistry'
import type { SpeechGenerationResult, Voice } from '../core/types'

interface EngineState {
  activeEngineId: string
  isInitializing: boolean
  isGenerating: boolean
  voices: Voice[]
  activeVoiceId: string
  speed: number
  pitch: number
  volume: number
  error: string | null
  currentResult: SpeechGenerationResult | null

  setEngine: (id: string) => Promise<void>
  setVoice: (id: string) => void
  setSpeed: (speed: number) => void
  setPitch: (pitch: number) => void
  setVolume: (volume: number) => void
  generateSpeech: (text: string) => Promise<void>
  clearGeneration: () => void
}

export const useEngineStore = create<EngineState>((set, get) => ({
  activeEngineId: 'mock',
  isInitializing: false,
  isGenerating: false,
  voices: speechEngineRegistry.getEngine('mock')?.getVoices() || [],
  activeVoiceId: speechEngineRegistry.getEngine('mock')?.getVoices()[0]?.id || '',
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
  error: null,
  currentResult: null,

  setEngine: async (id) => {
    set({ isInitializing: true, error: null })
    try {
      const engine = await speechEngineRegistry.setActiveEngine(id)
      const voices = engine.getVoices()
      set({
        activeEngineId: id,
        voices,
        activeVoiceId: voices[0]?.id || '',
        isInitializing: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change speech engine'
      set({ error: message, isInitializing: false })
    }
  },

  setVoice: (id) => set({ activeVoiceId: id }),
  setSpeed: (speed) => set({ speed }),
  setPitch: (pitch) => set({ pitch }),
  setVolume: (volume) => set({ volume }),

  generateSpeech: async (text) => {
    if (!text.trim()) return
    set({ isGenerating: true, error: null })
    try {
      const engine = speechEngineRegistry.getActiveEngine()
      const result = await engine.generate(text, {
        voiceId: get().activeVoiceId,
        speed: get().speed,
        pitch: get().pitch,
        volume: get().volume,
      })
      set({ currentResult: result, isGenerating: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed'
      set({ error: message, isGenerating: false })
    }
  },

  clearGeneration: () => {
    const result = get().currentResult
    if (result) {
      URL.revokeObjectURL(result.audioUrl)
    }
    set({ currentResult: null, error: null })
  },
}))
