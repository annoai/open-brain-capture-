// Vercel serverless function — thin proxy to the Open Brain MCP backend.
//
// Why a proxy?
//   The Open Brain endpoint requires an access key. Putting the key directly
//   in the frontend bundle would expose it publicly. This route keeps secrets
//   server-side and gives the frontend a single, simple POST endpoint.
//
// How it calls the backend:
//   Open Brain uses MCP's StreamableHTTPTransport, which accepts JSON-RPC 2.0
//   messages over HTTP POST. We don't need the full MCP SDK — a plain fetch
//   with the right JSON shape is enough.
//
// Required Vercel environment variables (set in the Vercel dashboard):
//   OPEN_BRAIN_API_URL   — e.g. https://<ref>.supabase.co/functions/v1/open-brain-mcp
//   OPEN_BRAIN_ACCESS_KEY — your MCP_ACCESS_KEY value from Supabase secrets

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { content } = req.body ?? {}

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'content is required' })
  }

  const apiUrl    = process.env.OPEN_BRAIN_API_URL
  const accessKey = process.env.OPEN_BRAIN_ACCESS_KEY

  if (!apiUrl || !accessKey) {
    console.error('Missing OPEN_BRAIN_API_URL or OPEN_BRAIN_ACCESS_KEY env vars')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  // MCP JSON-RPC 2.0 tool call — matches the StreamableHTTPTransport protocol
  const mcpPayload = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'capture_thought',
      arguments: { content: content.trim() },
    },
  }

  let backendRes
  try {
    backendRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-brain-key': accessKey,
      },
      body: JSON.stringify(mcpPayload),
    })
  } catch (err) {
    console.error('Open Brain fetch failed:', err)
    return res.status(502).json({ error: 'Could not reach Open Brain backend' })
  }

  if (!backendRes.ok) {
    const body = await backendRes.text().catch(() => '')
    console.error('Open Brain error:', backendRes.status, body)
    return res.status(502).json({ error: `Backend returned ${backendRes.status}` })
  }

  // The MCP response is a JSON-RPC result. The confirmation text lives at:
  //   result.content[0].text  (based on the capture_thought tool implementation)
  //
  // NOTE: StreamableHTTPTransport may return an SSE stream or a JSON body
  // depending on the Accept header. We request JSON explicitly via Content-Type.
  // If your backend returns SSE, you may need to parse the stream here instead.
  let data
  try {
    data = await backendRes.json()
  } catch {
    // Response wasn't JSON — still treat as success
    return res.status(200).json({ message: 'Captured!' })
  }

  // Extract confirmation text from MCP result envelope
  const message =
    data?.result?.content?.[0]?.text ??
    data?.result ??
    'Captured!'

  return res.status(200).json({ message: String(message) })
}
