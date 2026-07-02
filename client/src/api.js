export async function postQuery(query, profile) {
  const res = await fetch('/api/query', {
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
