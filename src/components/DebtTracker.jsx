import React, { useState } from 'react'
import { fmt } from '../utils'

const PRIORITY_COLORS = [
  { bg: '#FADBD8', fg: '#C0392B', border: '#F5B7B1' },
  { bg: '#FDEBD0', fg: '#CC5500', border: '#FAD7A0' },
  { bg: '#FFF8DC', fg: '#B8860B', border: '#F9E79F' },
  { bg: '#D5F5E3', fg: '#1A6B2F', border: '#A9DFBF' },
]

const TIPS = [
  { title: 'Call Discover — ask for APR cut', body: 'Call the number on your card and ask to lower your rate. They do this quietly and often say yes. 22.5% → 18% saves ~$170/yr.' },
  { title: '0% Balance Transfer', body: 'Move the Discover balance to a 0% intro APR card (18–21 months). 3% fee = ~$115 one-time vs. hundreds in interest. Worth 20 min of research.' },
  { title: 'Automate all minimums', body: 'Set every bill to autopay the minimum so you never miss. One missed payment triggers penalty rates and hurts your credit score. Throw extra cash manually at your #1 target.' },
  { title: 'Build a $500 floor', body: "Your paychecks often end with $55–$160 remaining. One repair bill and you're reaching for a card. Park $500 untouched in a separate account as your true emergency buffer." },
  { title: 'High-Yield Savings (HYSA)', body: 'Ally, Marcus, or SoFi pay 4–5% APY on savings. Move your emergency fund there — earns real money sitting still. Takes 5 min to open.' },
  { title: 'Snowball momentum', body: "Once CareCredit is gone, roll that $90/mo autopay + all your extra payments into Discover. Each payoff funds the next one faster — this is how it accelerates." },
]

function EditableField({ value, onSave, prefix = '', isMoney = false }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')

  function start() { setVal(String(value)); setEditing(true) }
  function commit() {
    const n = parseFloat(val)
    if (!isNaN(n) && n >= 0) onSave(n)
    setEditing(false)
  }

  if (editing) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {isMoney && <span style={{ fontSize: 13 }}>$</span>}
        <input
          autoFocus
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          style={{
            width: 90, fontSize: 14, fontFamily: 'DM Mono, monospace',
            border: '1.5px solid #3D6FE8', borderRadius: 5, padding: '2px 6px',
            outline: 'none', background: '#EEF3FD',
          }}
        />
      </span>
    )
  }

  return (
    <span
      onClick={start}
      title="Click to edit"
      style={{ cursor: 'pointer', borderBottom: '1px dashed #CBD3E8', paddingBottom: 1 }}
    >
      {prefix}{isMoney ? fmt(value) : value}
    </span>
  )
}

export default function DebtTracker({ debts, onUpdateDebt }) {
  const total = debts.reduce((s, d) => s + d.balance, 0)
  const sorted = [...debts].sort((a, b) => a.priority - b.priority)

  return (
    <div>
      {/* Total banner */}
      <div style={{
        background: '#1B2A4A', borderRadius: 10, padding: '14px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Total debt</span>
        <span style={{ color: '#fff', fontSize: 22, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmt(total)}</span>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16, textAlign: 'center' }}>
        Tap any balance or minimum to update it as you pay things down.
      </p>

      {/* Attack order */}
      <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Attack order
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {sorted.map(d => {
          const pc = PRIORITY_COLORS[Math.min(d.priority, 3)]
          const pct = total > 0 ? (d.balance / total) * 100 : 0
          return (
            <div key={d.id} style={{
              background: pc.bg, border: `1px solid ${pc.border}`,
              borderRadius: 10, padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: pc.fg, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, flexShrink: 0, marginTop: 1,
                }}>
                  {d.priority === 0 ? '—' : d.priority}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: pc.fg }}>{d.name}</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: pc.fg, fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>
                      <EditableField
                        value={d.balance}
                        isMoney={true}
                        onSave={v => onUpdateDebt(d.id, 'balance', v)}
                      />
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pc.fg, borderRadius: 2, opacity: 0.6 }} />
                  </div>

                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#6B7280' }}>APR: <strong>{d.apr}</strong></span>
                    <span style={{ fontSize: 11, color: '#6B7280' }}>
                      Min:{' '}
                      <strong>
                        {d.min > 0
                          ? <EditableField value={d.min} isMoney={true} onSave={v => onUpdateDebt(d.id, 'min', v)} />
                          : '—'}
                      </strong>
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: '#6B7280', marginTop: 5, lineHeight: 1.4 }}>{d.note}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Smart money moves
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {TIPS.map(tip => (
          <div key={tip.title} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1B2A4A', marginBottom: 3 }}>{tip.title}</div>
            <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{tip.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}