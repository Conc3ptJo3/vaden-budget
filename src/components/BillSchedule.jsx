import React, { useState } from 'react'
import { fmt } from '../utils'

function getDayLabel(day) {
  if (day <= 7)  return 'Week 1 (1st–7th)'
  if (day <= 14) return 'Week 2 (8th–14th)'
  if (day <= 21) return 'Week 3 (15th–21st)'
  return 'Week 4 (22nd–31st)'
}

const WEEK_COLORS = [
  { bg: '#EEF3FD', border: '#C7D7F9', fg: '#2A52B8', dot: '#3D6FE8' },
  { bg: '#FEF7E8', border: '#F6D9A0', fg: '#9A5F05', dot: '#C47B0A' },
  { bg: '#EBF8F1', border: '#A8DFC0', fg: '#166038', dot: '#1D8A4E' },
  { bg: '#F0ECFD', border: '#C4B5F0', fg: '#5A35B8', dot: '#6B4FCF' },
]
const WEEK_KEYS = [
  'Week 1 (1st–7th)',
  'Week 2 (8th–14th)',
  'Week 3 (15th–21st)',
  'Week 4 (22nd–31st)',
]

function InlineEdit({ value, onSave, type = 'text', prefix = '', min, max, style = {} }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')

  function start(e) {
    e.stopPropagation()
    setVal(String(value))
    setEditing(true)
  }

  function commit() {
    const parsed = type === 'number' ? (parseInt(val) || 0) : val.trim()
    if (parsed !== value) onSave(parsed)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        type={type === 'number' ? 'number' : 'text'}
        inputMode={type === 'number' ? 'numeric' : 'text'}
        value={val}
        min={min}
        max={max}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        style={{
          fontSize: 13, fontFamily: type === 'number' ? 'DM Mono, monospace' : 'inherit',
          border: '1.5px solid #3D6FE8', borderRadius: 5, padding: '2px 6px',
          outline: 'none', background: '#EEF3FD', width: type === 'number' ? 70 : 120,
          ...style,
        }}
      />
    )
  }

  return (
    <span
      onClick={start}
      title="Tap to edit"
      style={{
        cursor: 'pointer',
        borderBottom: '1px dashed rgba(0,0,0,0.15)',
        paddingBottom: 1,
        ...style,
      }}
    >
      {prefix}{value}
    </span>
  )
}

