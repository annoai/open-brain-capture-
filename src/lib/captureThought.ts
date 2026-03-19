// Sends the final text content to our Vercel API proxy at /api/capture.
// The proxy holds the backend URL and access key server-side so they are
// never exposed in the browser bundle.

export interface CaptureResult {
  ok: boolean
  message?: string   // confirmation text from Open Brain on success
  error?: string     // human-readable error on failure
}

export async function captureThought(content: string): Promise<CaptureResult> {
  try {
    const res = await fetch('/api/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return { ok: false, error: data?.error ?? `Server error ${res.status}` }
    }

    return { ok: true, message: data?.message ?? 'Captured!' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error'
    return { ok: false, error: msg }
  }
}
