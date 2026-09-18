import type { SpeechEngine, SpeechGenerationOptions, SpeechGenerationResult, Voice } from '../types'
import { pcmToWav } from '@/utils/audio'

export class BrowserSpeechEngine implements SpeechEngine {
  readonly id = 'browser'
  readonly name = 'System Speech Engine (Native Fallback)'
  
  private ready = false
  private voices: Voice[] = []

  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      throw new Error('Web Speech API is not supported in this browser.')
    }

    return new Promise<void>((resolve) => {
      const loadVoices = () => {
        const nativeVoices = window.speechSynthesis.getVoices()
        this.voices = nativeVoices.map((v) => ({
          id: v.name,
          name: `${v.name} (${v.lang})`,
          language: v.lang,
          gender: v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') ? 'female' : 'male',
          local: true,
        }))
        this.ready = true
        resolve()
      }

      // SpeechSynthesis voices are loaded asynchronously in some browsers
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices()
      } else {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    })
  }

  isReady(): boolean {
    return this.ready
  }

  async generate(text: string, options: SpeechGenerationOptions): Promise<SpeechGenerationResult> {
    if (!this.ready) {
      throw new Error('System Speech Engine has not been initialized yet.')
    }

    // Since speechSynthesis cannot export direct binary data to a Blob natively:
    // We generate a short, clean chime WAV Blob for download & playback representation
    const sampleRate = 22050
    const duration = Math.max(0.5, text.length * 0.06)
    const numSamples = Math.floor(sampleRate * duration)
    const pcmData = new Float32Array(numSamples)

    // Generate a simple chime chord to play as physical feedback
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate
      // Double note chord (C5 + E5)
      let val = Math.sin(2 * Math.PI * 523.25 * t) // C5
      val += 0.5 * Math.sin(2 * Math.PI * 659.25 * t) // E5
      const envelope = Math.exp(-4 * t) // Smooth decaying chord
      pcmData[i] = (val / 1.5) * envelope * (options.volume || 1.0)
    }

    const wavBlob = pcmToWav(pcmData, sampleRate)
    const audioUrl = URL.createObjectURL(wavBlob)

    return {
      audioBlob: wavBlob,
      audioUrl,
      duration,
      sampleRate,
    }
  }

  /**
   * Helper function specifically for this engine to perform the native vocal speech synthesis.
   * The UI player will call this when using OS-native speech.
   */
  speakNative(text: string, options: SpeechGenerationOptions, onEnd?: () => void) {
    if (!this.ready) return

    window.speechSynthesis.cancel() // Cancel ongoing speech

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Find matching native voice
    const nativeVoices = window.speechSynthesis.getVoices()
    const voice = nativeVoices.find((v) => v.name === options.voiceId)
    if (voice) {
      utterance.voice = voice
    }

    // Set controls
    utterance.rate = options.speed || 1.0
    // Web Speech API rate limit is usually 0.1 to 10
    // Pitch limit is usually 0 to 2
    utterance.pitch = options.pitch || 1.0
    utterance.volume = options.volume !== undefined ? options.volume : 1.0

    if (onEnd) {
      utterance.onend = onEnd
      utterance.onerror = onEnd
    }

    window.speechSynthesis.speak(utterance)
  }

  stopNative() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  getVoices(): Voice[] {
    return this.voices
  }

  async destroy(): Promise<void> {
    this.stopNative()
    this.ready = false
  }
}
