import type { Status } from '../App'

interface Props {
  status: Exclude<Status, { type: 'idle' }>
}

const MESSAGES: Record<string, string> = {
  loading: '⏳ Saving to Open Brain…',
}

export function StatusMessage({ status }: Props) {
  const text =
    status.type === 'loading'
      ? MESSAGES.loading
      : status.message

  return <div className={`status ${status.type}`}>{text}</div>
}