export default function BillSchedule({ billSchedule, onUpdateBill, onAddBill, onRemoveBill }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newDay, setNewDay] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const monthlyTotal = billSchedule.reduce((s, b) => s + b.amount, 0)

  const grouped = WEEK_KEYS.map((label, i) => ({
    label,
    color: WEEK_COLORS[i],
    bills: billSchedule.filter(b => getDayLabel(b.day) === label).sort((a, b) => a.day - b.day),
  }))

  function handleAdd(e) {
    e.preventDefault()
    const name = newName.trim()
    const amount = parseInt(newAmount)
    const day = parseInt(newDay)
    if (!name || isNaN(amount) || amount <= 0 || isNaN(day) || day < 1 || day > 31) return
    onAddBill(name, amount, day)
    setNewName('')
    setNewAmount('')
    setNewDay('')
    setAdding(false)
  }

  return (
    <div>
      {/* Header summary */}
      <div style={{
        background: '#1B2A4A', borderRadius: 10, padding: '14px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
      }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 2 }}>Monthly scheduled bills</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmt(monthlyTotal)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 2 }}>Recurring items</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 600 }}>{billSchedule.length}</div>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.5 }}>
        Tap any bill's name, amount, or day to edit it. Changes instantly update all future generated paychecks.
      </p>

      {/* Add bill button */}
      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          style={{
            width: '100%', padding: '10px', marginBottom: 20,
            background: '#EEF3FD', border: '1.5px dashed #C7D7F9',
            borderRadius: 8, fontSize: 13, fontWeight: 500,
            color: '#3D6FE8', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <span style={{ fontSize: 16 }}>+</span> Add a bill
        </button>
      ) : (
        <div style={{
          background: '#EEF3FD', border: '1.5px solid #C7D7F9',
          borderRadius: 10, padding: '14px', marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#2A52B8', marginBottom: 10 }}>New Bill</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              autoFocus
              placeholder="Bill name (e.g. Gym)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{
                fontSize: 13, padding: '8px 10px', border: '1px solid #C7D7F9',
                borderRadius: 6, outline: 'none', background: '#fff',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #C7D7F9', borderRadius: 6, padding: '8px 10px' }}>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Amount"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  style={{ flex: 1, fontSize: 13, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'DM Mono, monospace' }}
                />
              </div>
              <div style={{ width: 90, display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: '1px solid #C7D7F9', borderRadius: 6, padding: '8px 10px' }}>
                <span style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>Day</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="1–31"
                  min="1"
                  max="31"
                  value={newDay}
                  onChange={e => setNewDay(e.target.value)}
                  style={{ flex: 1, fontSize: 13, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'DM Mono, monospace' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setAdding(false); setNewName(''); setNewAmount(''); setNewDay('') }}
                style={{ flex: 1, padding: '8px', borderRadius: 7, border: '1px solid #C7D7F9', background: '#fff', fontSize: 13, cursor: 'pointer', color: 'var(--text2)' }}
              >Cancel</button>
              <button
                onClick={handleAdd}
                style={{ flex: 2, padding: '8px', borderRadius: 7, border: 'none', background: '#3D6FE8', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >Add Bill</button>
            </div>
          </div>
        </div>
      )}

      {grouped.map(group => (
        <div key={group.label} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: group.color.dot }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{group.label}</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              {fmt(group.bills.reduce((s, b) => s + b.amount, 0))}
            </span>
          </div>

          {group.bills.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 12px', fontStyle: 'italic' }}>No bills this week</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {group.bills.map(bill => (
                <div key={bill.id}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    background: group.color.bg, border: `1px solid ${group.color.border}`,
                    borderRadius: 8, padding: '10px 12px', gap: 10,
                    minHeight: 48,
                  }}>
                    {/* Day badge - tap to edit */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: group.color.dot, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      <InlineEdit
                        value={bill.day}
                        type="number"
                        min={1}
                        max={31}
                        onSave={v => onUpdateBill(bill.id, 'day', v)}
                        style={{ color: '#fff', background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', width: 36, textAlign: 'center', fontSize: 11 }}
                      />
                    </div>

                    {/* Name */}
                    <span style={{ flex: 1, fontSize: 13, color: group.color.fg, fontWeight: 500 }}>
                      <InlineEdit
                        value={bill.name}
                        onSave={v => onUpdateBill(bill.id, 'name', v)}
                        style={{ color: group.color.fg }}
                      />
                    </span>

                    {/* Amount */}
                    <span style={{ fontSize: 14, fontWeight: 700, color: group.color.fg, fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>
                      $<InlineEdit
                        value={bill.amount}
                        type="number"
                        onSave={v => onUpdateBill(bill.id, 'amount', v)}
                        style={{ color: group.color.fg, fontFamily: 'DM Mono, monospace' }}
                      />
                    </span>

                    {/* Delete */}
                    <button
                      onClick={() => setConfirmDelete(bill.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(0,0,0,0.2)', fontSize: 18, lineHeight: 1,
                        padding: '0 4px', minWidth: 28, minHeight: 28,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#D63B3B'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.2)'}
                    >×</button>
                  </div>

                  {/* Confirm delete inline */}
                  {confirmDelete === bill.id && (
                    <div style={{
                      background: '#FEF0F0', border: '1px solid #F5BCBC',
                      borderRadius: 8, padding: '10px 12px', marginTop: 4,
                      display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                    }}>
                      <span style={{ fontSize: 12, color: '#D63B3B', flex: 1 }}>
                        Remove "{bill.name}" from bill schedule and all future paychecks?
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #F5BCBC', background: '#fff', fontSize: 12, cursor: 'pointer' }}
                        >Cancel</button>
                        <button
                          onClick={() => { onRemoveBill(bill.id); setConfirmDelete(null) }}
                          style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#D63B3B', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                        >Remove</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}