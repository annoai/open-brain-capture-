import { useState } from 'react'
import { AudioRecorder } from './components/AudioRecorder'
import { TagsField } from './components/TagsField'
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
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<Status>({ type: 'idle' })

  // Called by AudioRecorder when a transcript is ready.
  // Appends to existing text so typing + dictating can coexist.
  const handleTranscript = (transcript: string) => {
    setText(prev => (prev ? prev + ' ' + transcript : transcript).trim())
  }

  const handleSave = async () => {
    const trimmed = text.trim()
    if (!trimmed) return

    // Build the content string. Tags and category are appended as plain text
    // so the backend's AI metadata extractor can pick them up naturally.
    let content = trimmed
    if (category) content += `\n\nCategory: ${category}`
    if (tags) content += `\nTags: ${tags}`

    setStatus({ type: 'loading' })
    const result = await captureThought(content)

    if (result.ok) {
      setStatus({ type: 'success', message: result.message ?? 'Captured!' })
      setText('')
      setTags('')
      setCategory('')
      // Auto-clear success message after 3 s
      setTimeout(() => setStatus({ type: 'idle' }), 3000)
    } else {
      setStatus({ type: 'error', message: result.error ?? 'Something went wrong.' })
    }
  }

  const isSaving = status.type === 'loading'
  const canSave  = text.trim().length > 0 && !isSaving

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">Open Brain Capture</h1>
        <p className="app-subtitle">Capture a thought fast</p>
      </header>

      {/* Main input card */}
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

      {/* Optional metadata */}
      <div className="optional-fields">
        <TagsField value={tags} onChange={setTags} disabled={isSaving} />
        <CategorySelector value={category} onChange={setCategory} disabled={isSaving} />
      </div>

      {/* Save button */}
      <button
        className="btn-save"
        onClick={handleSave}
        disabled={!canSave}
      >
        {isSaving ? 'Saving…' : 'Save to Open Brain'}
      </button>

      {/* Feedback */}
      {status.type !== 'idle' && (
        <StatusMessage status={status} />
      )}
    </main>
  )
}
