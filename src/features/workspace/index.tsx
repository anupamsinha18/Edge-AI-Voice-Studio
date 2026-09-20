import React, { useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  Sparkles, 
  Trash2, 
  Sliders, 
  Volume2, 
  Clock, 
  HelpCircle,
  Loader2,
  FileText,
  X,
  Gauge,
  User,
  Mic2,
  Layers
} from 'lucide-react'
import { useEngineStore } from '@/store/engineStore'
import { useAudioStore } from '@/store/audioStore'
import { useHistoryStore } from '@/store/historyStore'
import { estimateDuration } from '@/utils/audio'
import { Waveform } from './components/Waveform'

const SAMPLE_PROMPTS = [
  {
    label: '👋 Welcome',
    text: 'Welcome to AI Voice Studio. Experience neural text-to-speech running locally on your device.',
  },
  {
    label: '🎙️ Podcast',
    text: 'Hey everyone, welcome back to the channel! Today we are exploring on-device AI voice synthesis.',
  },
  {
    label: '⚡ Quick Alert',
    text: 'System notification: Voice generation is 100% complete and ready to download.',
  },
  {
    label: '📖 Story',
    text: 'Deep in the heart of the digital forest, intelligent algorithms whispered tales to the starry sky.',
  },
]

export const Workspace: React.FC = () => {
  const [text, setText] = useState(
    'Welcome to the AI Voice Studio. Type any text here, select your speech parameters, and click Generate to create natural client-side speech.'
  )
  const [mobileTab, setMobileTab] = useState<'script' | 'params'>('script')

  const {
    activeEngineId,
    isInitializing,
    isGenerating,
    voices,
    activeVoiceId,
    speed,
    pitch,
    volume,
    error,
    currentResult,
    setEngine,
    setVoice,
    setSpeed,
    setPitch,
    setVolume,
    generateSpeech,
    clearGeneration
  } = useEngineStore()

  const {
    isPlaying,
    currentTime,
    duration,
    progress,
    initializeAudio,
    play,
    pause,
    stop,
    seek,
    reset: resetAudio
  } = useAudioStore()

  const { addItem } = useHistoryStore()

  useEffect(() => {
    initializeAudio()
    return () => resetAudio()
  }, [initializeAudio, resetAudio])

  useEffect(() => {
    stop(activeEngineId)
  }, [activeEngineId, stop])

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return
    
    // Reset any ongoing audio playback first
    stop(activeEngineId)

    await generateSpeech(text)
    
    // Retrieve fresh store state immediately after generate finishes
    const latestResult = useEngineStore.getState().currentResult
    if (latestResult) {
      const generatedName = text.trim().split(/\s+/).slice(0, 4).join(' ') || 'Untitled Speech'
      await addItem({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        text: text.trim(),
        voiceId: activeVoiceId,
        engineId: activeEngineId,
        duration: latestResult.duration,
        timestamp: Date.now(),
        audioBlob: latestResult.audioBlob,
        isFavorite: false,
        name: generatedName + (text.split(/\s+/).length > 4 ? '...' : '')
      })
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pause(activeEngineId)
    } else {
      play(
        text,
        activeEngineId,
        currentResult?.audioUrl,
        activeVoiceId,
        speed,
        pitch,
        volume
      )
    }
  }

  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return '0:00'
    const mins = Math.floor(timeInSecs / 60)
    const secs = Math.floor(timeInSecs % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const estDuration = estimateDuration(text.length, speed)
  const charLimit = 500
  const charCount = text.length
  const speedPresets = [0.75, 1.0, 1.25, 1.5]

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-4 h-full bg-background overflow-hidden">
      {/* Mobile Segmented Switcher (Visible only on < lg) */}
      <div className="lg:hidden shrink-0 border-b border-border bg-card/40 px-3 py-2">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary/60 p-1 border border-border/50">
          <button
            onClick={() => setMobileTab('script')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              mobileTab === 'script'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            type="button"
          >
            <Mic2 className="h-3.5 w-3.5" />
            Script & Playback
          </button>
          <button
            onClick={() => setMobileTab('params')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              mobileTab === 'params'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            type="button"
          >
            <Sliders className="h-3.5 w-3.5" />
            Voice Settings
          </button>
        </div>
      </div>

      {/* Main Text Editor & Output Visualizer */}
      <div className={`lg:col-span-3 flex flex-col p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 pb-24 lg:pb-6 ${
        mobileTab !== 'script' ? 'hidden lg:flex' : 'flex'
      }`}>
        {/* Workspace Title & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">Speech Workspace</h2>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] sm:text-xs text-muted-foreground bg-secondary/30 px-2.5 py-1 rounded-full border border-border/40">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Est: <strong className="text-foreground">{estDuration.toFixed(1)}s</strong>
            </span>
            <span>•</span>
            <span>
              <strong className={charCount > charLimit ? 'text-destructive font-semibold' : 'text-foreground'}>{charCount}</strong>/{charLimit} chars
            </span>
          </div>
        </div>

        {/* Quick Sample Prompt Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Quick Test Scripts
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {SAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setText(prompt.text)}
                disabled={isGenerating}
                className="shrink-0 rounded-full border border-border bg-card/60 hover:bg-secondary/80 hover:border-primary/40 px-3 py-1 text-xs text-foreground transition-all active:scale-95 disabled:opacity-50"
                type="button"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area Card */}
        <div className="relative flex flex-col rounded-2xl border border-border bg-card/40 shadow-xl p-3 sm:p-4 min-h-[160px] sm:min-h-[200px] focus-within:border-primary/50 transition-colors">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, charLimit))}
            className="w-full flex-1 resize-none bg-transparent text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none leading-relaxed"
            placeholder="Type your synthesis script here..."
            disabled={isGenerating}
            rows={4}
          />

          <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2 text-xs text-muted-foreground">
            <span className="text-[10px] sm:text-xs">Natural client-side neural synthesis</span>
            {text.length > 0 && (
              <button
                onClick={() => setText('')}
                disabled={isGenerating}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground py-0.5 px-1.5 rounded hover:bg-secondary transition-colors"
                type="button"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>

          {error && (
            <div className="mt-2 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-2.5">
              Error: {error}
            </div>
          )}
        </div>

        {/* Output Waveform Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" /> Audio Visualizer
            </span>
            {currentResult && (
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 font-mono">
                WAV {formatTime(currentResult.duration)} ({currentResult.sampleRate}Hz)
              </span>
            )}
          </div>
          <Waveform isPlaying={isPlaying} />
        </div>

        {/* Action & Playback Console */}
        <div className="flex flex-col gap-3 sm:gap-4 border-t border-border/80 pt-4 sm:pt-6">
          {/* Generation Trigger Button (Full width on mobile) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isInitializing || !text.trim() || charCount > charLimit}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-primary-foreground font-semibold px-5 py-3 text-sm shadow-lg shadow-primary/25 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              type="button"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Speech...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Speech
                </>
              )}
            </button>
            
            {(isGenerating || isPlaying) && (
              <button
                onClick={() => {
                  stop(activeEngineId)
                  clearGeneration()
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground px-4 py-3 text-sm font-medium transition-all active:scale-95"
                title="Stop generation & playback"
                type="button"
              >
                <Square className="h-4 w-4 fill-current text-destructive" />
                <span className="hidden sm:inline">Stop</span>
              </button>
            )}
          </div>

          {/* Audio Console Player Card */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-secondary/40 rounded-2xl border border-border p-2.5 sm:p-3 shadow-md">
            <button
              onClick={handlePlayPause}
              disabled={activeEngineId !== 'browser' && !currentResult}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 active:scale-95 disabled:opacity-30 transition-all shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
              type="button"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </button>

            {/* Playback Progress Scrubber */}
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                disabled={activeEngineId === 'browser' || !currentResult}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border/80 focus:outline-none disabled:opacity-30 accent-primary"
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(activeEngineId === 'browser' ? estDuration : duration)}</span>
              </div>
            </div>

            {/* Action Buttons (Download, Clear) */}
            <div className="flex items-center gap-1 shrink-0">
              {currentResult && (
                <a
                  href={currentResult.audioUrl}
                  download={`${text.trim().split(/\s+/).slice(0, 3).join('_') || 'speech'}.wav`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-95"
                  title="Download Audio (.WAV)"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}

              {currentResult && (
                <button
                  onClick={() => {
                    stop(activeEngineId)
                    clearGeneration()
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/60 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all active:scale-95"
                  title="Clear current audio"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side Control Panel Parameters */}
      <aside className={`lg:col-span-1 border-t lg:border-t-0 lg:border-l border-border bg-card/30 p-4 sm:p-6 overflow-y-auto space-y-5 pb-24 lg:pb-6 ${
        mobileTab !== 'params' ? 'hidden lg:block' : 'block'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">Voice Tuning</h2>
          </div>
          <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-mono text-muted-foreground">
            {voices.length} Voices
          </span>
        </div>

        <hr className="border-border/60" />

        {/* Engine Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1">
              Speech Engine
              <span title="Kokoro AI runs 100% locally in browser via WebGPU/WASM ONNX.">
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </span>
            </span>
            <span className="text-[10px] text-primary font-mono font-medium uppercase">{activeEngineId}</span>
          </label>
          <select
            value={activeEngineId}
            onChange={(e) => setEngine(e.target.value)}
            disabled={isGenerating || isInitializing}
            className="w-full rounded-xl border border-border bg-secondary/80 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="kokoro">Kokoro AI v1.0 (HF ONNX WebGPU/WASM)</option>
            <option value="browser">System Speech API (Native Fallback)</option>
            <option value="mock">Simulated Engine (Offline Mock)</option>
          </select>
        </div>

        {/* Voice Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-primary" /> Speaker Profile
          </label>
          <select
            value={activeVoiceId}
            onChange={(e) => setVoice(e.target.value)}
            disabled={isGenerating}
            className="w-full rounded-xl border border-border bg-secondary/80 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} {v.gender ? `(${v.gender})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Speed Slider & Quick Presets */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5 text-primary" /> Speaking Speed
            </span>
            <span className="font-mono font-bold text-primary">{speed.toFixed(2)}x</span>
          </div>
          
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full cursor-pointer appearance-none rounded-full bg-secondary h-2 focus:outline-none accent-primary"
            disabled={isGenerating}
          />

          {/* Quick Speed Preset Chips */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {speedPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setSpeed(preset)}
                disabled={isGenerating}
                className={`py-1 text-[11px] rounded-lg font-mono font-semibold transition-all ${
                  Math.abs(speed - preset) < 0.01
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/40'
                }`}
                type="button"
              >
                {preset}x
              </button>
            ))}
          </div>
        </div>

        {/* Pitch Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">Vocal Pitch</span>
            <span className="font-mono text-muted-foreground">{pitch.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            className="w-full cursor-pointer appearance-none rounded-full bg-secondary h-2 focus:outline-none accent-primary disabled:opacity-40"
            disabled={isGenerating || activeEngineId === 'kokoro'}
          />
          {activeEngineId === 'kokoro' && (
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed italic">
              Kokoro v1.0 produces fixed acoustic representations without direct pitch shift.
            </p>
          )}
        </div>

        {/* Volume Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Volume2 className="h-3.5 w-3.5 text-primary" /> Volume
            </span>
            <span className="font-mono font-bold text-foreground">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full cursor-pointer appearance-none rounded-full bg-secondary h-2 focus:outline-none accent-primary"
            disabled={isGenerating}
          />
        </div>
      </aside>
    </div>
  )
}

