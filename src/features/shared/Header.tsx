import React from 'react'
import { Menu, Sparkles, Cpu, Activity, Sun, Moon } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { useEngineStore } from '@/store/engineStore'
import { speechEngineRegistry } from '@/core/SpeechEngineRegistry'

export const Header: React.FC = () => {
  const { toggleSidebar, toggleMobileDrawer, theme, setTheme } = useUiStore()
  const { activeEngineId, isInitializing, isGenerating } = useEngineStore()

  const getEngineBadge = () => {
    switch (activeEngineId) {
      case 'kokoro':
        return {
          shortLabel: 'Kokoro AI',
          fullLabel: 'Kokoro AI (Local WebGPU/WASM)',
          color: 'bg-primary/10 text-primary border-primary/20',
        }
      case 'browser':
        return {
          shortLabel: 'System Speech',
          fullLabel: 'System Speech API (Native)',
          color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        }
      default:
        return {
          shortLabel: 'Simulated Engine',
          fullLabel: 'Simulated Engine (Offline)',
          color: 'bg-zinc-500/10 text-zinc-400 border-zinc-700',
        }
    }
  }

  const badge = getEngineBadge()
  
  const getDeviceUsed = () => {
    if (activeEngineId === 'kokoro') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const kokoro = speechEngineRegistry.getEngine('kokoro') as any
      if (kokoro && kokoro.isReady()) {
        return kokoro.deviceUsed === 'webgpu' ? 'WebGPU' : 'WASM'
      }
    }
    const isWebGPUSupported = typeof navigator !== 'undefined' && 'gpu' in navigator
    return isWebGPUSupported ? 'WebGPU' : 'WASM'
  }

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      toggleMobileDrawer()
    } else {
      toggleSidebar()
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/60 px-3 sm:px-4 backdrop-blur-md z-30 select-none">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={handleMenuClick}
          className="rounded-lg p-2 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          title="Toggle Navigation Menu"
          type="button"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 truncate">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/25 shrink-0">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
              AI Voice Studio
            </span>
            <span className="hidden sm:block text-[10px] text-muted-foreground -mt-1 font-medium">
              Client-Side Neural TTS
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Device Status (Tablet/Desktop) */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-muted-foreground">
          <Cpu className="h-3 w-3 text-primary" />
          <span>Device:</span>
          <span className="font-semibold text-foreground">
            {getDeviceUsed()}
          </span>
        </div>

        {/* Engine Badge */}
        <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-xs font-semibold ${badge.color} shrink-0`}>
          <div className={`h-1.5 w-1.5 rounded-full ${isGenerating ? 'bg-green-500 animate-ping' : isInitializing ? 'bg-yellow-500 animate-spin' : 'bg-primary'}`} />
          <span className="sm:hidden">{badge.shortLabel}</span>
          <span className="hidden sm:inline">{badge.fullLabel}</span>
        </div>

        {/* Status Indicators */}
        {isInitializing && (
          <div className="hidden sm:flex items-center gap-1.5 text-primary animate-pulse font-medium">
            <Activity className="h-3.5 w-3.5 animate-spin" />
            <span className="text-[11px]">Loading...</span>
          </div>
        )}

        {/* Quick Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all active:scale-95"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          type="button"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-yellow-400" />
          ) : (
            <Moon className="h-4 w-4 text-primary" />
          )}
        </button>
      </div>
    </header>
  )
}

