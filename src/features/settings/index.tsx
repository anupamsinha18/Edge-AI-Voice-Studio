import React, { useEffect, useState } from 'react'
import { 
  Sun, 
  Moon, 
  Monitor, 
  HardDrive, 
  Sliders, 
  Trash2, 
  ShieldCheck,
  Check
} from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { useEngineStore } from '@/store/engineStore'

export const Settings: React.FC = () => {
  const { theme, setTheme } = useUiStore()
  const { speed, pitch, volume } = useEngineStore()
  const [cacheSize, setCacheSize] = useState<string>('Calculating...')
  const [isClearing, setIsClearing] = useState(false)
  const [savedDefaults, setSavedDefaults] = useState(false)

  const calculateCacheSize = async () => {
    if (typeof window === 'undefined' || typeof caches === 'undefined') {
      setCacheSize('Unsupported')
      return
    }
    try {
      let totalBytes = 0
      const cacheNames = await caches.keys()
      for (const name of cacheNames) {
        const cache = await caches.open(name)
        const keys = await cache.keys()
        for (const key of keys) {
          const response = await cache.match(key)
          if (response) {
            // Read headers if content-length is present (much faster than response.blob())
            const lengthHeader = response.headers.get('content-length')
            if (lengthHeader) {
              totalBytes += parseInt(lengthHeader, 10)
            } else {
              const blob = await response.clone().blob()
              totalBytes += blob.size
            }
          }
        }
      }
      const mb = (totalBytes / (1024 * 1024)).toFixed(1)
      setCacheSize(`${mb} MB`)
    } catch (err) {
      console.warn('Failed to calculate cache size:', err)
      setCacheSize('0.0 MB')
    }
  }

  const handleClearCache = async () => {
    if (typeof window === 'undefined' || typeof caches === 'undefined') return
    
    if (
      !confirm(
        'Are you sure you want to clear the local model cache? Next time you use Kokoro AI, it will download the ~85MB model files again.'
      )
    ) {
      return
    }

    setIsClearing(true)
    try {
      const cacheNames = await caches.keys()
      for (const name of cacheNames) {
        await caches.delete(name)
      }
      setCacheSize('0.0 MB')
    } catch (err) {
      console.error('Failed to purge cache:', err)
    } finally {
      setIsClearing(false)
    }
  }

  const saveDefaults = () => {
    localStorage.setItem('ai_voice_default_speed', String(speed))
    localStorage.setItem('ai_voice_default_pitch', String(pitch))
    localStorage.setItem('ai_voice_default_volume', String(volume))
    
    setSavedDefaults(true)
    setTimeout(() => setSavedDefaults(false), 2000)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateCacheSize()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const themeOptions = [
    { value: 'light', label: 'Light Mode', icon: Sun },
    { value: 'dark', label: 'Dark Mode', icon: Moon },
    { value: 'system', label: 'System Theme', icon: Monitor },
  ] as const

  return (
    <div className="flex h-full flex-col bg-background p-6 overflow-y-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Studio Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Configure system aesthetics, default parameters, and cache controls.</p>
      </div>

      <hr className="border-border/60" />

      {/* Theme Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Aesthetics</h3>
        <p className="text-xs text-muted-foreground">Select how the Studio looks on your device.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
          {themeOptions.map((opt) => {
            const Icon = opt.icon
            const active = theme === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-all ${
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card/40 hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                }`}
                type="button"
              >
                <Icon className="h-4 w-4" />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Model Cache Management */}
      <div className="space-y-3 max-w-xl border-t border-border/60 pt-6">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-primary" /> Model Cache Manager
        </h3>
        <p className="text-xs text-muted-foreground">
          Local models (Kokoro-82M) are cached directly in your browser's Cache Storage. This allows the AI Voice Studio to work 100% offline.
        </p>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card/30 p-4 gap-4">
          <div className="space-y-0.5">
            <span className="text-xs text-muted-foreground">Occupied Storage Size</span>
            <div className="text-lg font-bold text-foreground font-mono">{cacheSize}</div>
          </div>

          <button
            onClick={handleClearCache}
            disabled={isClearing || cacheSize === 'Calculating...' || cacheSize === '0.0 MB'}
            className="flex items-center gap-1.5 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive text-xs font-semibold px-3 py-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isClearing ? 'Clearing...' : 'Clear Cache'}
          </button>
        </div>
      </div>

      {/* Default Parameter Configurations */}
      <div className="space-y-4 max-w-xl border-t border-border/60 pt-6">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" /> Default Parameters
        </h3>
        <p className="text-xs text-muted-foreground font-light leading-relaxed">
          Store your current speed, pitch, and volume adjustments as default startup presets.
        </p>

        <div className="space-y-3 rounded-xl border border-border bg-card/10 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Speed: <strong className="text-foreground font-mono">{speed.toFixed(2)}x</strong></span>
            <span>Pitch: <strong className="text-foreground font-mono">{pitch.toFixed(2)}</strong></span>
            <span>Volume: <strong className="text-foreground font-mono">{Math.round(volume * 100)}%</strong></span>
          </div>

          <button
            onClick={saveDefaults}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold py-2 transition-all border border-border"
            type="button"
          >
            {savedDefaults ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                Defaults Saved!
              </>
            ) : (
              'Save Current as Default'
            )}
          </button>
        </div>
      </div>

      {/* Security Footer Badge */}
      <div className="max-w-xl border-t border-border/60 pt-6 text-[10px] text-muted-foreground flex items-center gap-1.5 leading-relaxed">
        <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
        <span>
          <strong>Offline Privacy Compliant:</strong> No speech text or audio files ever leave this device. All synthesis operations execute locally.
        </span>
      </div>
    </div>
  )
}
