const CATEGORIES = [
  { value: 'daily_log', label: 'Daily Log' },
  { value: 'daily_priority', label: 'Daily Priority' },
  { value: 'progress_tracker', label: 'Progress Tracker' },
]

interface Props {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export function CategorySelector({ value, onChange, disabled }: Props) {
  return (
    <div>
      <label className="field-label" htmlFor="category">Category</label>
      <select
        id="category"
        className="field-select"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="" disabled>Select category</option>
        {CATEGORIES.map(c => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
    </div>
  )
}
