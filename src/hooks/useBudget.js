import { useState, useEffect } from 'react'
import { INITIAL_WEEKS } from '../data'

const KEY = 'budget-app-v1'
const CHECKED_KEY = 'budget-checked-v1'
const ARCHIVED_KEY = 'budget-archived-v1'

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// Determine if a week's date is in the past (before today's start)
export function isWeekPast(dateStr) {
  try {
    const weekDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // A week is "past" if it's more than 7 days ago
    const cutoff = new Date(today)
    cutoff.setDate(cutoff.getDate() - 7)
    return weekDate < cutoff
  } catch {
    return false
  }
}

export function useBudget() {
  const [weeks, setWeeks] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? JSON.parse(saved) : deepClone(INITIAL_WEEKS)
    } catch {
      return deepClone(INITIAL_WEEKS)
    }
  })

  // checkedItems: { [weekId]: Set<expId> } — stored as { [weekId]: string[] }
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CHECKED_KEY)
      if (!saved) return {}
      const raw = JSON.parse(saved)
      const result = {}
      for (const [wid, ids] of Object.entries(raw)) {
        result[wid] = new Set(ids)
      }
      return result
    } catch {
      return {}
    }
  })

  // manualArchive: set of weekIds the user has manually archived
  // manualUnarchive: set of weekIds the user has manually un-archived
  const [manualArchive, setManualArchive] = useState(() => {
    try {
      const saved = localStorage.getItem(ARCHIVED_KEY)
      if (!saved) return { archived: new Set(), unarchived: new Set() }
      const raw = JSON.parse(saved)
      return {
        archived: new Set(raw.archived || []),
        unarchived: new Set(raw.unarchived || []),
      }
    } catch {
      return { archived: new Set(), unarchived: new Set() }
    }
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(weeks)) } catch {}
  }, [weeks])

  useEffect(() => {
    try {
      const serializable = {}
      for (const [wid, set] of Object.entries(checkedItems)) {
        serializable[wid] = [...set]
      }
      localStorage.setItem(CHECKED_KEY, JSON.stringify(serializable))
    } catch {}
  }, [checkedItems])

  useEffect(() => {
    try {
      localStorage.setItem(ARCHIVED_KEY, JSON.stringify({
        archived: [...manualArchive.archived],
        unarchived: [...manualArchive.unarchived],
      }))
    } catch {}
  }, [manualArchive])

  // Returns true if a week should be shown as archived
  function isArchived(week) {
    if (manualArchive.unarchived.has(week.id)) return false
    if (manualArchive.archived.has(week.id)) return true
    return isWeekPast(week.date)
  }

  function toggleArchive(weekId, currentlyArchived) {
    setManualArchive(prev => {
      const archived = new Set(prev.archived)
      const unarchived = new Set(prev.unarchived)
      if (currentlyArchived) {
        // un-archive it
        archived.delete(weekId)
        unarchived.add(weekId)
      } else {
        // manually archive it
        unarchived.delete(weekId)
        archived.add(weekId)
      }
      return { archived, unarchived }
    })
  }

  function toggleChecked(weekId, expId) {
    setCheckedItems(prev => {
      const set = new Set(prev[weekId] || [])
      if (set.has(expId)) {
        set.delete(expId)
      } else {
        set.add(expId)
      }
      return { ...prev, [weekId]: set }
    })
  }

  function isChecked(weekId, expId) {
    return checkedItems[weekId]?.has(expId) || false
  }

  function addExpense(weekId, name, amount) {
    setWeeks(prev => prev.map(w => {
      if (w.id !== weekId) return w
      const id = 'e' + Date.now()
      return { ...w, expenses: [...w.expenses, { id, name, amount }] }
    }))
  }

  function removeExpense(weekId, expId) {
    setWeeks(prev => prev.map(w => {
      if (w.id !== weekId) return w
      return { ...w, expenses: w.expenses.filter(e => e.id !== expId) }
    }))
    // Also remove from checked
    setCheckedItems(prev => {
      if (!prev[weekId]) return prev
      const set = new Set(prev[weekId])
      set.delete(expId)
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
        )
      }
    }))
  }

  function updateBonusExpense(weekId, field, value) {
    setWeeks(prev => prev.map(w => {
      if (w.id !== weekId || !w.bonusExpense) return w
      return {
        ...w,
        bonusExpense: {
          ...w.bonusExpense,
          [field]: field === 'amount' ? (parseFloat(value) || 0) : value
        }
      }
    }))
  }

  function resetToDefaults() {
    setWeeks(deepClone(INITIAL_WEEKS))
    setCheckedItems({})
    setManualArchive({ archived: new Set(), unarchived: new Set() })
  }

  return {
    weeks,
    addExpense,
    removeExpense,
    updateExpense,
    updateBonusExpense,
    resetToDefaults,
    isArchived,
    toggleArchive,
    toggleChecked,
    isChecked,
  }
}