import { useState } from 'react'
import { AudioRecorder } from './components/AudioRecorder'
import { CategorySelector } from './components/CategorySelector'
import { StatusMessage } from './components/StatusMessage'
import { captureThought } from './lib/captureThought'

export type Status =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

export default function App() {
  const [text, setText] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<Status>({ type: 'idle' })

  const handleTranscript = (transcript: string) => {
    setText(prev => (prev ? prev + ' ' + transcript : transcript).trim())
  }

  const handleSave = async () => {
    const trimmed = text.trim()
    if (!trimmed || !category) return

    // Force the selected category to be the only tag sent to Open Brain.
    let content = trimmed
    content += `\n\nCategory: ${category}`
    content += `\nTags: ${category}`

    setStatus({ type: 'loading' })
    const result = await captureThought(content)

    if (result.ok) {
      setStatus({ type: 'success', message: result.message ?? 'Captured!' })
      setText('')
      setCategory('')
      setTimeout(() => setStatus({ type: 'idle' }), 3000)
    } else {
      setStatus({ type: 'error', message: result.error ?? 'Something went wrong.' })
    }
  }

  const isSaving = status.type === 'loading'
  const canSave = text.trim().length > 0 && category.length > 0 && !isSaving

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">Open Brain Capture</h1>
        <p className="app-subtitle">Capture a thought fast</p>
      </header>

      <div className="card">
        <textarea
          className="thought-textarea"
          placeholder="What's on your mind?"
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={isSaving}
          autoFocus
        />
        <div className="divider" />
        <AudioRecorder onTranscript={handleTranscript} disabled={isSaving} />
      </div>

      <div className="optional-fields">
        <CategorySelector value={category} onChange={setCategory} disabled={isSaving} />
      </div>

      <button
        className="btn-save"
        onClick={handleSave}
        disabled={!canSave}
      >
        {isSaving ? 'Saving…' : 'Save to Open Brain'}
      </button>

      {status.type !== 'idle' && (
        <StatusMessage status={status} />
      )}
    </main>
  )
}
