import { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { INITIAL_WEEKS, INITIAL_DEBTS, DEFAULT_BILL_SCHEDULE, generateNextMonth, getBillsForWeek, SPECIAL_WEEK_IDS } from '../data'

const DOCS = {
  weeks:    doc(db, 'budget', 'weeks'),
  debts:    doc(db, 'budget', 'debts'),
  bills:    doc(db, 'budget', 'bills'),
  checked:  doc(db, 'budget', 'checked'),
  archived: doc(db, 'budget', 'archived'),
}

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

function syncWeekToBills(week, billSchedule) {
  if (SPECIAL_WEEK_IDS.has(week.id)) return week

  const billsForWeek = getBillsForWeek(week.date, billSchedule)
  const billsByName = {}
  billSchedule.forEach(b => { billsByName[b.name] = b })
  const weekBillNames = new Set(billsForWeek.map(b => b.name))

  const staples = new Set(['Weed', 'Food'])
  const existingNonStaples = week.expenses.filter(e => !staples.has(e.name))
  const existingStaples = week.expenses.filter(e => staples.has(e.name))

  const updatedNonStaples = existingNonStaples
    .map(e => {
      const matchingBill = billsByName[e.name]
      if (!matchingBill) return e
      if (!weekBillNames.has(e.name)) return null
      return { ...e, amount: matchingBill.amount }
    })
    .filter(Boolean)

  const existingNames = new Set([
    ...existingStaples.map(e => e.name),
    ...updatedNonStaples.map(e => e.name),
  ])

  const newBillExpenses = billsForWeek
    .filter(b => !existingNames.has(b.name))
    .map((b, bi) => ({
      id: `eg-sync-${week.id}-${bi}-${Date.now()}`,
      name: b.name,
      amount: b.amount,
      billId: b.id,
    }))

  return {
    ...week,
    expenses: [...existingStaples, ...updatedNonStaples, ...newBillExpenses],
  }
}

async function save(docRef, data) {
  try {
    await setDoc(docRef, { data: JSON.stringify(data) })
  } catch (e) {
    console.error('Firebase save error:', e)
  }
}

export function useBudget() {
  const [weeks, setWeeks] = useState(deepClone(INITIAL_WEEKS))
  const [debts, setDebts] = useState(deepClone(INITIAL_DEBTS))
  const [billSchedule, setBillSchedule] = useState(deepClone(DEFAULT_BILL_SCHEDULE))
  const [checked, setChecked] = useState({})
  const [archived, setArchived] = useState({ archived: new Set(), unarchived: new Set() })
  const [loading, setLoading] = useState(true)

  // When true, the next state change came from Firestore — don't write it back
  const skipSave = useRef({ weeks: false, debts: false, bills: false, checked: false, archived: false })

  useEffect(() => {
    let resolved = 0
    const total = 5
    function done() { if (++resolved >= total) setLoading(false) }

    const unsubs = [
      onSnapshot(DOCS.weeks, snap => {
        if (snap.exists()) {
          skipSave.current.weeks = true
          setWeeks(JSON.parse(snap.data().data))
        }
        done()
      }, done),

      onSnapshot(DOCS.debts, snap => {
        if (snap.exists()) {
          skipSave.current.debts = true
          setDebts(JSON.parse(snap.data().data))
        }
        done()
      }, done),

      onSnapshot(DOCS.bills, snap => {
        if (snap.exists()) {
          skipSave.current.bills = true
          setBillSchedule(JSON.parse(snap.data().data))
        }
        done()
      }, done),

      onSnapshot(DOCS.checked, snap => {
        if (snap.exists()) {
          skipSave.current.checked = true
          setChecked(JSON.parse(snap.data().data))
        }
        done()
      }, done),

      onSnapshot(DOCS.archived, snap => {
        if (snap.exists()) {
          const raw = JSON.parse(snap.data().data)
          skipSave.current.archived = true
          setArchived({
            archived: new Set(raw.archived || []),
            unarchived: new Set(raw.unarchived || []),
          })
        }
        done()
      }, done),
    ]

    return () => unsubs.forEach(u => u())
  }, [])

  useEffect(() => {
    if (loading) return
    if (skipSave.current.weeks) { skipSave.current.weeks = false; return }
    save(DOCS.weeks, weeks)
  }, [weeks, loading])

  useEffect(() => {
    if (loading) return
    if (skipSave.current.debts) { skipSave.current.debts = false; return }
    save(DOCS.debts, debts)
  }, [debts, loading])

  useEffect(() => {
    if (loading) return
    if (skipSave.current.bills) { skipSave.current.bills = false; return }
    save(DOCS.bills, billSchedule)
  }, [billSchedule, loading])

  useEffect(() => {
    if (loading) return
    if (skipSave.current.checked) { skipSave.current.checked = false; return }
    // checked values are already plain arrays - save directly
    save(DOCS.checked, checked)
  }, [checked, loading])

  useEffect(() => {
    if (loading) return
    if (skipSave.current.archived) { skipSave.current.archived = false; return }
    save(DOCS.archived, {
      archived: [...archived.archived],
      unarchived: [...archived.unarchived],
    })
  }, [archived, loading])

  function isArchived(week) {
    if (archived.unarchived.has(week.id)) return false
    if (archived.archived.has(week.id))   return true
    return isWeekPast(week.date)
  }

  function toggleArchive(weekId, currentlyArchived) {
    setArchived(prev => {
      const a = new Set(prev.archived)
      const u = new Set(prev.unarchived)
      if (currentlyArchived) { a.delete(weekId); u.add(weekId) }
      else                   { u.delete(weekId); a.add(weekId) }
      return { archived: a, unarchived: u }
    })
  }

  function toggleChecked(weekId, expId) {
    setChecked(prev => {
      const ids = new Set(prev[weekId] || [])
      ids.has(expId) ? ids.delete(expId) : ids.add(expId)
      // Spread into plain arrays so the object is always a new reference
      const next = {}
      const merged = { ...prev, [weekId]: ids }
      for (const [k, v] of Object.entries(merged)) next[k] = [...v]
      return next
    })
  }

  function isChecked(weekId, expId) {
    const entry = checked[weekId]
    if (!entry) return false
    // Support both Set and Array (Firestore returns arrays)
    if (entry instanceof Set) return entry.has(expId)
    return entry.includes(expId)
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
    setChecked(prev => {
      if (!prev[weekId]) return prev
      const ids = Array.isArray(prev[weekId]) ? prev[weekId] : [...prev[weekId]]
      return { ...prev, [weekId]: ids.filter(id => id !== expId) }
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
    const newWeeks = generateNextMonth(lastWeek.date, billSchedule)
    setWeeks(prev => [...prev, ...newWeeks])
  }

  function updateDebt(debtId, field, value) {
    setDebts(prev => prev.map(d =>
      d.id !== debtId ? d
        : { ...d, [field]: field === 'balance' || field === 'min' ? (parseFloat(value) || 0) : value }
    ))
  }

  function updateBill(billId, field, value) {
    setBillSchedule(prev => {
      const updated = prev.map(b =>
        b.id !== billId ? b
          : { ...b, [field]: field === 'amount' || field === 'day' ? (parseInt(value) || 0) : value }
      )
      setWeeks(wPrev => wPrev.map(w =>
        SPECIAL_WEEK_IDS.has(w.id) ? w : syncWeekToBills(w, updated)
      ))
      return updated
    })
  }

  function addBill(name, amount, day) {
    const newBill = {
      id: 'b-custom-' + Date.now(),
      name,
      amount: parseInt(amount) || 0,
      day: parseInt(day) || 1,
      note: '',
    }
    setBillSchedule(prev => {
      const updated = [...prev, newBill]
      setWeeks(wPrev => wPrev.map(w =>
        SPECIAL_WEEK_IDS.has(w.id) ? w : syncWeekToBills(w, updated)
      ))
      return updated
    })
  }

  function removeBill(billId) {
    setBillSchedule(prev => {
      const removed = prev.find(b => b.id === billId)
      const updated = prev.filter(b => b.id !== billId)
      if (removed) {
        setWeeks(wPrev => wPrev.map(w => {
          if (SPECIAL_WEEK_IDS.has(w.id)) return w
          return { ...w, expenses: w.expenses.filter(e => e.name !== removed.name) }
        }))
      }
      return updated
    })
  }

  function resetToDefaults() {
    setWeeks(deepClone(INITIAL_WEEKS))
    setDebts(deepClone(INITIAL_DEBTS))
    setBillSchedule(deepClone(DEFAULT_BILL_SCHEDULE))
    setChecked({})
    setArchived({ archived: new Set(), unarchived: new Set() })
  }

  return {
    weeks, debts, billSchedule,
    loading,
    addExpense, removeExpense, updateExpense,
    generateNextMonthWeeks, resetToDefaults,
    isArchived, toggleArchive,
    toggleChecked, isChecked,
    updateDebt,
    updateBill, addBill, removeBill,
  }
}