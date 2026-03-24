import { useState, useEffect } from 'react'
import { INITIAL_WEEKS } from '../data'

const KEY = 'budget-app-v1'

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
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

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(weeks))
    } catch {}
  }, [weeks])

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
  }

  return { weeks, addExpense, removeExpense, updateExpense, updateBonusExpense, resetToDefaults }
}
