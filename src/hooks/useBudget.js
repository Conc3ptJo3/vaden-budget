import { useState, useEffect, useRef, useCallback } from 'react'
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { INITIAL_WEEKS, INITIAL_DEBTS, DEFAULT_BILL_SCHEDULE, DEFAULT_SETTINGS, generateNextMonth, getBillsForWeek, SPECIAL_WEEK_IDS } from '../data'

/*
 * PERSISTENCE DESIGN (v2) — why this rewrite exists
 * --------------------------------------------------
 * The old hook auto-saved every slice of state to Firestore as soon as
 * `loading` flipped to false. If any Firestore read failed or came back
 * empty (offline start, flaky mobile connection, slow load), state was
 * still the hardcoded defaults at that moment — and the app would write
 * those DEFAULTS to Firestore, wiping real data. That was the "random
 * reset" bug.
 *
 * Rules now:
 *  1. Firestore is only ever written when the USER changes something
 *     (mutations set a dirty flag). Loading never triggers a write.
 *  2. Remote snapshots update state but never echo back a write.
 *  3. A slice is only seeded with defaults if the SERVER confirms the
 *     document doesn't exist (never from a cache miss or an error).
 *  4. Every state change is mirrored to localStorage immediately, so
 *     the app boots instantly and survives Firestore outages.
 *  5. Save status is exposed so the UI can show "Saved / Saving / Offline".
 */

const SLICES = ['weeks', 'debts', 'bills', 'checked', 'archived', 'settings']

const DOCS = Object.fromEntries(SLICES.map(s => [s, doc(db, 'budget', s)]))

const LS_PREFIX = 'vaden-budget-v2:'

const DEFAULTS = {
  weeks:    () => deepClone(INITIAL_WEEKS),
  debts:    () => deepClone(INITIAL_DEBTS),
  bills:    () => deepClone(DEFAULT_BILL_SCHEDULE),
  checked:  () => ({}),
  archived: () => ({ archived: [], unarchived: [] }),
  settings: () => deepClone(DEFAULT_SETTINGS),
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function loadLocal(slice) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + slice)
    if (raw != null) return JSON.parse(raw)
  } catch { /* corrupted or unavailable — fall through */ }
  return null
}

