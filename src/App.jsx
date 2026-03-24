import React, { useState } from 'react'
import { useBudget } from './hooks/useBudget'
import WeekCard from './components/WeekCard'
import SummaryBar from './components/SummaryBar'
import DebtTracker from './components/DebtTracker'
import PasswordGate from './components/PasswordGate'

const TABS = ['Paychecks', 'Debt Plan']

function groupByMonth(weeks) {
  const groups = []
  let current = null
  for (const week of weeks) {
    const month = week.date.split(' ').slice(0, -2).join(' ').trim()
    // e.g. "March 27, 2025" -> month label = "March 2025"
    const parts = week.date.replace(',', '').split(' ')
    const monthLabel = parts[0] + ' ' + parts[2]
    if (!current || current.month !== monthLabel) {
      current = { month: monthLabel, weeks: [] }
      groups.push(current)
    }
    current.weeks.push(week)
  }
  return groups
}

const MONTH_COLORS = {
  'March 2025':  '#EEF3FD',
  'April 2025':  '#FEF7E8',
  'May 2025':    '#EBF8F1',
  'June 2025':   '#F0ECFD',
  'July 2025':   '#FEF0F0',
}

const MONTH_ACCENT = {
  'March 2025':  '#3D6FE8',
  'April 2025':  '#C47B0A',
  'May 2025':    '#1D8A4E',
  'June 2025':   '#6B4FCF',
  'July 2025':   '#D63B3B',
}

export default function App() {
  const [tab, setTab] = useState(0)
  const { weeks, addExpense, removeExpense, updateExpense, resetToDefaults } = useBudget()
  const [confirmReset, setConfirmReset] = useState(false)

  const monthGroups = groupByMonth(weeks)

  return (
    <PasswordGate>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Top bar — light */}
        <div style={{
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 1px 4px rgba(30,40,80,0.07)',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, paddingBottom: 0 }}>
              <div>
                <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>Budget</h1>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>Joe & Lisa · $1,760/wk</p>
              </div>
              <button
                onClick={() => setConfirmReset(true)}
                style={{
                  background: 'transparent', border: '1px solid var(--border2)',
                  color: 'var(--text2)', borderRadius: 7, padding: '5px 12px',
                  fontSize: 12, cursor: 'pointer',
                }}
              >Reset</button>
            </div>
            <div style={{ display: 'flex', gap: 2, marginTop: 12 }}>
              {TABS.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTab(i)}
                  style={{
                    padding: '8px 16px', fontSize: 13, fontWeight: tab === i ? 600 : 400,
                    color: tab === i ? 'var(--blue)' : 'var(--text3)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: tab === i ? '2px solid var(--blue)' : '2px solid transparent',
                    transition: 'all 0.15s', borderRadius: 0,
                  }}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px 60px' }}>
          {tab === 0 && (
            <>
              <SummaryBar weeks={weeks} />
              {monthGroups.map(group => (
                <div key={group.month} style={{ marginBottom: 32 }}>
                  {/* Month header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: MONTH_ACCENT[group.month] || '#CBD3E8', flexShrink: 0,
                    }} />
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                      {group.month}
                    </h2>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {group.weeks.length} paycheck{group.weeks.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Two-column grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 10,
                  }}>
                    {group.weeks.map(week => (
                      <WeekCard
                        key={week.id}
                        week={week}
                        onAddExpense={addExpense}
                        onRemoveExpense={removeExpense}
                        onUpdateExpense={updateExpense}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
          {tab === 1 && <DebtTracker />}
        </div>

        {/* Reset modal */}
        {confirmReset && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(26,31,54,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: 16,
          }}>
            <div style={{
              background: '#fff', borderRadius: 14, padding: '28px 28px 24px',
              maxWidth: 320, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              border: '1px solid var(--border)',
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Reset all data?</h2>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 22, lineHeight: 1.6 }}>
                This restores the original budget and removes all your changes. Cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setConfirmReset(false)} style={{
                  flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border2)',
                  background: '#fff', fontSize: 13, cursor: 'pointer', color: 'var(--text)',
                }}>Cancel</button>
                <button onClick={() => { resetToDefaults(); setConfirmReset(false) }} style={{
                  flex: 1, padding: '9px', borderRadius: 8, border: 'none',
                  background: '#D63B3B', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500,
                }}>Reset</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PasswordGate>
  )
}
