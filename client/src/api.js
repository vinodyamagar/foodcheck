export async function postQuery(query, profile) {
  const API_BASE = import.meta.env.PROD ? (import.meta.env.VITE_API_BASE || '') : ''
  const res = await fetch(`${API_BASE}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, profile })
  })
  if (!res.ok) {
    let msg = 'Request failed'
    try {
      const data = await res.json()
      if (data && data.message) msg = data.message
    } catch {}
    throw new Error(msg)
  }
  return res.json()
}

