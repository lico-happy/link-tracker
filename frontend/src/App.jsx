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

  const [statsQuery, setStatsQuery] = useState('')
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')
  const [stats, setStats] = useState(null)

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

  const handleStats = async (e) => {
    e.preventDefault()
    setStatsLoading(true)
    setStatsError('')
    setStats(null)
    try {
      // Accept full URL or just the code
      let code = statsQuery.trim()
      try {
        const parsed = new URL(code)
        code = parsed.pathname.replace(/^\//, '')
      } catch {}

      const res = await fetch(`${API}/links/${code}/stats`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Link not found')
      setStats(data)
    } catch (err) {
      setStatsError(err.message)
    } finally {
      setStatsLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="hero">
        <div className="hero-icon">🔗</div>
        <h1>Link Tracker</h1>
        <p>Shorten links and track every click</p>
      </div>

      {/* Create */}
      <div className="section-label">Shorten a URL</div>
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
          {error && <div className="error-alert"><span>⚠</span> {error}</div>}
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

      <div className="divider" />

      {/* Stats lookup */}
      <div className="section-label">Check click stats</div>
      <div className="create-card">
        <form onSubmit={handleStats}>
          <div className="input-row">
            <input
              className="url-input"
              type="text"
              value={statsQuery}
              onChange={e => setStatsQuery(e.target.value)}
              placeholder="Paste your short link or code..."
              required
            />
            <button className="shorten-btn stats-btn" type="submit" disabled={statsLoading}>
              {statsLoading ? <><span className="spinner" /> Checking</> : 'Check →'}
            </button>
          </div>
          {statsError && <div className="error-alert"><span>⚠</span> {statsError}</div>}
        </form>
      </div>

      {stats && (
        <div className="stats-card">
          <div className="stats-clicks">
            <span className="stats-number">{stats.click_count}</span>
            <span className="stats-unit">click{stats.click_count !== 1 ? 's' : ''}</span>
          </div>
          <div className="stats-detail">
            <div className="stats-url">{stats.original_url}</div>
            <div className="stats-meta">/{stats.short_code}</div>
          </div>
        </div>
      )}
    </div>
  )
}
