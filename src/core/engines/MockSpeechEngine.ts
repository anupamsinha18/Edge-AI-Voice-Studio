import type { SpeechEngine, SpeechGenerationOptions, SpeechGenerationResult, Voice } from '../types'
import { pcmToWav } from '@/utils/audio'

export class MockSpeechEngine implements SpeechEngine {
  readonly id = 'mock'
  readonly name = 'Mock Speech Engine (Offline)'
  
  private ready = false

  async initialize(): Promise<void> {
    // Simulate a brief loading delay for UX demonstration
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.ready = true
        resolve()
      }, 500)
    })
  }

  isReady(): boolean {
    return this.ready
  }

  async generate(text: string, options: SpeechGenerationOptions): Promise<SpeechGenerationResult> {
    if (!this.ready) {
      throw new Error('Mock Speech Engine has not been initialized yet.')
    }

    return new Promise<SpeechGenerationResult>((resolve) => {
      // Simulate synthesis delay based on text length (50ms per character, minimum 300ms)
      const synthesisDelay = Math.max(300, text.length * 10)
      
      setTimeout(() => {
        const sampleRate = 22050
        // Speed adjusts the speaking rate (and therefore duration)
        const speedMultiplier = options.speed || 1.0
        const duration = Math.max(0.8, (text.length * 0.07) / speedMultiplier)
        const numSamples = Math.floor(sampleRate * duration)
        const pcmData = new Float32Array(numSamples)
        
        // Base pitch frequency (default 220Hz for low, 350Hz for high)
        const pitchMultiplier = options.pitch || 1.0
        const baseFreq = options.voiceId.includes('female') ? 300 : 150
        const frequency = baseFreq * pitchMultiplier

        // Fill with a simulated voice-like synth sound (sine + harmonics)
        for (let i = 0; i < numSamples; i++) {
          const t = i / sampleRate
          // Fundamental frequency
          let val = Math.sin(2 * Math.PI * frequency * t)
          // Add harmonics for a richer buzzier vocal-like timbre
          val += 0.4 * Math.sin(2 * Math.PI * (frequency * 2) * t)
          val += 0.2 * Math.sin(2 * Math.PI * (frequency * 3) * t)
          
          // Apply a voice envelope (vowel-like modulation)
          const envelope = Math.sin(Math.PI * (i / numSamples))
          // Control overall amplitude by volume parameter
          const volume = options.volume !== undefined ? options.volume : 1.0
          
          pcmData[i] = (val / 1.6) * envelope * volume
        }

        const wavBlob = pcmToWav(pcmData, sampleRate)
        const audioUrl = URL.createObjectURL(wavBlob)

        resolve({
          audioBlob: wavBlob,
          audioUrl,
          duration,
          sampleRate,
        })
      }, synthesisDelay)
    })
  }

  getVoices(): Voice[] {
    return [
      { id: 'mock_female_1', name: 'Mock Sarah (Female)', language: 'en-US', gender: 'female' },
      { id: 'mock_male_1', name: 'Mock David (Male)', language: 'en-US', gender: 'male' },
      { id: 'mock_neutral_1', name: 'Mock Alpha (Neutral)', language: 'en-US', gender: 'neutral' },
    ]
  }

  async destroy(): Promise<void> {
    this.ready = false
  }
}
