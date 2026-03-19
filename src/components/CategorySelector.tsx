// Category options mirror the types the Open Brain backend AI extractor uses.
// Selecting one appends "Category: <type>" to the content so the extractor
// gets a hint — it will still auto-classify, but this nudges it.
const CATEGORIES = [
  { value: '',            label: 'Auto-detect' },
  { value: 'observation', label: 'Observation' },
  { value: 'task',        label: 'Task' },
  { value: 'idea',        label: 'Idea' },
  { value: 'reference',   label: 'Reference' },
  { value: 'person_note', label: 'Person note' },
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
