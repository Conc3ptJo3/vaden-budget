import React, { useState, useRef } from 'react'
import { fmt, getRemaining, remainingColor, isDebtPayment, isSavings } from '../utils'
import { INCOME } from '../data'

const TYPE_CONFIG = {
  bonus:   { accent: '#C47B0A', accentBorder: '#F6D9A0', badgeLabel: 'bonus month', badgeBg: '#FEF7E8', badgeFg: '#9A5F05' },
  surgery: { accent: '#D63B3B', accentBorder: '#F5BCBC', badgeLabel: 'surgery',     badgeBg: '#FEF0F0', badgeFg: '#A82D2D' },
  payoff:  { accent: '#3D6FE8', accentBorder: '#C7D7F9', badgeLabel: 'debt payoff', badgeBg: '#EEF3FD', badgeFg: '#2A52B8' },
  savings: { accent: '#1D8A4E', accentBorder: '#A8DFC0', badgeLabel: 'savings push',badgeBg: '#EBF8F1', badgeFg: '#166038' },
  normal:  { accent: '#CBD3E8', accentBorder: '#CBD3E8', badgeLabel: null,          badgeBg: null,      badgeFg: null },
}

const REM_CONFIG = {
  green:  { bg: '#EBF8F1', fg: '#1D8A4E', border: '#A8DFC0' },
  orange: { bg: '#FEF7E8', fg: '#C47B0A', border: '#F6D9A0' },
  red:    { bg: '#FEF0F0', fg: '#D63B3B', border: '#F5BCBC' },
}

