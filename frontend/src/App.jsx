import { useState } from 'react'
import './App.css'

const API = import.meta.env.VITE_API_URL || '/api'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setCreated(null)
    try {
      const res = await fetch(`${API}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setCreated(data)
      setUrl('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="hero">
        <div className="hero-icon">🔗</div>
        <h1>Link Tracker</h1>
        <p>Shorten links and track every click</p>
      </div>

      <div className="create-card">
        <form onSubmit={handleCreate}>
          <div className="input-row">
            <input
              className="url-input"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Paste your long URL here..."
              required
            />
            <button className="shorten-btn" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Shortening</> : 'Shorten →'}
            </button>
          </div>
          {error && (
            <div className="error-alert">
              <span>⚠</span> {error}
            </div>
          )}
        </form>
      </div>

      {created && (
        <div className="result-card">
          <div className="result-info">
            <div className="result-label">Your short link is ready</div>
            <div className="result-url">{created.short_url}</div>
            <div className="result-warning">⚠ Save this — you won't see it again</div>
          </div>
          <CopyButton text={created.short_url} />
        </div>
      )}

      {!created && (
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <p>Your link is shown once after creation.<br />Copy it — it won't be listed here.</p>
        </div>
      )}
    </div>
  )
}
