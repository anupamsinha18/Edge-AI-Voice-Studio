import React, { useEffect, useRef } from 'react'
import { useAudioStore } from '@/store/audioStore'

interface WaveformProps {
  isPlaying: boolean
}

export const Waveform: React.FC<WaveformProps> = ({ isPlaying }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const { audioElement } = useAudioStore()
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || typeof window === 'undefined') return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resizeCanvas = () => {
      const width = container.clientWidth || 300
      const height = window.innerWidth < 640 ? 60 : 72

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    resizeCanvas()
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })
    resizeObserver.observe(container)

    const setupAudioAnalyser = () => {
      try {
        if (!audioCtxRef.current) {
          const AudioCtxClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
          audioCtxRef.current = new AudioCtxClass()
        }

        const audioCtx = audioCtxRef.current

        if (audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {})
        }

        if (!analyserRef.current) {
          analyserRef.current = audioCtx.createAnalyser()
          analyserRef.current.fftSize = 256
        }

        const analyser = analyserRef.current

        if (audioElement && !sourceRef.current) {
          sourceRef.current = audioCtx.createMediaElementSource(audioElement)
          sourceRef.current.connect(analyser)
          analyser.connect(audioCtx.destination)
        }
      } catch (err) {
        console.warn('Could not initialize audio analyser node:', err)
      }
    }

    if (isPlaying && audioElement?.src) {
      setupAudioAnalyser()
    }

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)

      const width = canvas.width / dpr
      const height = canvas.height / dpr

      ctx.clearRect(0, 0, width, height)

      const bufferLength = analyserRef.current?.frequencyBinCount || 64
      const dataArray = new Uint8Array(bufferLength)

      if (isPlaying && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray)
      }

      ctx.lineWidth = 2.5
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, '#6366f1') // Indigo
      gradient.addColorStop(0.5, '#a855f7') // Purple
      gradient.addColorStop(1, '#ec4899') // Pink
      ctx.strokeStyle = gradient

      ctx.beginPath()

      const sliceWidth = width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0
        if (!analyserRef.current && isPlaying) {
          // Fallback animated sine wave for OS native TTS speaking
          v = 1.0 + 0.35 * Math.sin(i * 0.2 + Date.now() * 0.015) * Math.sin(Date.now() * 0.005)
        } else if (!isPlaying) {
          // Ambient idle visual state
          v = 1.0 + 0.03 * Math.sin(i * 0.15 + Date.now() * 0.003)
        }

        const y = (v * height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(width, height / 2)
      ctx.stroke()
    }

    draw()

    return () => {
      resizeObserver.disconnect()
      cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, audioElement])

  return (
    <div ref={containerRef} className="relative w-full rounded-xl border border-border/80 bg-black/40 p-1.5 overflow-hidden select-none shadow-inner">
      <canvas ref={canvasRef} className="block w-full" />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/70 uppercase tracking-widest font-semibold pointer-events-none">
          Audio Idle
        </div>
      )}
    </div>
  )
}

