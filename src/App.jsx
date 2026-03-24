import React, { useState } from 'react'
import { useBudget } from './hooks/useBudget'
import WeekCard from './components/WeekCard'
import SummaryBar from './components/SummaryBar'
import DebtTracker from './components/DebtTracker'

const TABS = ['Paychecks', 'Debt Plan']

export default function App() {
  const [tab, setTab] = useState(0)
  const { weeks, addExpense, removeExpense, updateExpense, resetToDefaults } = useBudget()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F7' }}>
      {/* Top bar */}
      <div style={{
        background: '#1B2A4A',
        padding: '14px 16px 0',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>
                Budget
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 1 }}>Joe & Lisa · $1,760/wk</p>
            </div>
            <button
              onClick={() => setConfirmReset(true)}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)', borderRadius: 6, padding: '5px 10px',
                fontSize: 11, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Reset
            </button>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2 }}>
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                style={{
                  background: tab === i ? '#fff' : 'transparent',
                  color: tab === i ? '#1B2A4A' : 'rgba(255,255,255,0.6)',
                  border: 'none', cursor: 'pointer',
                  padding: '8px 16px', borderRadius: '8px 8px 0 0',
                  fontSize: 13, fontWeight: tab === i ? 500 : 400,
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 40px' }}>

        {tab === 0 && (
          <>
            <SummaryBar weeks={weeks} />
            {weeks.map(week => (
              <WeekCard
                key={week.id}
                week={week}
                onAddExpense={addExpense}
                onRemoveExpense={removeExpense}
                onUpdateExpense={updateExpense}
              />
            ))}
          </>
        )}

        {tab === 1 && <DebtTracker />}
      </div>

      {/* Reset confirm modal */}
      {confirmReset && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 24, maxWidth: 320, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Reset all data?</h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 1.5 }}>
              This will undo all your changes and restore the original budget. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setConfirmReset(false)}
                style={{
                  flex: 1, padding: '9px', borderRadius: 8, border: '1px solid #E5E7EB',
                  background: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { resetToDefaults(); setConfirmReset(false) }}
                style={{
                  flex: 1, padding: '9px', borderRadius: 8, border: 'none',
                  background: '#C0392B', color: '#fff', fontSize: 13,
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
