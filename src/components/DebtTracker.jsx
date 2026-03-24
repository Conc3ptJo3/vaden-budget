import React from 'react'
import { DEBTS } from '../data'
import { fmt } from '../utils'

const PRIORITY_LABELS = ['Kay (min only)', 'Priority 1 — Kill First', 'Priority 2', 'Priority 3 — Last']
const PRIORITY_COLORS = [
  { bg: '#FADBD8', fg: '#C0392B', border: '#F5B7B1' },
  { bg: '#FDEBD0', fg: '#CC5500', border: '#FAD7A0' },
  { bg: '#FFF8DC', fg: '#B8860B', border: '#F9E79F' },
  { bg: '#D5F5E3', fg: '#1A6B2F', border: '#A9DFBF' },
]

const TIPS = [
  { title: 'Call Discover — ask for APR cut', body: 'Call the number on your card and ask to lower your rate. They do this quietly and often say yes. 22.5% → 18% saves ~$170/yr.' },
  { title: '0% Balance Transfer', body: 'Move the Discover balance to a 0% intro APR card (18–21 months). 3% fee = ~$115 one-time vs. hundreds in interest. Worth 20 min of research.' },
  { title: 'Automate all minimums', body: 'Set every bill to autopay the minimum so you never miss. One missed payment triggers penalty rates and hurts your credit score. Throw extra cash manually at your #1 target.' },
  { title: 'Build a $500 floor', body: 'Your paychecks often end with $55–$160 remaining. One repair bill and you\'re reaching for a card. Park $500 untouched in a separate account as your true emergency buffer.' },
  { title: 'High-Yield Savings (HYSA)', body: 'Ally, Marcus, or SoFi pay 4–5% APY on savings. Move your emergency fund there — earns real money sitting still. Takes 5 min to open.' },
  { title: 'Snowball momentum', body: 'Once CareCredit is gone, roll that $90/mo autopay + all your extra payments into Discover. Each payoff funds the next one faster — this is how it accelerates.' },
]

export default function DebtTracker() {
  const total = DEBTS.reduce((s, d) => s + d.balance, 0)

  return (
    <div>
      {/* Total banner */}
      <div style={{
        background: '#1B2A4A', borderRadius: 10, padding: '14px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Total debt</span>
        <span style={{ color: '#fff', fontSize: 22, fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{fmt(total)}</span>
      </div>

      {/* Attack order */}
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Attack order
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {[...DEBTS].sort((a, b) => a.priority - b.priority).map((d, i) => {
          const pc = PRIORITY_COLORS[Math.min(d.priority, 3)]
          return (
            <div key={d.name} style={{
              background: pc.bg, border: `1px solid ${pc.border}`,
              borderRadius: 10, padding: '12px 14px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: pc.fg, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, flexShrink: 0, marginTop: 1,
              }}>
                {d.priority === 0 ? '—' : d.priority}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: pc.fg }}>{d.name}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: pc.fg, fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>{fmt(d.balance)}</span>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#6B7280' }}>APR: <strong>{d.apr}</strong></span>
                  <span style={{ fontSize: 11, color: '#6B7280' }}>Min: <strong>{d.min ? fmt(d.min) : '—'}</strong></span>
                </div>
                <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 1.4 }}>{d.note}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 500, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Smart money moves
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {TIPS.map(tip => (
          <div key={tip.title} style={{
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
            padding: '10px 14px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1B2A4A', marginBottom: 3 }}>{tip.title}</div>
            <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{tip.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
