import React from 'react'
import { fmt, getRemaining } from '../utils'
import { INCOME } from '../data'

export default function SummaryBar({ weeks }) {
  const totalIn    = weeks.reduce((s, w) => s + INCOME + (w.bonusIncome || 0), 0)
  const totalSpent = weeks.reduce((s, w) => {
    const exp = w.expenses.reduce((ss, e) => ss + (e.amount || 0), 0)
    const bon = w.bonusExpense?.amount || 0
    return s + exp + bon
  }, 0)
  const rems       = weeks.map(getRemaining)
  const tightest   = Math.min(...rems)
  const tightColor = tightest < 0 ? '#C0392B' : tightest < 100 ? '#92400E' : '#1A6B2F'

  const cards = [
    { label: 'Weeks tracked', value: weeks.length, mono: false },
    { label: 'Total income', value: fmt(totalIn), mono: true },
    { label: 'Total expenses', value: fmt(totalSpent), mono: true },
    { label: 'Tightest week', value: fmt(tightest), mono: true, color: tightColor },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: 10,
      marginBottom: 20,
    }}>
      {cards.map(card => (
        <div key={card.label} style={{
          background: '#fff',
          borderRadius: 10,
          padding: '12px 14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          border: '1px solid #E5E7EB',
        }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {card.label}
          </div>
          <div style={{
            fontSize: 18, fontWeight: 600,
            color: card.color || '#111827',
            fontFamily: card.mono ? 'DM Mono, monospace' : 'DM Sans, sans-serif',
          }}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  )
}
