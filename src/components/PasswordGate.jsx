import React, { useState } from 'react'

const PASSWORD = '2974567!'

export default function PasswordGate({ children }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem('budget-auth') === '1' } catch { return false }
  })

  function attempt(e) {
    e.preventDefault()
    if (input === PASSWORD) {
      try { sessionStorage.setItem('budget-auth', '1') } catch {}
      setAuthed(true)
    } else {
      setError(true)
      setInput('')
      setTimeout(() => setError(false), 2000)
    }
  }

  if (authed) return children

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: 24,
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, padding: '40px 36px',
        width: '100%', maxWidth: 360,
        boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'var(--blue-light)', border: '1px solid var(--blue-mid)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: 22,
        }}>🔒</div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
          Budget — Joe & Lisa
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 28 }}>
          Enter your password to continue
        </p>
        <form onSubmit={attempt}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: '100%', padding: '11px 14px', fontSize: 15,
              border: `1.5px solid ${error ? 'var(--red)' : 'var(--border2)'}`,
              borderRadius: 'var(--radius-sm)', outline: 'none',
              background: error ? 'var(--red-light)' : 'var(--surface)',
              color: 'var(--text)', marginBottom: 12,
              transition: 'border-color 0.2s, background 0.2s',
            }}
          />
          {error && (
            <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>
              Incorrect password. Try again.
            </p>
          )}
          <button type="submit" style={{
            width: '100%', padding: '11px', fontSize: 14, fontWeight: 500,
            background: 'var(--blue)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.target.style.opacity = '0.88'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  )
}
