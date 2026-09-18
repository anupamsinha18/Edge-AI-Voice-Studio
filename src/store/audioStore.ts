import { create } from 'zustand'
import { speechEngineRegistry } from '../core/SpeechEngineRegistry'
import { BrowserSpeechEngine } from '../core/engines/BrowserSpeechEngine'

interface AudioState {
  isPlaying: boolean
  currentTime: number
  duration: number
  progress: number // 0 to 100
  audioElement: HTMLAudioElement | null
  
  initializeAudio: () => void
  play: (
    text: string, 
    activeEngineId: string, 
    audioUrl?: string, 
    voiceId?: string, 
    speed?: number, 
    pitch?: number, 
    volume?: number
  ) => void
  pause: (activeEngineId: string) => void
  stop: (activeEngineId: string) => void
  seek: (progressPercent: number) => void
  updateTime: (time: number) => void
  setDuration: (dur: number) => void
  reset: () => void
}

export const useAudioStore = create<AudioState>((set, get) => {
  let audio: HTMLAudioElement | null = null

  if (typeof window !== 'undefined') {
    audio = new Audio()
  }

  return {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    audioElement: audio,

    initializeAudio: () => {
      if (!audio) return
      
      audio.ontimeupdate = () => {
        const curTime = audio!.currentTime
        const dur = audio!.duration || 1
        set({
          currentTime: curTime,
          progress: (curTime / dur) * 100,
        })
      }

      audio.onended = () => {
        set({ isPlaying: false, currentTime: 0, progress: 0 })
      }

      audio.onloadedmetadata = () => {
        set({ duration: audio!.duration || 0 })
      }
    },

    play: (text, activeEngineId, audioUrl, voiceId, speed, pitch, volume) => {
      if (activeEngineId === 'browser') {
        const browserEngine = speechEngineRegistry.getEngine('browser') as BrowserSpeechEngine
        if (browserEngine) {
          set({ isPlaying: true })
          browserEngine.speakNative(
            text,
            {
              voiceId: voiceId || '',
              speed: speed || 1.0,
              pitch: pitch || 1.0,
              volume: volume !== undefined ? volume : 1.0,
            },
            () => {
              set({ isPlaying: false })
            }
          )
        }
      } else if (audioUrl && audio) {
        if (audio.src !== audioUrl) {
          audio.src = audioUrl
          audio.load()
        }
        audio.playbackRate = speed || 1.0
        audio.volume = volume !== undefined ? volume : 1.0
        audio.play()
          .then(() => set({ isPlaying: true }))
          .catch((err) => console.error('Audio play failed:', err))
      }
    },

    pause: (activeEngineId) => {
      if (activeEngineId === 'browser') {
        const browserEngine = speechEngineRegistry.getEngine('browser') as BrowserSpeechEngine
        browserEngine?.stopNative()
        set({ isPlaying: false })
      } else if (audio) {
        audio.pause()
        set({ isPlaying: false })
      }
    },

    stop: (activeEngineId) => {
      if (activeEngineId === 'browser') {
        const browserEngine = speechEngineRegistry.getEngine('browser') as BrowserSpeechEngine
        browserEngine?.stopNative()
        set({ isPlaying: false, currentTime: 0, progress: 0 })
      } else if (audio) {
        audio.pause()
        audio.currentTime = 0
        set({ isPlaying: false, currentTime: 0, progress: 0 })
      }
    },

    seek: (progressPercent) => {
      const audioEl = get().audioElement
      if (!audioEl || audioEl.duration === Infinity || isNaN(audioEl.duration)) return
      const seekTime = (progressPercent / 100) * audioEl.duration
      audioEl.currentTime = seekTime
      set({ currentTime: seekTime, progress: progressPercent })
    },

    updateTime: (time) => set({ currentTime: time }),
    setDuration: (dur) => set({ duration: dur }),
    
    reset: () => {
      const audioEl = get().audioElement
      if (audioEl) {
        audioEl.pause()
        audioEl.src = ''
      }
      set({ isPlaying: false, currentTime: 0, duration: 0, progress: 0 })
    }
  }
})
