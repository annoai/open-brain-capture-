// Category options mirror the types the Open Brain backend AI extractor uses.
// Selecting one appends "Category: <type>" to the content so the extractor
// gets a hint — it will still auto-classify, but this nudges it.
const CATEGORIES = [
  { value: '',            label: 'Auto-detect' },
  { value: 'observation', label: 'Daily log' },
  { value: 'task',        label: 'Daily priority' },
  { value: 'idea',        label: 'Taks' },
  { value: 'progress_tracker', label: 'Progress tracker' },
]

interface Props {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export function CategorySelector({ value, onChange, disabled }: Props) {
  return (
    <div>
      <label className="field-label" htmlFor="category">Category (optional)</label>
      <select
        id="category"
        className="field-select"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      >
        {CATEGORIES.map(c => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
    </div>
  )
}
