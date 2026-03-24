import React, { useState } from 'react'
import { fmt } from '../utils'

const PRIORITY_COLORS = [
  { bg: '#FADBD8', fg: '#C0392B', border: '#F5B7B1' },
  { bg: '#FDEBD0', fg: '#CC5500', border: '#FAD7A0' },
  { bg: '#FFF8DC', fg: '#B8860B', border: '#F9E79F' },
  { bg: '#D5F5E3', fg: '#1A6B2F', border: '#A9DFBF' },
  { bg: '#F0F3FA', fg: '#5A6278', border: '#CBD3E8' }, // fallback for priority > 3
]

const TIPS = [
  { title: 'Call Discover - ask for APR cut', body: 'Call the number on your card and ask to lower your rate. They do this quietly and often say yes. 22.5% → 18% saves ~$170/yr.' },
  { title: '0% Balance Transfer', body: 'Move the Discover balance to a 0% intro APR card (18–21 months). 3% fee = ~$115 one-time vs. hundreds in interest. Worth 20 min of research.' },
  { title: 'Automate all minimums', body: 'Set every bill to autopay the minimum so you never miss. One missed payment triggers penalty rates and hurts your credit score. Throw extra cash manually at your #1 target.' },
  { title: 'Build a $500 floor', body: "Your paychecks often end with $55–$160 remaining. One repair bill and you're reaching for a card. Park $500 untouched in a separate account as your true emergency buffer." },
  { title: 'High-Yield Savings (HYSA)', body: 'Ally, Marcus, or SoFi pay 4–5% APY on savings. Move your emergency fund there - earns real money sitting still. Takes 5 min to open.' },
  { title: 'Snowball momentum', body: "Once CareCredit is gone, roll that $90/mo autopay + all your extra payments into Discover. Each payoff funds the next one faster - this is how it accelerates." },
]

function InlineEdit({ value, onSave, type = 'text', prefix = '', placeholder = '', style = {} }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')

  function start(e) {
    e.stopPropagation()
    setVal(String(value))
    setEditing(true)
  }

  function commit() {
    const parsed = type === 'number' ? (parseFloat(val) || 0) : val.trim()
    if (String(parsed) !== String(value)) onSave(parsed)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        type={type === 'number' ? 'number' : 'text'}
        inputMode={type === 'number' ? 'decimal' : 'text'}
        value={val}
        placeholder={placeholder}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        style={{
          fontSize: 14, fontFamily: type === 'number' ? 'DM Mono, monospace' : 'inherit',
          border: '1.5px solid #3D6FE8', borderRadius: 5, padding: '2px 6px',
          outline: 'none', background: '#EEF3FD',
          width: type === 'number' ? 90 : 130,
          ...style,
        }}
      />
    )
  }

  return (
    <span
      onClick={start}
      title="Tap to edit"
      style={{ cursor: 'pointer', borderBottom: '1px dashed rgba(0,0,0,0.2)', paddingBottom: 1, ...style }}
    >
      {prefix}{type === 'number' ? fmt(value) : value}
    </span>
  )
}

