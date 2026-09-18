import type { SpeechEngine, SpeechGenerationOptions, SpeechGenerationResult, Voice } from '../types'
import { pcmToWav } from '@/utils/audio'

export class KokoroSpeechEngine implements SpeechEngine {
  readonly id = 'kokoro'
  readonly name = 'Kokoro AI Engine (Local)'

  private worker: Worker | null = null
  private initPromise: Promise<void> | null = null
  private ready = false
  public deviceUsed: 'webgpu' | 'cpu' = 'cpu'

  // Store references for the active generate request
  private generateResolver: ((value: SpeechGenerationResult) => void) | null = null
  private generateRejecter: ((reason: unknown) => void) | null = null

  async initialize(): Promise<void> {
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise<void>((resolve, reject) => {
      try {
        // Spawn the web worker using Vite standard URL worker format
        this.worker = new Worker(
          new URL('../workers/kokoro.worker.ts', import.meta.url),
          { type: 'module' }
        )

        this.worker.onmessage = (event: MessageEvent) => {
          const { type, payload } = event.data

          if (type === 'INIT_SUCCESS') {
            this.ready = true
            this.deviceUsed = payload?.deviceUsed || 'cpu'
            resolve()
          } 
          
          else if (type === 'GENERATE_SUCCESS') {
            const { pcmData, sampleRate } = payload
            const wavBlob = pcmToWav(pcmData, sampleRate)
            const audioUrl = URL.createObjectURL(wavBlob)
            const duration = pcmData.length / sampleRate

            if (this.generateResolver) {
              this.generateResolver({
                audioBlob: wavBlob,
                audioUrl,
                duration,
                sampleRate,
              })
            }
          } 
          
          else if (type === 'ERROR') {
            const error = new Error(payload || 'An error occurred inside the Kokoro Worker thread')
            if (this.generateRejecter) {
              this.generateRejecter(error)
            } else {
              reject(error)
            }
          }
        }

        this.worker.onerror = (err) => {
          console.error('Worker error:', err)
          const error = new Error('Web Worker instantiation error')
          if (this.generateRejecter) {
            this.generateRejecter(error)
          } else {
            reject(error)
          }
        }

        // Determine device capability (use WebGPU if browser supports it, fallback to WebAssembly CPU)
        const device = typeof navigator !== 'undefined' && 'gpu' in navigator ? 'webgpu' : 'cpu'

        this.worker.postMessage({
          type: 'INIT',
          payload: {
            dtype: 'q8',
            device,
          },
        })
      } catch (err) {
        reject(err)
      }
    })

    return this.initPromise
  }

  isReady(): boolean {
    return this.ready
  }

  async generate(text: string, options: SpeechGenerationOptions): Promise<SpeechGenerationResult> {
    if (!this.ready || !this.worker) {
      throw new Error('Kokoro Speech Engine has not been initialized yet.')
    }

    return new Promise<SpeechGenerationResult>((resolve, reject) => {
      this.generateResolver = resolve
      this.generateRejecter = reject

      this.worker!.postMessage({
        type: 'GENERATE',
        payload: {
          text,
          voiceId: options.voiceId,
          speed: options.speed,
        },
      })
    })
  }

  getVoices(): Voice[] {
    return [
      { id: 'af_heart', name: 'Heart (US Female)', language: 'en-US', gender: 'female' },
      { id: 'af_bella', name: 'Bella (US Female)', language: 'en-US', gender: 'female' },
      { id: 'af_nicole', name: 'Nicole (US Female)', language: 'en-US', gender: 'female' },
      { id: 'af_sarah', name: 'Sarah (US Female)', language: 'en-US', gender: 'female' },
      { id: 'am_adam', name: 'Adam (US Male)', language: 'en-US', gender: 'male' },
      { id: 'am_michael', name: 'Michael (US Male)', language: 'en-US', gender: 'male' },
      { id: 'bf_emma', name: 'Emma (UK Female)', language: 'en-UK', gender: 'female' },
      { id: 'bf_isabella', name: 'Isabella (UK Female)', language: 'en-UK', gender: 'female' },
      { id: 'bm_george', name: 'George (UK Male)', language: 'en-UK', gender: 'male' },
      { id: 'bm_lewis', name: 'Lewis (UK Male)', language: 'en-UK', gender: 'male' },
    ]
  }

  async destroy(): Promise<void> {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.ready = false
    this.initPromise = null
    this.generateResolver = null
    this.generateRejecter = null
  }
}
