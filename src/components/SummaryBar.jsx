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
  const rems     = weeks.map(getRemaining)
  const tightest = Math.min(...rems)
  const tightColor = tightest < 0 ? '#D63B3B' : tightest < 100 ? '#C47B0A' : '#1D8A4E'

  const cards = [
    { label: 'Weeks tracked',  value: String(weeks.length), mono: false },
    { label: 'Total income',   value: fmt(totalIn),          mono: true  },
    { label: 'Total expenses', value: fmt(totalSpent),       mono: true  },
    { label: 'Tightest week',  value: fmt(tightest),         mono: true, color: tightColor },
  ]

  return (
    <>
      <style>{`
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 24px;
        }
        @media (max-width: 600px) {
          .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            margin-bottom: 16px;
          }
          .summary-card {
            padding: 12px 12px !important;
          }
          .summary-value {
            font-size: 17px !important;
          }
        }
      `}</style>
      <div className="summary-grid">
        {cards.map(card => (
          <div key={card.label} className="summary-card" style={{
            background: '#fff', borderRadius: 10, padding: '14px 16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
              {card.label}
            </div>
            <div className="summary-value" style={{ fontSize: 20, fontWeight: 700, color: card.color || 'var(--text)', fontFamily: card.mono ? 'DM Mono, monospace' : 'inherit' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}