export default function DebtTracker({ debts, onUpdateDebt, onAddDebt, onRemoveDebt }) {
  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [newName, setNewName] = useState('')
  const [newBalance, setNewBalance] = useState('')
  const [newApr, setNewApr] = useState('')
  const [newMin, setNewMin] = useState('')
  const [newNote, setNewNote] = useState('')

  const total = debts.reduce((s, d) => s + d.balance, 0)
  const sorted = [...debts].sort((a, b) => a.priority - b.priority)

  function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim() || !newBalance) return
    onAddDebt(newName.trim(), newBalance, newApr, newMin, newNote.trim())
    setNewName(''); setNewBalance(''); setNewApr(''); setNewMin(''); setNewNote('')
    setAdding(false)
  }

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
        Tap any balance, minimum, APR, or name to edit it.
      </p>

      {/* Attack order label */}
      <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Attack order
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {sorted.map(d => {
          const pc = PRIORITY_COLORS[Math.min(d.priority, PRIORITY_COLORS.length - 1)]
          const pct = total > 0 ? (d.balance / total) * 100 : 0

          return (
            <div key={d.id}>
              <div style={{
                background: pc.bg, border: `1px solid ${pc.border}`,
                borderRadius: 10, padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Priority badge */}
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: pc.fg, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, flexShrink: 0, marginTop: 1,
                  }}>
                    {d.priority === 0 ? '1' : d.priority + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + Balance row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: pc.fg }}>
                        <InlineEdit
                          value={d.name}
                          onSave={v => onUpdateDebt(d.id, 'name', v)}
                          style={{ color: pc.fg, fontWeight: 600, fontSize: 14 }}
                        />
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: pc.fg, fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>
                        <InlineEdit
                          value={d.balance}
                          type="number"
                          onSave={v => onUpdateDebt(d.id, 'balance', v)}
                          style={{ color: pc.fg, fontFamily: 'DM Mono, monospace', fontSize: 16, fontWeight: 700 }}
                        />
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pc.fg, borderRadius: 2, opacity: 0.6 }} />
                    </div>

                    {/* APR + Min row */}
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>
                        APR:{' '}
                        <strong>
                          <InlineEdit
                            value={d.apr}
                            onSave={v => onUpdateDebt(d.id, 'apr', v)}
                            placeholder="e.g. 22.5%"
                            style={{ fontSize: 11, fontWeight: 600 }}
                          />
                        </strong>
                      </span>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>
                        Min:{' '}
                        <strong>
                          <InlineEdit
                            value={d.min}
                            type="number"
                            onSave={v => onUpdateDebt(d.id, 'min', v)}
                            style={{ fontSize: 11, fontWeight: 600 }}
                          />
                        </strong>
                      </span>
                    </div>

                    {/* Note */}
                    {d.note && (
                      <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4, margin: 0 }}>{d.note}</p>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => setConfirmDelete(d.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(0,0,0,0.2)', fontSize: 18, lineHeight: 1,
                      padding: '0 2px', minWidth: 28, minHeight: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#D63B3B'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.2)'}
                    title="Delete debt"
                  >×</button>
                </div>
              </div>

              {/* Confirm delete */}
              {confirmDelete === d.id && (
                <div style={{
                  background: '#FEF0F0', border: '1px solid #F5BCBC',
                  borderRadius: 8, padding: '10px 12px', marginTop: 4,
                  display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 12, color: '#D63B3B', flex: 1 }}>
                    Remove "{d.name}" from debt tracker?
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #F5BCBC', background: '#fff', fontSize: 12, cursor: 'pointer' }}
                    >Cancel</button>
                    <button
                      onClick={() => { onRemoveDebt(d.id); setConfirmDelete(null) }}
                      style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#D63B3B', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >Remove</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add debt */}
      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          style={{
            width: '100%', padding: '10px', marginBottom: 24,
            background: '#EEF3FD', border: '1.5px dashed #C7D7F9',
            borderRadius: 8, fontSize: 13, fontWeight: 500,
            color: '#3D6FE8', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <span style={{ fontSize: 16 }}>+</span> Add a debt
        </button>
      ) : (
        <div style={{
          background: '#EEF3FD', border: '1.5px solid #C7D7F9',
          borderRadius: 10, padding: '14px', marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#2A52B8', marginBottom: 10 }}>New Debt</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              autoFocus
              placeholder="Name (e.g. Capital One)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{ fontSize: 13, padding: '8px 10px', border: '1px solid #C7D7F9', borderRadius: 6, outline: 'none', background: '#fff' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #C7D7F9', borderRadius: 6, padding: '8px 10px' }}>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>$</span>
                <input
                  type="number" inputMode="decimal" placeholder="Balance"
                  value={newBalance} onChange={e => setNewBalance(e.target.value)}
                  style={{ flex: 1, fontSize: 13, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'DM Mono, monospace' }}
                />
              </div>
              <input
                placeholder="APR (e.g. 22%)"
                value={newApr} onChange={e => setNewApr(e.target.value)}
                style={{ width: 110, fontSize: 13, padding: '8px 10px', border: '1px solid #C7D7F9', borderRadius: 6, outline: 'none', background: '#fff' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #C7D7F9', borderRadius: 6, padding: '8px 10px' }}>
              <span style={{ fontSize: 13, color: 'var(--text3)' }}>Min $</span>
              <input
                type="number" inputMode="decimal" placeholder="Minimum payment"
                value={newMin} onChange={e => setNewMin(e.target.value)}
                style={{ flex: 1, fontSize: 13, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'DM Mono, monospace' }}
              />
            </div>
            <input
              placeholder="Note (optional)"
              value={newNote} onChange={e => setNewNote(e.target.value)}
              style={{ fontSize: 13, padding: '8px 10px', border: '1px solid #C7D7F9', borderRadius: 6, outline: 'none', background: '#fff' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setAdding(false); setNewName(''); setNewBalance(''); setNewApr(''); setNewMin(''); setNewNote('') }}
                style={{ flex: 1, padding: '8px', borderRadius: 7, border: '1px solid #C7D7F9', background: '#fff', fontSize: 13, cursor: 'pointer', color: 'var(--text2)' }}
              >Cancel</button>
              <button
                onClick={handleAdd}
                style={{ flex: 2, padding: '8px', borderRadius: 7, border: 'none', background: '#3D6FE8', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >Add Debt</button>
            </div>
          </div>
        </div>
      )}

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