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
  FileText
} from 'lucide-react'
import { useEngineStore } from '@/store/engineStore'
import { useAudioStore } from '@/store/audioStore'
import { useHistoryStore } from '@/store/historyStore'
import { estimateDuration } from '@/utils/audio'
import { Waveform } from './components/Waveform'

export const Workspace: React.FC = () => {
  const [text, setText] = useState(
    'Welcome to the AI Voice Studio. Type any text here, select your speech parameters, and click Generate to create natural client-side speech.'
  )

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

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-4 overflow-hidden bg-background">
      {/* Main Text Editor & Output Visualizer */}
      <div className="lg:col-span-3 flex flex-col p-6 overflow-y-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight text-foreground">Speech Workspace</h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Est. Length: <strong className="text-foreground">{estDuration.toFixed(1)}s</strong>
            </span>
            <span>|</span>
            <span>
              Characters: <strong className={charCount > charLimit ? 'text-destructive font-semibold' : 'text-foreground'}>{charCount}</strong> / {charLimit}
            </span>
          </div>
        </div>

        {/* Text Area Card */}
        <div className="relative flex-1 flex flex-col rounded-xl border border-border bg-card/25 shadow-2xl p-4 min-h-[220px]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, charLimit))}
            className="w-full flex-1 resize-none bg-transparent text-sm text-foreground placeholder-muted-foreground focus:outline-none leading-relaxed"
            placeholder="Type your synthesis script here..."
            disabled={isGenerating}
          />
          {error && (
            <div className="mt-2 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-2">
              Error: {error}
            </div>
          )}
        </div>

        {/* Output Waveform Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Audio Visualizer</span>
            {currentResult && (
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                WAV {formatTime(currentResult.duration)} ({currentResult.sampleRate}Hz)
              </span>
            )}
          </div>
          <Waveform isPlaying={isPlaying} />
        </div>

        {/* Action & Playback Console */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/80 pt-6">
          {/* Generation Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isInitializing || !text.trim() || charCount > charLimit}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4.5 py-2.5 text-sm shadow-md shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              type="button"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
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
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground px-3.5 py-2.5 text-sm transition-all"
                title="Stop generation & playback"
                type="button"
              >
                <Square className="h-4 w-4 fill-current" />
                Stop
              </button>
            )}
          </div>

          {/* Audio Console Panel */}
          <div className="flex flex-1 sm:max-w-md items-center gap-3 bg-secondary/35 rounded-xl border border-border p-2">
            <button
              onClick={handlePlayPause}
              disabled={activeEngineId !== 'browser' && !currentResult}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 shadow shadow-primary/15 disabled:opacity-30 transition-all shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
              type="button"
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>

            {/* Playback Progress Scrubber */}
            <div className="flex flex-1 flex-col gap-0.5">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                disabled={activeEngineId === 'browser' || !currentResult}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border focus:outline-none disabled:opacity-30"
              />
              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(activeEngineId === 'browser' ? estDuration : duration)}</span>
              </div>
            </div>

            {/* Download Output */}
            {currentResult && (
              <a
                href={currentResult.audioUrl}
                download={`${text.trim().split(/\s+/).slice(0, 3).join('_') || 'speech'}.wav`}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all shrink-0"
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
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0"
                title="Clear current audio"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Side Control Panel Parameters */}
      <aside className="border-t lg:border-t-0 lg:border-l border-border bg-card/20 p-6 overflow-y-auto space-y-6">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase">Voice Tuning</h2>
        </div>

        <hr className="border-border/60" />

        {/* Engine Switcher */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            Speech Engine
            <span title="Swaps the backend generating the voice. Kokoro AI runs fully client-side on the GPU/CPU.">
              <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            </span>
          </label>
          <select
            value={activeEngineId}
            onChange={(e) => setEngine(e.target.value)}
            disabled={isGenerating || isInitializing}
            className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none transition-colors"
          >
            <option value="mock">Simulated Engine (Offline)</option>
            <option value="browser">System Fallback (Fast)</option>
            <option value="kokoro">Kokoro AI v1.0 (HF ONNX)</option>
          </select>
        </div>

        {/* Voice Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-foreground">Speaker Profile</label>
          <select
            value={activeVoiceId}
            onChange={(e) => setVoice(e.target.value)}
            disabled={isGenerating}
            className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none transition-colors"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Speed Slider */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">Speaking Speed</span>
            <span className="font-mono text-muted-foreground">{speed.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full cursor-pointer appearance-none rounded-full bg-secondary h-1.5 focus:outline-none"
            disabled={isGenerating}
          />
        </div>

        {/* Pitch Slider (Browser native / mock support) */}
        <div className="space-y-2.5">
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
            className="w-full cursor-pointer appearance-none rounded-full bg-secondary h-1.5 focus:outline-none"
            disabled={isGenerating || activeEngineId === 'kokoro'} // Kokoro model has strict output sizing
          />
          {activeEngineId === 'kokoro' && (
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic">
              Kokoro v1.0 does not support direct pitch shifts without audio resamplers.
            </p>
          )}
        </div>

        {/* Volume Slider */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Volume2 className="h-3.5 w-3.5" /> Volume
            </span>
            <span className="font-mono text-muted-foreground">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full cursor-pointer appearance-none rounded-full bg-secondary h-1.5 focus:outline-none"
            disabled={isGenerating}
          />
        </div>

        {/* Future Emotion Block (Placeholder/Future Proofed) */}
        <div className="space-y-2.5 opacity-55 border-t border-border/60 pt-5">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Emotion Controller</span>
            <span className="text-[9px] bg-secondary/80 text-muted-foreground px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">Future Ready</span>
          </label>
          <select
            disabled
            className="w-full rounded-lg border border-border/80 bg-secondary/30 px-3 py-2 text-sm text-muted-foreground/75 cursor-not-allowed"
          >
            <option>Neutral Tone</option>
            <option>Cheerful / Bright</option>
            <option>Serious / Sad</option>
            <option>Excited / Energetic</option>
          </select>
        </div>
      </aside>
    </div>
  )
}
