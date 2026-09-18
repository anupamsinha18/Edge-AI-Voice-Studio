import React from 'react'
import { Menu, Sparkles, Cpu, Activity } from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { useEngineStore } from '@/store/engineStore'
import { speechEngineRegistry } from '@/core/SpeechEngineRegistry'

export const Header: React.FC = () => {
  const { toggleSidebar } = useUiStore()
  const { activeEngineId, isInitializing, isGenerating } = useEngineStore()

  const getEngineBadge = () => {
    switch (activeEngineId) {
      case 'kokoro':
        return {
          label: 'Kokoro AI (Local WebGPU/WASM)',
          color: 'bg-primary/10 text-primary border-primary/20',
        }
      case 'browser':
        return {
          label: 'System Speech API (Fallback)',
          color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        }
      default:
        return {
          label: 'Simulated Engine (Offline)',
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
        return kokoro.deviceUsed === 'webgpu' ? 'WebGPU Acceleration' : 'WASM (CPU Fallback)'
      }
    }
    const isWebGPUSupported = typeof navigator !== 'undefined' && 'gpu' in navigator
    return isWebGPUSupported ? 'WebGPU Available' : 'WASM (CPU Fallback)'
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/30 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Toggle Sidebar"
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span className="font-bold tracking-tight text-foreground">AI Voice Studio</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        {/* Device Status */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-muted-foreground">
          <Cpu className="h-3 w-3 text-primary" />
          <span>Device:</span>
          <span className="font-medium text-foreground">
            {getDeviceUsed()}
          </span>
        </div>

        {/* Engine Badge */}
        <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium ${badge.color}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${isGenerating ? 'bg-green-500 animate-ping' : 'bg-primary'}`} />
          {badge.label}
        </div>

        {/* Status Indicators */}
        {isInitializing && (
          <div className="flex items-center gap-1.5 text-primary animate-pulse">
            <Activity className="h-3.5 w-3.5 animate-spin" />
            <span>Loading weights...</span>
          </div>
        )}
      </div>
    </header>
  )
}