export default function WeekCard({
  week,
  onAddExpense,
  onRemoveExpense,
  onUpdateExpense,
  onToggleChecked,
  isChecked,
  isArchived,
  onToggleArchive,
}) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmt, setNewAmt] = useState('')
  const [editingId, setEditingId] = useState(null)
  const nameRef = useRef()

  const rem = getRemaining(week)
  const remKey = remainingColor(rem)
  const tc = TYPE_CONFIG[week.type] || TYPE_CONFIG.normal
  const rc = REM_CONFIG[remKey]

  const checkedCount = week.expenses.filter(e => isChecked(week.id, e.id)).length
  const totalCount = week.expenses.length
  const allChecked = totalCount > 0 && checkedCount === totalCount

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

  const headerOpacity = isArchived ? 0.6 : 1

  return (
    <div style={{
      background: isArchived ? '#F7F8FC' : 'var(--surface)',
      borderRadius: 'var(--radius)',
      border: `1px solid ${isArchived ? '#E4E8F0' : 'var(--border)'}`,
      boxShadow: isArchived ? 'none' : 'var(--shadow-sm)',
      overflow: 'hidden',
      marginBottom: 0,
      opacity: isArchived ? 0.75 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* Header row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 12px 12px 14px', cursor: 'pointer',
          borderLeft: `3px solid ${isArchived ? '#CBD3E8' : tc.accent}`,
          background: open ? '#F8F9FD' : (isArchived ? '#F7F8FC' : 'var(--surface)'),
          userSelect: 'none',
          minHeight: 48,
        }}
      >
        {/* Archive toggle icon */}
        <button
          onClick={e => { e.stopPropagation(); onToggleArchive(week.id, isArchived) }}
          title={isArchived ? 'Unarchive week' : 'Archive week'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px', borderRadius: 4, flexShrink: 0,
            color: isArchived ? '#9BA3B8' : '#CBD3E8',
            fontSize: 14, lineHeight: 1,
            transition: 'color 0.15s',
            minWidth: 28, minHeight: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {isArchived ? '📂' : '🗂'}
        </button>

        {/* Date + badges - left side, truncates if needed */}
        <div style={{ flex: 1, minWidth: 0, opacity: headerOpacity }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: isArchived ? 'var(--text2)' : 'var(--text)', whiteSpace: 'nowrap' }}>
              {week.date}
            </span>
            {tc.badgeLabel && !isArchived && (
              <span style={{
                fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 99,
                background: tc.badgeBg, color: tc.badgeFg,
                border: `1px solid ${tc.accentBorder}`, whiteSpace: 'nowrap',
              }}>
                {tc.badgeLabel}
              </span>
            )}
            {checkedCount > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 99,
                background: allChecked ? '#EBF8F1' : '#F0F3FA',
                color: allChecked ? '#1D8A4E' : '#5A6278',
                border: `1px solid ${allChecked ? '#A8DFC0' : '#CBD3E8'}`,
                whiteSpace: 'nowrap',
              }}>
                {allChecked ? '✓ all paid' : `${checkedCount}/${totalCount}`}
              </span>
            )}
          </div>
        </div>

        {/* Remaining pill + chevron - always right-aligned, never shrinks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, opacity: headerOpacity }}>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
            background: rc.bg, color: rc.fg, border: `1px solid ${rc.border}`,
            fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap',
          }}>{fmt(rem)}</span>
          <span style={{
            color: 'var(--text3)', fontSize: 9,
            transform: open ? 'rotate(180deg)' : 'none',
            display: 'inline-block', transition: 'transform 0.2s',
          }}>▼</span>
        </div>
      </div>

      {open && (
        <div style={{ padding: '12px 14px 14px', borderTop: '1px solid var(--border)' }}>
          {/* Income row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#EBF8F1', border: '1px solid #A8DFC0',
            borderRadius: 8, padding: '8px 12px', marginBottom: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1D8A4E' }}>Paycheck Income</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1D8A4E', fontFamily: 'DM Mono, monospace' }}>{fmt(INCOME)}</span>
          </div>

          {/* Expense rows */}
          <div style={{ marginBottom: 8 }}>
            {week.expenses.map((exp, i) => {
              const debt = isDebtPayment(exp.name)
              const sav = isSavings(exp.name)
              const isEditing = editingId === exp.id
              const checked = isChecked(week.id, exp.id)
              const rowBg = checked
                ? '#F0FBF5'
                : sav ? '#EBF8F1'
                : debt ? '#EEF3FD'
                : i % 2 === 0 ? '#F8F9FD' : '#fff'
              const nameFg = checked
                ? '#9BA3B8'
                : sav ? '#1D8A4E'
                : debt ? '#3D6FE8'
                : 'var(--text)'

              return (
                <div key={exp.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 6, marginBottom: 2,
                  background: isEditing ? '#EEF3FD' : rowBg,
                  border: isEditing ? '1px solid #C7D7F9' : '1px solid transparent',
                  minHeight: 40,
                }}>
                  {/* Checkmark button - bigger tap target on mobile */}
                  <button
                    onClick={() => onToggleChecked(week.id, exp.id)}
                    style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                      border: checked ? '2px solid #1D8A4E' : '2px solid #CBD3E8',
                      background: checked ? '#1D8A4E' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#fff', transition: 'all 0.15s', padding: 0,
                    }}
                  >
                    {checked ? '✓' : ''}
                  </button>

                  {isEditing ? (
                    <>
                      <input value={exp.name}
                        onChange={e => onUpdateExpense(week.id, exp.id, 'name', e.target.value)}
                        style={{ flex: 1, fontSize: 13, border: 'none', background: 'transparent', outline: 'none', color: 'var(--text)' }}
                        autoFocus />
                      <span style={{ color: 'var(--text3)', fontSize: 13 }}>$</span>
                      <input type="number" value={exp.amount}
                        onChange={e => onUpdateExpense(week.id, exp.id, 'amount', e.target.value)}
                        style={{ width: 60, fontSize: 13, border: 'none', background: 'transparent', outline: 'none', textAlign: 'right', fontFamily: 'DM Mono, monospace', color: 'var(--text)' }} />
                      <button onClick={() => setEditingId(null)}
                        style={{ background: '#3D6FE8', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>
                        done
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        onClick={() => setEditingId(exp.id)}
                        style={{
                          flex: 1, fontSize: 13, color: nameFg,
                          fontWeight: sav || debt ? 500 : 400,
                          cursor: 'text',
                          textDecoration: checked ? 'line-through' : 'none',
                          opacity: checked ? 0.6 : 1,
                        }}
                      >{exp.name}</span>
                      <span
                        onClick={() => setEditingId(exp.id)}
                        style={{
                          fontSize: 13, color: checked ? '#9BA3B8' : 'var(--text2)',
                          fontFamily: 'DM Mono, monospace', cursor: 'text',
                          textDecoration: checked ? 'line-through' : 'none',
                          opacity: checked ? 0.6 : 1,
                          flexShrink: 0,
                        }}
                      >{fmt(exp.amount)}</span>
                      <button
                        onClick={() => onRemoveExpense(week.id, exp.id)}
                        style={{
                          background: 'none', border: 'none', color: '#CBD3E8', cursor: 'pointer',
                          fontSize: 18, lineHeight: 1, padding: '0 4px',
                          minWidth: 28, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        title="Remove"
                      >×</button>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bonus income/expense rows */}
          {week.bonusIncome && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FEF7E8', border: '1px solid #F6D9A0', borderRadius: 8, padding: '8px 12px', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#C47B0A' }}>End-of-Month Bonus</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#C47B0A', fontFamily: 'DM Mono, monospace' }}>+{fmt(week.bonusIncome)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: '#F8F9FD', borderRadius: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>{week.bonusExpense?.name}</span>
                <span style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'DM Mono, monospace' }}>{fmt(week.bonusExpense?.amount || 0)}</span>
              </div>
            </div>
          )}

          {/* Add expense form */}
          <div style={{
            display: 'flex', gap: 6, alignItems: 'center',
            background: '#F8F9FD', borderRadius: 8, border: '1px solid var(--border)',
            padding: '7px 9px', marginBottom: 10,
          }}>
            <input
              ref={nameRef} value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Add an expense..."
              style={{ flex: 1, fontSize: 13, padding: '6px 8px', border: '1px solid var(--border2)', borderRadius: 6, background: '#fff', color: 'var(--text)', outline: 'none' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#fff', border: '1px solid var(--border2)', borderRadius: 6, padding: '6px 8px' }}>
              <span style={{ fontSize: 13, color: 'var(--text3)' }}>$</span>
              <input
                type="number" value={newAmt} onChange={e => setNewAmt(e.target.value)}
                placeholder="0" min="0" step="1"
                inputMode="numeric"
                style={{ width: 50, fontSize: 13, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text)', fontFamily: 'DM Mono, monospace' }}
              />
            </div>
            <button
              onClick={handleAdd}
              style={{ background: '#3D6FE8', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              + Add
            </button>
          </div>

          {/* Remaining bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: rc.bg, border: `1px solid ${rc.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: rc.fg }}>
              {rem < 0 ? 'Over budget' : rem < 100 ? 'Running tight' : 'Remaining'}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: rc.fg, fontFamily: 'DM Mono, monospace' }}>{fmt(rem)}</span>
          </div>

          {week.note && (
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, lineHeight: 1.5, fontStyle: 'italic' }}>
              {week.note}
            </p>
          )}
        </div>
      )}
    </div>
  )
}