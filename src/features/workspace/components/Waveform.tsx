import React, { useEffect, useRef } from 'react'
import { useAudioStore } from '@/store/audioStore'

interface WaveformProps {
  isPlaying: boolean
}

export const Waveform: React.FC<WaveformProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const { audioElement } = useAudioStore()
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (!audioElement || typeof window === 'undefined') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400
      canvas.height = 80
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const setupAudioAnalyser = () => {
      try {
        if (!audioCtxRef.current) {
          const AudioCtxClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
          audioCtxRef.current = new AudioCtxClass()
        }

        const audioCtx = audioCtxRef.current

        if (audioCtx.state === 'suspended') {
          // Resume on interaction if auto-play is blocked
          canvas.addEventListener('click', () => audioCtx.resume(), { once: true })
        }

        if (!analyserRef.current) {
          analyserRef.current = audioCtx.createAnalyser()
          analyserRef.current.fftSize = 256
        }

        const analyser = analyserRef.current

        // Bind source node only once
        if (!sourceRef.current) {
          sourceRef.current = audioCtx.createMediaElementSource(audioElement)
          sourceRef.current.connect(analyser)
          analyser.connect(audioCtx.destination)
        }
      } catch (err) {
        console.warn('Could not initialize audio analyser node:', err)
      }
    }

    if (isPlaying && audioElement.src) {
      setupAudioAnalyser()
    }

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)

      const width = canvas.width
      const height = canvas.height

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
          // Fallback animated sine wave for OS native TTS speaking or disabled AudioNodes
          v = 1.0 + 0.3 * Math.sin(i * 0.2 + Date.now() * 0.015) * Math.sin(Date.now() * 0.005)
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

      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, audioElement])

  return (
    <div className="relative w-full rounded-lg border border-border bg-black/35 p-1 overflow-hidden select-none">
      <canvas ref={canvasRef} className="block w-full h-20" />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center text-[9px] text-muted-foreground uppercase tracking-widest font-semibold opacity-70 pointer-events-none">
          Audio Idle
        </div>
      )}
    </div>
  )
}