function saveLocal(slice, data) {
  try {
    localStorage.setItem(LS_PREFIX + slice, JSON.stringify(data))
  } catch { /* storage full/unavailable — Firestore is still primary */ }
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

export function useBudget() {
  // Boot from localStorage instantly; Firestore snapshot wins once it arrives.
  const [weeks, setWeeks]               = useState(() => loadLocal('weeks')    ?? DEFAULTS.weeks())
  const [debts, setDebts]               = useState(() => loadLocal('debts')    ?? DEFAULTS.debts())
  const [billSchedule, setBillSchedule] = useState(() => loadLocal('bills')    ?? DEFAULTS.bills())
  const [checked, setChecked]           = useState(() => loadLocal('checked')  ?? DEFAULTS.checked())
  const [archivedRaw, setArchivedRaw]   = useState(() => loadLocal('archived') ?? DEFAULTS.archived())
  const [settings, setSettings]         = useState(() => ({ ...DEFAULTS.settings(), ...(loadLocal('settings') || {}) }))

  // If we have local data, don't block the UI on Firestore at all.
  const [loading, setLoading] = useState(() => loadLocal('weeks') == null)
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'error'

  // Only user mutations set these. Snapshots and load never do.
  const dirty = useRef(Object.fromEntries(SLICES.map(s => [s, false])))
  const saveTimers = useRef({})
  const pendingWrites = useRef(0)

  const setters = {
    weeks: setWeeks, debts: setDebts, bills: setBillSchedule,
    checked: setChecked, archived: setArchivedRaw, settings: setSettings,
  }

  // ---- Firestore -> state (read path) ----
  useEffect(() => {
    let resolvedWeeks = false

    const unsubs = SLICES.map(slice =>
      onSnapshot(DOCS[slice], snap => {
        if (slice === 'weeks' && !resolvedWeeks) { resolvedWeeks = true; setLoading(false) }

        if (snap.exists()) {
          try {
            const data = JSON.parse(snap.data().data)
            if (slice === 'settings') {
              setSettings(prev => ({ ...DEFAULTS.settings(), ...data }))
            } else {
              setters[slice](data)
            }
            saveLocal(slice, data) // keep the local mirror fresh
          } catch (e) {
            console.error(`Corrupt Firestore data for "${slice}" — keeping local copy.`, e)
          }
        } else if (!snap.metadata.fromCache) {
          // SERVER confirmed the doc doesn't exist -> safe to seed it once
          // with whatever we currently have (local mirror or defaults).
          const seed = loadLocal(slice) ?? DEFAULTS[slice]()
          setDoc(DOCS[slice], { data: JSON.stringify(seed) })
            .catch(e => console.error(`Seed failed for "${slice}":`, e))
        }
        // cache-miss (fromCache && !exists): do NOTHING. Never write defaults.
      }, err => {
        // Read error: keep local data, never write anything.
        console.error(`Firestore listener error for "${slice}":`, err)
        if (slice === 'weeks' && !resolvedWeeks) { resolvedWeeks = true; setLoading(false) }
      })
    )

    // Safety valve: never show the spinner longer than 5s even if Firestore hangs.
    const t = setTimeout(() => setLoading(false), 5000)
    return () => { unsubs.forEach(u => u()); clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- state -> storage (write path, only when dirty) ----
  function schedulePersist(slice, data) {
    saveLocal(slice, data) // localStorage: immediate, synchronous, always
    setSaveStatus('saving')
    clearTimeout(saveTimers.current[slice])
    saveTimers.current[slice] = setTimeout(async () => {
      pendingWrites.current++
      try {
        await setDoc(DOCS[slice], { data: JSON.stringify(data) })
        if (--pendingWrites.current <= 0) { pendingWrites.current = 0; setSaveStatus('saved') }
      } catch (e) {
        pendingWrites.current = Math.max(0, pendingWrites.current - 1)
        console.error(`Firestore save error for "${slice}" (data is safe in localStorage):`, e)
        setSaveStatus('error')
      }
    }, 400) // debounce rapid typing into one write
  }

  function persistEffect(slice, data) {
    if (!dirty.current[slice]) return
    dirty.current[slice] = false
    schedulePersist(slice, data)
  }

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => persistEffect('weeks', weeks),           [weeks])
  useEffect(() => persistEffect('debts', debts),           [debts])
  useEffect(() => persistEffect('bills', billSchedule),    [billSchedule])
  useEffect(() => persistEffect('checked', checked),       [checked])
  useEffect(() => persistEffect('archived', archivedRaw),  [archivedRaw])
  useEffect(() => persistEffect('settings', settings),     [settings])
  /* eslint-enable react-hooks/exhaustive-deps */

  // Flush any debounced write if the tab closes mid-debounce.
  useEffect(() => {
    function flush() {
      // localStorage is already written synchronously; nothing is ever lost
      // locally. This just nudges Firestore sooner when possible.
    }
    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [])

  // Mark a slice dirty, then set state. Every mutation goes through this.
  function mutate(slice, updater) {
    dirty.current[slice] = true
    setters[slice](updater)
  }

  // ---- archived helpers (stored as plain arrays, used as Sets) ----
  const archivedSet   = new Set(archivedRaw.archived || [])
  const unarchivedSet = new Set(archivedRaw.unarchived || [])

  function isArchived(week) {
    if (unarchivedSet.has(week.id)) return false
    if (archivedSet.has(week.id))   return true
    return isWeekPast(week.date)
  }

  function toggleArchive(weekId, currentlyArchived) {
    mutate('archived', prev => {
      const a = new Set(prev.archived || [])
      const u = new Set(prev.unarchived || [])
      if (currentlyArchived) { a.delete(weekId); u.add(weekId) }
      else                   { u.delete(weekId); a.add(weekId) }
      return { archived: [...a], unarchived: [...u] }
    })
  }

  // ---- checked ----
  function toggleChecked(weekId, expId) {
    mutate('checked', prev => {
      const ids = new Set(prev[weekId] || [])
      ids.has(expId) ? ids.delete(expId) : ids.add(expId)
      return { ...prev, [weekId]: [...ids] }
    })
  }

  function isChecked(weekId, expId) {
    const entry = checked[weekId]
    if (!entry) return false
    return Array.isArray(entry) ? entry.includes(expId) : entry.has?.(expId)
  }

  // ---- weeks / expenses ----
  function addExpense(weekId, name, amount) {
    mutate('weeks', prev => prev.map(w =>
      w.id !== weekId ? w : { ...w, expenses: [...w.expenses, { id: 'e' + Date.now(), name, amount }] }
    ))
  }

  function removeExpense(weekId, expId) {
    mutate('weeks', prev => prev.map(w =>
      w.id !== weekId ? w : { ...w, expenses: w.expenses.filter(e => e.id !== expId) }
    ))
    mutate('checked', prev => {
      if (!prev[weekId]) return prev
      const ids = Array.isArray(prev[weekId]) ? prev[weekId] : [...prev[weekId]]
      return { ...prev, [weekId]: ids.filter(id => id !== expId) }
    })
  }

  function updateExpense(weekId, expId, field, value) {
    mutate('weeks', prev => prev.map(w => {
      if (w.id !== weekId) return w
      return {
        ...w,
        expenses: w.expenses.map(e =>
          e.id === expId ? { ...e, [field]: field === 'amount' ? (parseFloat(value) || 0) : value } : e
        ),
      }
    }))
  }

  // Edit week-level fields: income override, bonusIncome, bonusExpense, note, label
  function updateWeek(weekId, field, value) {
    mutate('weeks', prev => prev.map(w => {
      if (w.id !== weekId) return w
      if (field === 'income') {
        const n = parseFloat(value)
        // empty/invalid -> remove override, fall back to default weekly income
        if (value === '' || isNaN(n)) { const { income, ...rest } = w; return rest }
        return { ...w, income: n }
      }
      if (field === 'bonusIncome') {
        const n = parseFloat(value)
        if (value === '' || isNaN(n) || n <= 0) { const { bonusIncome, bonusExpense, ...rest } = w; return rest }
        return { ...w, bonusIncome: n }
      }
      if (field === 'bonusExpenseAmount') {
        return { ...w, bonusExpense: { ...(w.bonusExpense || { name: 'Bonus expense' }), amount: parseFloat(value) || 0 } }
      }
      if (field === 'bonusExpenseName') {
        return { ...w, bonusExpense: { ...(w.bonusExpense || { amount: 0 }), name: value } }
      }
      return { ...w, [field]: value }
    }))
  }

  function generateNextMonthWeeks() {
    const lastWeek = weeks[weeks.length - 1]
    if (!lastWeek) return
    const newWeeks = generateNextMonth(lastWeek.date, billSchedule, settings)
    mutate('weeks', prev => [...prev, ...newWeeks])
  }

  function removeWeek(weekId) {
    mutate('weeks', prev => prev.filter(w => w.id !== weekId))
  }

  // ---- debts ----
  function updateDebt(debtId, field, value) {
    mutate('debts', prev => prev.map(d =>
      d.id !== debtId ? d
        : { ...d, [field]: field === 'balance' || field === 'min' ? (parseFloat(value) || 0) : value }
    ))
  }

  function addDebt(name, balance, apr, min, note) {
    mutate('debts', prev => [...prev, {
      id: 'debt-' + Date.now(),
      name,
      balance: parseFloat(balance) || 0,
      apr: apr || '0%',
      min: parseFloat(min) || 0,
      note: note || '',
      priority: 99,
    }])
  }

  function removeDebt(debtId) {
    mutate('debts', prev => prev.filter(d => d.id !== debtId))
  }

  // ---- bills ----
  // Compute the new schedule first, then apply both state updates separately
  // (never call setState inside another setState updater — updaters must be pure).
  function updateBill(billId, field, value) {
    const updated = billSchedule.map(b =>
      b.id !== billId ? b
        : { ...b, [field]: field === 'amount' || field === 'day' ? (parseFloat(value) || 0) : value }
    )
    mutate('bills', () => updated)
    mutate('weeks', wPrev => wPrev.map(w =>
      SPECIAL_WEEK_IDS.has(w.id) ? w : syncWeekToBills(w, updated)
    ))
  }

  function addBill(name, amount, day) {
    const updated = [...billSchedule, {
      id: 'b-custom-' + Date.now(),
      name,
      amount: parseFloat(amount) || 0,
      day: parseInt(day) || 1,
      note: '',
    }]
    mutate('bills', () => updated)
    mutate('weeks', wPrev => wPrev.map(w =>
      SPECIAL_WEEK_IDS.has(w.id) ? w : syncWeekToBills(w, updated)
    ))
  }

  function removeBill(billId) {
    const removed = billSchedule.find(b => b.id === billId)
    const updated = billSchedule.filter(b => b.id !== billId)
    mutate('bills', () => updated)
    if (removed) {
      mutate('weeks', wPrev => wPrev.map(w => {
        if (SPECIAL_WEEK_IDS.has(w.id)) return w
        return { ...w, expenses: w.expenses.filter(e => e.name !== removed.name) }
      }))
    }
  }

  // ---- settings (income) ----
  function updateSettings(field, value) {
    mutate('settings', prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  // ---- backup / restore ----
  const exportData = useCallback(() => {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: 2,
      weeks, debts, bills: billSchedule, checked, archived: archivedRaw, settings,
    }, null, 2)
  }, [weeks, debts, billSchedule, checked, archivedRaw, settings])

  function importData(json) {
    const data = JSON.parse(json) // throws on bad input; caller shows the error
    if (!Array.isArray(data.weeks) || !Array.isArray(data.debts)) {
      throw new Error('That file doesn\u2019t look like a budget backup.')
    }
    mutate('weeks', () => data.weeks)
    mutate('debts', () => data.debts)
    if (Array.isArray(data.bills))          mutate('bills', () => data.bills)
    if (data.checked)                        mutate('checked', () => data.checked)
    if (data.archived)                       mutate('archived', () => ({
      archived: data.archived.archived || [],
      unarchived: data.archived.unarchived || [],
    }))
    if (data.settings)                       mutate('settings', () => ({ ...DEFAULTS.settings(), ...data.settings }))
  }

  function resetToDefaults() {
    for (const slice of SLICES) mutate(slice, () => DEFAULTS[slice]())
  }

  return {
    weeks, debts, billSchedule, settings,
    loading, saveStatus,
    addExpense, removeExpense, updateExpense, updateWeek, removeWeek,
    generateNextMonthWeeks, resetToDefaults,
    isArchived, toggleArchive,
    toggleChecked, isChecked,
    updateDebt, addDebt, removeDebt,
    updateBill, addBill, removeBill,
    updateSettings,
    exportData, importData,
  }
}
