import React from 'react'
import { BILL_SCHEDULE } from '../data'
import { fmt } from '../utils'

// Group bills by which week of the month they hit
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

export default function BillSchedule() {
  const monthlyTotal = BILL_SCHEDULE.reduce((s, b) => s + b.amount, 0)

  const grouped = WEEK_KEYS.map((label, i) => ({
    label,
    color: WEEK_COLORS[i],
    bills: BILL_SCHEDULE.filter(b => getDayLabel(b.day) === label).sort((a, b) => a.day - b.day),
  }))

  return (
    <div>
      {/* Header summary */}
      <div style={{
        background: '#1B2A4A', borderRadius: 10, padding: '14px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20,
      }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 2 }}>Monthly scheduled bills</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmt(monthlyTotal)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 2 }}>Recurring items</div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 600 }}>{BILL_SCHEDULE.length}</div>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20, lineHeight: 1.5 }}>
        These bills are used to auto-populate new weeks when you generate the next month.
        Bills are assigned to the paycheck whose date falls within 7 days before the due date.
      </p>

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
                <div key={bill.id} style={{
                  display: 'flex', alignItems: 'center',
                  background: group.color.bg, border: `1px solid ${group.color.border}`,
                  borderRadius: 8, padding: '9px 14px', gap: 10,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: group.color.dot, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                  }}>
                    {bill.day}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: group.color.fg, fontWeight: 500 }}>{bill.name}</span>
                  {bill.note && (
                    <span style={{ fontSize: 11, color: '#9BA3B8', marginRight: 8, fontStyle: 'italic' }}>{bill.note}</span>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 700, color: group.color.fg, fontFamily: 'DM Mono, monospace' }}>
                    {fmt(bill.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}