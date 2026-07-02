import React, { useState } from 'react'
import { postQuery } from './api'

export default function App() {
  const [query, setQuery] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    const q = query.trim()
    if (!q) {
      setError('Please enter a question.')
      return
    }
    setLoading(true)
    try {
      const profile = {}
      if (age) {
        const n = Number(age)
        if (!Number.isNaN(n)) profile.childAgeYears = n
      }
      const data = await postQuery(q, profile)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16, fontFamily: 'system-ui, Arial, sans-serif' }}>
      <h1>Packaged Food Safety Advisor</h1>
      <p>Ask a question about packaged foods in India and get cautious, practical guidance. English only. This is general information and not medical advice.</p>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="query">Your question</label><br />
          <textarea id="query" rows={3} style={{ width: '100%' }} value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g., Is instant noodles safe for my 5-year-old?" />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="age">Child age (years, optional)</label><br />
          <input id="age" type="number" min="0" step="1" value={age} onChange={e => setAge(e.target.value)} />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Loading…' : 'Get advice'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: 16 }}>
          <h2>Answer</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{result.answer}</p>
          {result.recommendations?.length > 0 && (
            <div>
              <h3>Recommendations</h3>
              <ul>
                {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {result.sources?.length > 0 && (
            <div>
              <h3>Sources</h3>
              <ul>
                {result.sources.map((s, i) => (
                  <li key={i}>
                    {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.title || s.url}</a> : (s.title || 'Source')}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p style={{ fontSize: 12, color: '#555' }}>Disclaimer: Information only, not medical advice. Check labels and consult reliable guidance like FSSAI as needed.</p>
        </div>
      )}
    </div>
  )
}
