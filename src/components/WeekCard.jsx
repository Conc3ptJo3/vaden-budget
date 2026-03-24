import React, { useState, useRef } from 'react'
import { fmt, getRemaining, remainingColor, isDebtPayment, isSavings } from '../utils'
import { INCOME } from '../data'

const TYPE_COLORS = {
  bonus:   { hdr: '#B8860B', badge: '#FFF8DC', badgeTxt: '#7A5700', badgeLabel: 'bonus month' },
  surgery: { hdr: '#6B0000', badge: '#FADBD8', badgeTxt: '#7B241C', badgeLabel: 'surgery' },
  payoff:  { hdr: '#1B2A4A', badge: '#D5F5E3', badgeTxt: '#1A6B2F', badgeLabel: 'debt payoff' },
  savings: { hdr: '#1B2A4A', badge: '#EEF2FB', badgeTxt: '#2E4A7A', badgeLabel: 'savings push' },
  normal:  { hdr: '#1B2A4A', badge: null, badgeLabel: null },
}

const REM_STYLES = {
  green:  { bg: '#D5F5E3', color: '#1A6B2F' },
  orange: { bg: '#FFF3CD', color: '#92400E' },
  red:    { bg: '#FADBD8', color: '#C0392B' },
}

export default function WeekCard({ week, onAddExpense, onRemoveExpense, onUpdateExpense }) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmt, setNewAmt] = useState('')
  const [editingId, setEditingId] = useState(null)
  const nameRef = useRef()

  const rem = getRemaining(week)
  const remKey = remainingColor(rem)
  const tc = TYPE_COLORS[week.type] || TYPE_COLORS.normal
  const remStyle = REM_STYLES[remKey]

  function handleAdd(e) {
    e.preventDefault()
    const name = newName.trim()
    const amount = parseFloat(newAmt)
    if (!name || isNaN(amount) || amount <= 0) return
    onAddExpense(week.id, name, amount)
    setNewName('')
    setNewAmt('')
    nameRef.current?.focus()
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
      marginBottom: 10,
    }}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background: tc.hdr,
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' }}>
            {week.date}
          </span>
          {tc.badge && (
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '2px 8px',
              borderRadius: 99, background: tc.badge, color: tc.badgeTxt,
              whiteSpace: 'nowrap',
            }}>
              {tc.badgeLabel}
            </span>
          )}
          {week.label && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {week.label}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, padding: '3px 10px',
            borderRadius: 99, background: remStyle.bg, color: remStyle.color,
          }}>
            {fmt(rem)}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>▼</span>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: '14px 16px' }}>

          {/* Income */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#D5F5E3', borderRadius: 8, padding: '8px 12px', marginBottom: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A6B2F' }}>Paycheck Income</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1A6B2F', fontFamily: 'DM Mono, monospace' }}>{fmt(INCOME)}</span>
          </div>

          {/* Expenses */}
          <div style={{ marginBottom: 8 }}>
            {week.expenses.map((exp, i) => {
              const debt = isDebtPayment(exp.name)
              const sav  = isSavings(exp.name)
              const rowBg = sav ? '#F0FFF4' : debt ? '#FFF8F0' : i % 2 === 0 ? '#F9FAFB' : '#fff'
              const nameFg = sav ? '#1A6B2F' : debt ? '#CC5500' : '#111827'
              const isEditing = editingId === exp.id

              return (
                <div key={exp.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 8px', borderRadius: 6, background: rowBg,
                  border: isEditing ? '1px solid #4472C4' : '1px solid transparent',
                  marginBottom: 2, transition: 'border 0.15s',
                }}>
                  {isEditing ? (
                    <>
                      <input
                        value={exp.name}
                        onChange={e => onUpdateExpense(week.id, exp.id, 'name', e.target.value)}
                        style={{ flex: 1, fontSize: 13, border: 'none', background: 'transparent', outline: 'none', color: nameFg, fontFamily: 'DM Sans, sans-serif' }}
                        autoFocus
                      />
                      <input
                        type="number"
                        value={exp.amount}
                        onChange={e => onUpdateExpense(week.id, exp.id, 'amount', e.target.value)}
                        style={{ width: 80, fontSize: 13, border: 'none', background: 'transparent', outline: 'none', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: nameFg }}
                      />
                      <button onClick={() => setEditingId(null)} style={{
                        background: '#1B2A4A', color: '#fff', border: 'none', borderRadius: 4,
                        padding: '2px 8px', fontSize: 11, cursor: 'pointer',
                      }}>done</button>
                    </>
                  ) : (
                    <>
                      <span
                        style={{ flex: 1, fontSize: 13, color: nameFg, fontWeight: sav || debt ? 500 : 400, cursor: 'pointer' }}
                        onClick={() => setEditingId(exp.id)}
                        title="Click to edit"
                      >
                        {exp.name}
                      </span>
                      <span style={{ fontSize: 13, color: '#6B7280', fontFamily: 'DM Mono, monospace', cursor: 'pointer' }}
                        onClick={() => setEditingId(exp.id)}>
                        {fmt(exp.amount)}
                      </span>
                      <button
                        onClick={() => onRemoveExpense(week.id, exp.id)}
                        style={{ background: 'none', border: 'none', color: '#E5E7EB', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.target.style.color = '#C0392B'}
                        onMouseLeave={e => e.target.style.color = '#E5E7EB'}
                        title="Remove"
                      >×</button>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bonus block */}
          {week.bonusIncome && (
            <div style={{ marginBottom: 8 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                background: '#FFF3CD', borderRadius: 8, padding: '8px 12px', marginBottom: 2,
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#92400E' }}>End-of-Month Bonus</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E', fontFamily: 'DM Mono, monospace' }}>+{fmt(week.bonusIncome)}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                background: '#FFFBEB', borderRadius: 6, padding: '6px 12px',
              }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{week.bonusExpense?.name}</span>
                <span style={{ fontSize: 13, color: '#6B7280', fontFamily: 'DM Mono, monospace' }}>{fmt(week.bonusExpense?.amount || 0)}</span>
              </div>
            </div>
          )}

          {/* Add expense form */}
          <form onSubmit={handleAdd} style={{
            display: 'flex', gap: 6, marginBottom: 10, marginTop: 12,
            padding: '10px 12px', background: '#F0F2F7', borderRadius: 8,
          }}>
            <input
              ref={nameRef}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Expense name"
              style={{
                flex: 1, fontSize: 13, padding: '6px 10px',
                border: '1px solid #D1D5DB', borderRadius: 6,
                background: '#fff', color: '#111827', outline: 'none',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
            <input
              type="number"
              value={newAmt}
              onChange={e => setNewAmt(e.target.value)}
              placeholder="$"
              min="0"
              step="1"
              style={{
                width: 76, fontSize: 13, padding: '6px 8px',
                border: '1px solid #D1D5DB', borderRadius: 6,
                background: '#fff', color: '#111827', outline: 'none',
                fontFamily: 'DM Mono, monospace',
              }}
            />
            <button type="submit" style={{
              background: '#1B2A4A', color: '#fff', border: 'none',
              borderRadius: 6, padding: '6px 14px', fontSize: 13,
              cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif',
            }}>+ Add</button>
          </form>

          {/* Remaining total */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px', borderRadius: 8,
            background: remStyle.bg, border: `1px solid ${remStyle.color}22`,
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: remStyle.color }}>
              {rem < 0 ? '⚠ Over budget' : rem < 100 ? '⚠ Running tight' : '✓ Remaining'}
            </span>
            <span style={{ fontSize: 18, fontWeight: 600, color: remStyle.color, fontFamily: 'DM Mono, monospace' }}>
              {fmt(rem)}
            </span>
          </div>

          {week.note && (
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
              {week.note}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
