import { useEffect, useRef, useState } from 'react'

// ── Transcription strategy note ──────────────────────────────────────────────
//
// We use the browser's built-in Web Speech API (SpeechRecognition).
//
// Pros:
//   - Zero latency, zero cost, no backend needed
//   - Works well on Android Chrome (primary target) and desktop Chrome/Edge
//   - Transcript is live so the user sees words appear as they speak
//
// Cons:
//   - Not supported in Firefox or Safari (falls back to manual entry)
//   - Accuracy depends on Google's cloud (data leaves the device on Chrome)
//   - No audio file produced — can't replay or re-transcribe
//
// Alternative (backend transcription):
//   If you want offline use, Firefox support, or higher accuracy, swap this
//   component for one that uses MediaRecorder to capture a .webm blob, POSTs
//   it to a /api/transcribe Vercel route that calls Whisper (OpenAI or local),
//   and returns the transcript text. The rest of the app stays unchanged because
//   both approaches ultimately call onTranscript(text).
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  onTranscript: (text: string) => void
  disabled?: boolean
}

// Augment window type for browser SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export function AudioRecorder({ onTranscript, disabled }: Props) {
  const [supported]  = useState(() => getSpeechRecognition() !== null)
  const [recording, setRecording] = useState(false)
  const [interim, setInterim]     = useState('')
  const recogRef = useRef<SpeechRecognition | null>(null)

  // Clean up on unmount
  useEffect(() => () => { recogRef.current?.stop() }, [])

  const startRecording = () => {
    const SR = getSpeechRecognition()
    if (!SR) return

    const recog = new SR()
    recog.continuous     = true
    recog.interimResults = true
    recog.lang           = navigator.language || 'en-US'

    recog.onresult = (e: SpeechRecognitionEvent) => {
      let finalChunk = ''
      let interimChunk = ''

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        if (result.isFinal) {
          finalChunk += result[0].transcript
        } else {
          interimChunk += result[0].transcript
        }
      }

      if (finalChunk) onTranscript(finalChunk.trim())
      setInterim(interimChunk)
    }

    recog.onerror = () => {
      setRecording(false)
      setInterim('')
    }

    recog.onend = () => {
      setRecording(false)
      setInterim('')
    }

    recogRef.current = recog
    recog.start()
    setRecording(true)
    setInterim('')
  }

  const stopRecording = () => {
    recogRef.current?.stop()
    recogRef.current = null
    setRecording(false)
    setInterim('')
  }

  if (!supported) {
    return (
      <p className="recorder-status">
        Voice input not supported in this browser. Use Chrome or Edge, or just type above.
      </p>
    )
  }

  return (
    <div className="recorder">
      {recording
        ? (
          <button
            type="button"
            className="btn-record recording"
            onClick={stopRecording}
            disabled={disabled}
          >
            <span className="dot" />
            Stop
          </button>
        )
        : (
          <button
            type="button"
            className="btn-record"
            onClick={startRecording}
            disabled={disabled}
          >
            🎙 Record
          </button>
        )
      }

      <span className={`recorder-status${recording ? ' listening' : ''}`}>
        {recording
          ? (interim ? interim : 'Listening…')
          : 'Tap to dictate'
        }
      </span>
    </div>
  )
}
