import { INCOME } from './data'

export function fmt(n) {
  const abs = Math.abs(n)
  const s = '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return n < 0 ? '-' + s : s
}

export function getRemaining(week) {
  const spent = week.expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const bonusNet = week.bonusIncome
    ? week.bonusIncome - (week.bonusExpense?.amount || 0)
    : 0
  return INCOME - spent + bonusNet
}

export function remainingColor(rem) {
  if (rem >= 200) return 'green'
  if (rem >= 0)   return 'orange'
  return 'red'
}

export function isDebtPayment(name) {
  return /extra|payoff|payment$/i.test(name)
}

export function isSavings(name) {
  return /fund|savings|surgery/i.test(name)
}
