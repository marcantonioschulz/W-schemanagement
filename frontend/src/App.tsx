import React, { useEffect, useState } from 'react'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [health, setHealth] = useState<string>('checking...')
  const [context, setContext] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [provider, setProvider] = useState<string>('')
  const [providers, setProviders] = useState<string[]>([])

  useEffect(() => {
    fetch(`${apiUrl}/api/health`).then(r => r.json()).then(j => setHealth(j.status || 'unknown')).catch(() => setHealth('error'))
    fetch(`${apiUrl}/api/providers`).then(r => r.json()).then(j => { setProviders(j.providers||[]); setProvider(j.active||'') }).catch(() => {})
  }, [])

  async function onSuggest(e: React.FormEvent) {
    e.preventDefault()
    setSuggestion('...')
    const r = await fetch(`${apiUrl}/api/ai/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context })
    })
    const j = await r.json()
    setSuggestion(j.suggestion || '')
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', margin: '2rem' }}>
      <h1>Laundry AI</h1>
      <p>Backend health: <strong>{health}</strong></p>
      <p>Active provider: <code>{provider}</code></p>
      <p>Available providers: {providers.join(', ')}</p>
      <form onSubmit={onSuggest} style={{ marginTop: '1rem' }}>
        <label>
          Context:
          <input value={context} onChange={e => setContext(e.target.value)} style={{ marginLeft: 8, width: 300 }} />
        </label>
        <button type="submit" style={{ marginLeft: 8 }}>Suggest</button>
      </form>
      {suggestion && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd' }}>
          <strong>Suggestion:</strong>
          <div>{suggestion}</div>
        </div>
      )}
    </div>
  )
}
