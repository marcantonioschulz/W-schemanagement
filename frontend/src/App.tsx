import React, { useCallback, useEffect, useState } from 'react'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type LaundryStatus = 'dirty' | 'washing' | 'drying' | 'clean' | 'folded'

type LaundryItem = {
  id: number
  label: string
  material?: string | null
  color?: string | null
  tag_id?: string | null
  status: LaundryStatus
}

const STATUSES: LaundryStatus[] = ['dirty', 'washing', 'drying', 'clean', 'folded']

export default function App() {
  const [health, setHealth] = useState<string>('checking...')
  const [context, setContext] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [provider, setProvider] = useState<string>('')
  const [providers, setProviders] = useState<string[]>([])
  const [items, setItems] = useState<LaundryItem[]>([])
  const [formData, setFormData] = useState({
    label: '',
    material: '',
    color: '',
    tag_id: '',
    status: 'dirty' as LaundryStatus
  })
  const [formError, setFormError] = useState<string | null>(null)

  const refreshLaundry = useCallback(async () => {
    try {
      const r = await fetch(`${apiUrl}/api/laundry/`)
      if (!r.ok) throw new Error('Failed to load laundry items')
      const data = await r.json()
      setItems(data)
    } catch (err) {
      console.error(err)
      setItems([])
    }
  }, [])

  useEffect(() => {
    fetch(`${apiUrl}/api/health`).then(r => r.json()).then(j => setHealth(j.status || 'unknown')).catch(() => setHealth('error'))
    fetch(`${apiUrl}/api/providers`).then(r => r.json()).then(j => { setProviders(j.providers || []); setProvider(j.active || '') }).catch(() => {})
    refreshLaundry()
  }, [refreshLaundry])

  async function onSuggest(e: React.FormEvent) {
    e.preventDefault()
    setSuggestion('...')
    try {
      const r = await fetch(`${apiUrl}/api/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      })
      const j = await r.json()
      setSuggestion(j.suggestion || '')
      if (j.provider) {
        setProvider(j.provider)
      }
    } catch (err) {
      console.error(err)
      setSuggestion('Error fetching suggestion')
    }
  }

  async function onCreateItem(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!formData.label.trim()) {
      setFormError('Label is required')
      return
    }
    const payload: Record<string, string> = { label: formData.label.trim(), status: formData.status }
    if (formData.material.trim()) payload.material = formData.material.trim()
    if (formData.color.trim()) payload.color = formData.color.trim()
    if (formData.tag_id.trim()) payload.tag_id = formData.tag_id.trim()
    try {
      const r = await fetch(`${apiUrl}/api/laundry/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!r.ok) {
        const error = await r.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(error.detail)
      }
      setFormData({ label: '', material: '', color: '', tag_id: '', status: 'dirty' })
      refreshLaundry()
    } catch (err) {
      console.error(err)
      setFormError(err instanceof Error ? err.message : 'Failed to create item')
    }
  }

  async function onUpdateStatus(id: number, status: LaundryStatus) {
    try {
      const r = await fetch(`${apiUrl}/api/laundry/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!r.ok) throw new Error('Failed to update item')
      refreshLaundry()
    } catch (err) {
      console.error(err)
    }
  }

  async function onDeleteItem(id: number) {
    try {
      await fetch(`${apiUrl}/api/laundry/${id}`, { method: 'DELETE' })
      refreshLaundry()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', margin: '2rem', maxWidth: 900 }}>
      <h1>Laundry AI</h1>
      <p>Backend health: <strong>{health}</strong></p>
      <p>Active provider: <code>{provider}</code></p>
      <p>Available providers: {providers.join(', ') || '—'}</p>

      <section style={{ marginTop: '2rem' }}>
        <h2>AI Helper</h2>
        <form onSubmit={onSuggest} style={{ marginTop: '1rem' }}>
          <label>
            Context:
            <input value={context} onChange={e => setContext(e.target.value)} style={{ marginLeft: 8, width: 300 }} />
          </label>
          <button type="submit" style={{ marginLeft: 8 }}>Suggest</button>
        </form>
        {suggestion && (
          <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd', background: '#fafafa' }}>
            <strong>Suggestion:</strong>
            <div>{suggestion}</div>
          </div>
        )}
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Laundry Inventory</h2>
        <form onSubmit={onCreateItem} style={{ display: 'grid', gap: '0.5rem', maxWidth: 500 }}>
          <div>
            <label style={{ display: 'block' }}>Label *</label>
            <input value={formData.label} onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block' }}>Material</label>
            <input value={formData.material} onChange={e => setFormData(prev => ({ ...prev, material: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block' }}>Color</label>
            <input value={formData.color} onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block' }}>Tag ID</label>
            <input value={formData.tag_id} onChange={e => setFormData(prev => ({ ...prev, tag_id: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block' }}>Initial status</label>
            <select value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as LaundryStatus }))}>
              {STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          {formError && <p style={{ color: 'red' }}>{formError}</p>}
          <button type="submit">Add item</button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          {items.length === 0 ? (
            <p>No laundry items tracked yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', paddingBottom: 4 }}>Label</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', paddingBottom: 4 }}>Material</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', paddingBottom: 4 }}>Color</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', paddingBottom: 4 }}>Tag</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', paddingBottom: 4 }}>Status</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', paddingBottom: 4 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.25rem 0' }}>{item.label}</td>
                    <td>{item.material || '—'}</td>
                    <td>{item.color || '—'}</td>
                    <td>{item.tag_id || '—'}</td>
                    <td>
                      <select value={item.status} onChange={e => onUpdateStatus(item.id, e.target.value as LaundryStatus)}>
                        {STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button type="button" onClick={() => onDeleteItem(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
