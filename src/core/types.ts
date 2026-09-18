export interface SpeechGenerationResult {
  audioBlob: Blob
  audioUrl: string
  duration: number // in seconds
  sampleRate: number
}

export interface Voice {
  id: string
  name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  local?: boolean // Indicates if it is integrated natively on the OS
}

export interface SpeechGenerationOptions {
  voiceId: string
  speed: number // 0.5 to 2.0
  pitch: number // 0.5 to 2.0 (for engines supporting pitch shifts)
  volume: number // 0.0 to 1.0
  onProgress?: (progress: number) => void
}

export interface SpeechEngine {
  readonly id: string
  readonly name: string
  
  initialize(): Promise<void>
  isReady(): boolean
  
  generate(text: string, options: SpeechGenerationOptions): Promise<SpeechGenerationResult>
  getVoices(): Voice[]
  
  destroy(): Promise<void>
}
