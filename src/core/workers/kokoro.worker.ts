import { KokoroTTS } from 'kokoro-js'

let tts: KokoroTTS | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any

ctx.addEventListener('message', async (event: MessageEvent) => {
  const { type, payload } = event.data

  try {
    if (type === 'INIT') {
      const { dtype, device } = payload

      try {
        console.log(`Worker: Initializing KokoroTTS on device: ${device}`)
        tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
          dtype: dtype || 'q8',
          device: device || 'cpu',
        })
        ctx.postMessage({ type: 'INIT_SUCCESS', payload: { deviceUsed: device || 'cpu' } })
      } catch (err) {
        if (device === 'webgpu') {
          console.warn('Worker: WebGPU initialization failed. Falling back to WebAssembly (WASM) CPU. Error details:', err)
          try {
            tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
              dtype: dtype || 'q8',
              device: 'cpu',
            })
            ctx.postMessage({ type: 'INIT_SUCCESS', payload: { deviceUsed: 'cpu' } })
            return
          } catch (wasmErr) {
            const wasmMessage = wasmErr instanceof Error ? wasmErr.message : String(wasmErr)
            throw new Error(`Failed to load model on WebGPU and WebAssembly fallback. WASM error: ${wasmMessage}`, { cause: wasmErr })
          }
        }
        throw err
      }
    } 
    
    else if (type === 'GENERATE') {
      if (!tts) {
        throw new Error('Kokoro Speech Engine has not been initialized yet.')
      }

      const { text, voiceId, speed } = payload

      const result = await tts.generate(text, {
        voice: voiceId,
        speed: speed || 1.0,
      })

      // Send raw array buffers back as transferable objects to maximize performance
      ctx.postMessage(
        {
          type: 'GENERATE_SUCCESS',
          payload: {
            pcmData: result.audio,
            sampleRate: result.sampling_rate,
          },
        },
        [result.audio.buffer]
      )
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred in the worker thread'
    ctx.postMessage({
      type: 'ERROR',
      payload: message,
    })
  }
})
