import React from 'react'
import { Sparkles, HelpCircle, Shield, Award, Cpu } from 'lucide-react'

export const About: React.FC = () => {
  return (
    <div className="flex h-full flex-col bg-background p-3 sm:p-6 pb-24 sm:pb-6 overflow-y-auto space-y-4 sm:space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">About AI Voice Studio</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Learn more about the technology stack powering this client-side studio.</p>
      </div>

      <hr className="border-border/60" />

      {/* Core Project Vision */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Vision & Tech Stack
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          AI Voice Studio is a state-of-the-art text-to-speech sandbox that runs entirely in your web browser. 
          Using Hugging Face ONNX exports of open-source TTS models, it eliminates the need for external cloud APIs, 
          ensuring complete user privacy, offline capabilities, and 0$ operating costs.
        </p>
      </div>

      {/* Models Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/60 pt-6">
        <div className="space-y-2.5 p-4 rounded-xl border border-border bg-card/20">
          <div className="flex items-center gap-2">
            <Cpu className="h-4.5 w-4.5 text-primary" />
            <h4 className="text-xs font-bold text-foreground">Kokoro-82M AI Model</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            An 82-million parameter neural text-to-speech model. It generates natural, human-like voice synthesis 
            comparable to commercial APIs (like ElevenLabs) but at a fraction of the parameter size (~85MB quantized).
          </p>
          <div className="text-[9px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full inline-block">
            Apache 2.0 License
          </div>
        </div>

        <div className="space-y-2.5 p-4 rounded-xl border border-border bg-card/20">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-primary" />
            <h4 className="text-xs font-bold text-foreground">ONNX Runtime Web</h4>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            The execution layer driving model inference inside the browser. It automatically detects WebGPU support in chromium-based browsers for up to 100x acceleration or falls back to multithreaded WASM WebAssembly on standard CPUs.
          </p>
          <div className="text-[9px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full inline-block">
            MIT License
          </div>
        </div>
      </div>

      {/* Key Architectural Highlights */}
      <div className="space-y-3 border-t border-border/60 pt-6">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" /> Architecture Pillars
        </h3>
        
        <ul className="space-y-2.5 text-xs text-muted-foreground leading-relaxed list-disc list-inside pl-1 font-light">
          <li>
            <strong className="text-foreground font-semibold">Web Worker Threading:</strong> Audio synthesis cycles run completely inside separate worker threads so your UI browser window never stutters.
          </li>
          <li>
            <strong className="text-foreground font-semibold">Clean Abstraction:</strong> Swap from simulated mock layers, system Web Speech APIs, or localized Kokoro libraries seamlessly without rewriting core views.
          </li>
          <li>
            <strong className="text-foreground font-semibold">IndexedDB Sync:</strong> Stores and loads generated voice Blobs locally, permitting full CRUD operations offline.
          </li>
        </ul>
      </div>

      {/* Open Source Credits */}
      <div className="space-y-3 border-t border-border/60 pt-6">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" /> Open Source Credits
        </h3>
        
        <p className="text-xs text-muted-foreground leading-relaxed">
          Special thanks to the Hugging Face ONNX Community for converting Kokoro models, 
          the developers of the <code className="text-foreground bg-secondary px-1.5 py-0.5 rounded text-[11px]">kokoro-js</code> package for wrapping execution pipes, 
          and the open-source community behind Radix UI and Tailwind CSS.
        </p>
      </div>
    </div>
  )
}
