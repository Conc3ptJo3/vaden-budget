import { useState, useEffect } from 'react'
import { INITIAL_WEEKS, INITIAL_DEBTS, generateNextMonth } from '../data'

const KEY         = 'budget-app-v1'
const CHECKED_KEY = 'budget-checked-v1'
const ARCHIVE_KEY = 'budget-archived-v1'
const DEBTS_KEY   = 'budget-debts-v1'

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function isWeekPast(dateStr) {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    cutoff.setHours(0, 0, 0, 0)
    return d < cutoff
  } catch { return false }
}

export function useBudget() {
  const [weeks, setWeeks] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? JSON.parse(saved) : deepClone(INITIAL_WEEKS)
    } catch { return deepClone(INITIAL_WEEKS) }
  })

  const [debts, setDebts] = useState(() => {
    try {
      const saved = localStorage.getItem(DEBTS_KEY)
      return saved ? JSON.parse(saved) : deepClone(INITIAL_DEBTS)
    } catch { return deepClone(INITIAL_DEBTS) }
  })

  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CHECKED_KEY)
      if (!saved) return {}
      const raw = JSON.parse(saved)
      const result = {}
      for (const [wid, ids] of Object.entries(raw)) result[wid] = new Set(ids)
      return result
    } catch { return {} }
  })

  const [manualOverrides, setManualOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem(ARCHIVE_KEY)
      if (!saved) return { archived: new Set(), unarchived: new Set() }
      const raw = JSON.parse(saved)
      return { archived: new Set(raw.archived || []), unarchived: new Set(raw.unarchived || []) }
    } catch { return { archived: new Set(), unarchived: new Set() } }
  })

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(weeks)) } catch {} }, [weeks])
  useEffect(() => { try { localStorage.setItem(DEBTS_KEY, JSON.stringify(debts)) } catch {} }, [debts])

  useEffect(() => {
    try {
      const ser = {}
      for (const [wid, set] of Object.entries(checkedItems)) ser[wid] = [...set]
      localStorage.setItem(CHECKED_KEY, JSON.stringify(ser))
    } catch {}
  }, [checkedItems])

  useEffect(() => {
    try {
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify({
        archived:   [...manualOverrides.archived],
        unarchived: [...manualOverrides.unarchived],
      }))
    } catch {}
  }, [manualOverrides])

  function isArchived(week) {
    if (manualOverrides.unarchived.has(week.id)) return false
    if (manualOverrides.archived.has(week.id))   return true
    return isWeekPast(week.date)
  }

  function toggleArchive(weekId, currentlyArchived) {
    setManualOverrides(prev => {
      const archived   = new Set(prev.archived)
      const unarchived = new Set(prev.unarchived)
      if (currentlyArchived) { archived.delete(weekId); unarchived.add(weekId) }
      else                   { unarchived.delete(weekId); archived.add(weekId) }
      return { archived, unarchived }
    })
  }

  function toggleChecked(weekId, expId) {
    setCheckedItems(prev => {
      const set = new Set(prev[weekId] || [])
      set.has(expId) ? set.delete(expId) : set.add(expId)
      return { ...prev, [weekId]: set }
    })
  }

  function isChecked(weekId, expId) {
    return checkedItems[weekId]?.has(expId) || false
  }

  function addExpense(weekId, name, amount) {
    setWeeks(prev => prev.map(w =>
      w.id !== weekId ? w : { ...w, expenses: [...w.expenses, { id: 'e' + Date.now(), name, amount }] }
    ))
  }

  function removeExpense(weekId, expId) {
    setWeeks(prev => prev.map(w =>
      w.id !== weekId ? w : { ...w, expenses: w.expenses.filter(e => e.id !== expId) }
    ))
    setCheckedItems(prev => {
      if (!prev[weekId]) return prev
      const set = new Set(prev[weekId]); set.delete(expId)
      return { ...prev, [weekId]: set }
    })
  }

  function updateExpense(weekId, expId, field, value) {
    setWeeks(prev => prev.map(w => {
      if (w.id !== weekId) return w
      return {
        ...w,
        expenses: w.expenses.map(e =>
          e.id === expId ? { ...e, [field]: field === 'amount' ? (parseFloat(value) || 0) : value } : e
        ),
      }
    }))
  }

  function generateNextMonthWeeks() {
    const lastWeek = weeks[weeks.length - 1]
    if (!lastWeek) return
    const newWeeks = generateNextMonth(lastWeek.date, new Set(weeks.map(w => w.id)))
    setWeeks(prev => [...prev, ...newWeeks])
  }

  function updateDebt(debtId, field, value) {
    setDebts(prev => prev.map(d =>
      d.id !== debtId ? d
        : { ...d, [field]: field === 'balance' || field === 'min' ? (parseFloat(value) || 0) : value }
    ))
  }

  function resetToDefaults() {
    setWeeks(deepClone(INITIAL_WEEKS))
    setDebts(deepClone(INITIAL_DEBTS))
    setCheckedItems({})
    setManualOverrides({ archived: new Set(), unarchived: new Set() })
  }

  return {
    weeks, debts,
    addExpense, removeExpense, updateExpense,
    generateNextMonthWeeks, resetToDefaults,
    isArchived, toggleArchive,
    toggleChecked, isChecked,
    updateDebt,
  }
}