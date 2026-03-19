interface Props {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export function TagsField({ value, onChange, disabled }: Props) {
  return (
    <div>
      <label className="field-label" htmlFor="tags">Tags (optional)</label>
      <input
        id="tags"
        type="text"
        className="field-input"
        placeholder="work, idea, follow-up…"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  )
}
