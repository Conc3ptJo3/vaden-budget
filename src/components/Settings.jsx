import React, { useState, useRef } from 'react'
import { fmt } from '../utils'

function IncomeField({ label, hint, value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function commit() {
    const n = parseFloat(draft)
    if (!isNaN(n) && n >= 0) onSave(n)
    setEditing(false)
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      padding: '14px 16px', background: '#fff', border: '1px solid var(--border)',
      borderRadius: 10, marginBottom: 10,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, lineHeight: 1.5 }}>{hint}</div>
      </div>
      {editing ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 14, color: 'var(--text3)' }}>$</span>
          <input
            autoFocus type="number" inputMode="decimal" value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
            style={{
              width: 90, fontSize: 15, fontWeight: 700, fontFamily: 'DM Mono, monospace',
              textAlign: 'right', border: '1.5px solid #3D6FE8', borderRadius: 6,
              padding: '4px 8px', outline: 'none', background: '#EEF3FD', color: 'var(--text)',
            }}
          />
        </span>
      ) : (
        <button
          onClick={() => { setDraft(String(value)); setEditing(true) }}
          style={{
            background: '#F8F9FD', border: '1px solid var(--border2)', borderRadius: 8,
            padding: '6px 12px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'DM Mono, monospace', color: 'var(--text)', flexShrink: 0,
          }}
          title="Tap to edit"
        >{fmt(value)}</button>
      )}
    </div>
  )
}

export default function Settings({ settings, onUpdateSettings, exportData, importData }) {
  const fileRef = useRef()
  const [importMsg, setImportMsg] = useState(null) // { ok, text }

  function handleExport() {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `budget-backup-${stamp}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importData(reader.result)
        setImportMsg({ ok: true, text: 'Backup restored! Everything synced.' })
      } catch (err) {
        setImportMsg({ ok: false, text: 'Could not read that file: ' + err.message })
      }
      setTimeout(() => setImportMsg(null), 5000)
    }
    reader.readAsText(file)
    e.target.value = '' // allow re-selecting the same file
  }

  return (
    <div>
      {/* Income */}
      <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Income</h2>
      <IncomeField
        label="Weekly paycheck"
        hint="Default income for every week. Any week can override this — tap the green income amount inside a paycheck card."
        value={settings.weeklyIncome}
        onSave={v => onUpdateSettings('weeklyIncome', v)}
      />
      <IncomeField
        label="End-of-month bonus"
        hint="Used for newly generated bonus weeks. Existing bonus weeks can be edited individually on their cards."
        value={settings.bonusIncome}
        onSave={v => onUpdateSettings('bonusIncome', v)}
      />

      {/* Backup */}
      <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '24px 0 10px' }}>Backup & restore</h2>
      <div style={{
        padding: '14px 16px', background: '#fff', border: '1px solid var(--border)',
        borderRadius: 10, marginBottom: 10,
      }}>
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>
          Your budget saves automatically to the cloud and keeps a copy on this device.
          For extra peace of mind, download a backup file now and then — you can restore
          from it any time.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleExport}
            style={{
              flex: 1, padding: '11px', borderRadius: 8, border: 'none',
              background: '#3D6FE8', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >⬇ Download backup</button>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              flex: 1, padding: '11px', borderRadius: 8, border: '1px solid var(--border2)',
              background: '#fff', color: 'var(--text)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >⬆ Restore backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleImportFile} style={{ display: 'none' }} />
        </div>
        {importMsg && (
          <p style={{
            fontSize: 12, marginTop: 10, padding: '8px 12px', borderRadius: 6,
            background: importMsg.ok ? '#EBF8F1' : '#FEF0F0',
            color: importMsg.ok ? '#1D8A4E' : '#D63B3B',
            border: `1px solid ${importMsg.ok ? '#A8DFC0' : '#F5BCBC'}`,
          }}>{importMsg.text}</p>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.6, marginTop: 16 }}>
        How saving works: every change is written to this device instantly and synced to the
        cloud a moment later. The “Saved” indicator in the top bar tells you the sync status.
        If you’re offline, changes are kept safely on this device and sync when you’re back.
      </p>
    </div>
  )
}
