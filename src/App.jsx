import React, { useState } from 'react'
import { useBudget } from './hooks/useBudget'
import WeekCard from './components/WeekCard'
import SummaryBar from './components/SummaryBar'
import DebtTracker from './components/DebtTracker'
import BillSchedule from './components/BillSchedule'
import PasswordGate from './components/PasswordGate'

const TABS = ['Paychecks', 'Debt', 'Bills']

function groupByMonth(weeks) {
  const groups = []
  let current = null
  for (const week of weeks) {
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

const MONTH_ACCENT = {
  'March 2025':     '#3D6FE8',
  'April 2025':     '#C47B0A',
  'May 2025':       '#1D8A4E',
  'June 2025':      '#6B4FCF',
  'July 2025':      '#D63B3B',
  'August 2025':    '#3D6FE8',
  'September 2025': '#C47B0A',
  'October 2025':   '#1D8A4E',
  'November 2025':  '#6B4FCF',
  'December 2025':  '#D63B3B',
}

export default function App() {
  const [tab, setTab] = useState(0)
  const {
    weeks, debts,
    addExpense, removeExpense, updateExpense,
    generateNextMonthWeeks, resetToDefaults,
    isArchived, toggleArchive,
    toggleChecked, isChecked,
    updateDebt,
  } = useBudget()

  const [confirmReset, setConfirmReset] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [justGenerated, setJustGenerated] = useState(false)

  const activeWeeks   = weeks.filter(w => !isArchived(w))
  const archivedWeeks = weeks.filter(w => isArchived(w))

  const activeGroups   = groupByMonth(activeWeeks)
  const archivedGroups = groupByMonth(archivedWeeks)

  function handleGenerate() {
    generateNextMonthWeeks()
    setJustGenerated(true)
    setTimeout(() => setJustGenerated(false), 2500)
  }

  function renderMonthGroup(group, archived = false) {
    const accent = MONTH_ACCENT[group.month] || '#CBD3E8'
    return (
      <div key={group.month} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: archived ? '#CBD3E8' : accent, flexShrink: 0,
          }} />
          <h2 style={{ fontSize: 14, fontWeight: 700, color: archived ? 'var(--text3)' : 'var(--text)', letterSpacing: '-0.01em' }}>
            {group.month}
          </h2>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>
            {group.weeks.length} paycheck{group.weeks.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {group.weeks.map(week => (
            <WeekCard
              key={week.id}
              week={week}
              onAddExpense={addExpense}
              onRemoveExpense={removeExpense}
              onUpdateExpense={updateExpense}
              onToggleChecked={toggleChecked}
              isChecked={(wid, eid) => isChecked(wid, eid)}
              isArchived={isArchived(week)}
              onToggleArchive={toggleArchive}
            />
          ))}
        </div>
      </div>
    )
  }

  const lastWeek = weeks[weeks.length - 1]
  const lastWeekMonth = lastWeek
    ? (() => {
        const parts = lastWeek.date.replace(',', '').split(' ')
        return parts[0] + ' ' + parts[2]
      })()
    : ''

  return (
    <PasswordGate>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Top bar */}
        <div style={{
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 100,
          boxShadow: '0 1px 4px rgba(30,40,80,0.07)',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14 }}>
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
                    transition: 'all 0.15s',
                  }}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px 80px' }}>

          {/* ── PAYCHECKS TAB ─────────────────────────────── */}
          {tab === 0 && (
            <>
              <SummaryBar weeks={weeks} />

              {/* Active weeks */}
              {activeGroups.length > 0
                ? activeGroups.map(g => renderMonthGroup(g, false))
                : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: 13 }}>
                    All weeks are archived. Generate next month below, or show archived weeks.
                  </div>
                )
              }

              {/* Generate next month button */}
              <div style={{ marginTop: 4, marginBottom: 20 }}>
                <button
                  onClick={handleGenerate}
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: justGenerated ? '#EBF8F1' : '#3D6FE8',
                    color: justGenerated ? '#1D8A4E' : '#fff',
                    border: justGenerated ? '1px solid #A8DFC0' : 'none',
                    borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.3s',
                  }}
                >
                  {justGenerated ? (
                    <>✓ 4 weeks added!</>
                  ) : (
                    <>
                      <span style={{ fontSize: 16 }}>+</span>
                      Generate next 4 weeks
                      {lastWeekMonth && (
                        <span style={{ opacity: 0.75, fontWeight: 400, fontSize: 12 }}>
                          after {lastWeekMonth}
                        </span>
                      )}
                    </>
                  )}
                </button>
                <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 6 }}>
                  Auto-fills scheduled bills based on due dates. Edit freely after generating.
                </p>
              </div>

              {/* Archived weeks toggle */}
              {archivedWeeks.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowArchived(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'none', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '8px 14px',
                      fontSize: 13, color: 'var(--text3)', cursor: 'pointer',
                      width: '100%', marginBottom: showArchived ? 16 : 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F0F3FA'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ fontSize: 14 }}>🗂</span>
                    <span style={{ fontWeight: 500 }}>
                      {showArchived ? 'Hide' : 'Show'} archived weeks
                    </span>
                    <span style={{
                      marginLeft: 4, fontSize: 11, fontWeight: 500,
                      background: '#E4E8F0', color: '#5A6278',
                      borderRadius: 99, padding: '1px 7px',
                    }}>
                      {archivedWeeks.length}
                    </span>
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, color: 'var(--text3)',
                      transform: showArchived ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}>▼</span>
                  </button>

                  {showArchived && (
                    <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: 16, marginTop: 16, opacity: 0.85 }}>
                      {archivedGroups.map(g => renderMonthGroup(g, true))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── DEBT TAB ───────────────────────────────────── */}
          {tab === 1 && (
            <DebtTracker debts={debts} onUpdateDebt={updateDebt} />
          )}

          {/* ── BILLS TAB ──────────────────────────────────── */}
          {tab === 2 && <BillSchedule />}
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
                This restores the original budget and removes all changes including generated weeks and debt updates. Cannot be undone.
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