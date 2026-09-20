import React, { useEffect, useState } from 'react'
import { Database, ShieldAlert, Cpu } from 'lucide-react'
import { useEngineStore } from '@/store/engineStore'

export const StatusBar: React.FC = () => {
  const { activeEngineId, isGenerating, isInitializing } = useEngineStore()
  const [memoryUsage, setMemoryUsage] = useState<string>('N/A')

  useEffect(() => {
    // performance.memory is non-standard but supported in Chromium browsers
    const checkMemory = () => {
      interface PerformanceMemory {
        usedJSHeapSize: number
        totalJSHeapSize: number
        jsHeapSizeLimit: number
      }
      const perf = window.performance as Performance & { memory?: PerformanceMemory }
      if (perf && perf.memory) {
        const used = perf.memory.usedJSHeapSize
        const mb = Math.round(used / (1024 * 1024))
        setMemoryUsage(`${mb} MB`)
      }
    }

    checkMemory()
    const interval = setInterval(checkMemory, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusText = () => {
    if (isInitializing) return 'Loading AI weights into Web Assembly thread...'
    if (isGenerating) return 'Synthesizing voice waves...'
    return 'Studio Idle. Ready to generate.'
  }

  return (
    <footer className="hidden md:flex h-8 shrink-0 items-center justify-between border-t border-border bg-card/20 px-4 text-[10px] text-muted-foreground select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${isGenerating ? 'bg-green-500 animate-pulse' : isInitializing ? 'bg-yellow-500 animate-pulse' : 'bg-primary'}`} />
          <span>{getStatusText()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          <span>JS Heap Size: <strong className="text-foreground">{memoryUsage}</strong></span>
        </div>
        
        <div className="flex items-center gap-1">
          <Cpu className="h-3 w-3" />
          <span>Engine: <strong className="text-foreground uppercase">{activeEngineId}</strong></span>
        </div>

        <div className="flex items-center gap-1 text-[9px] text-muted-foreground border-l border-border pl-4">
          <ShieldAlert className="h-2.5 w-2.5" />
          <span>Offline First</span>
        </div>
      </div>
    </footer>
  )
}
