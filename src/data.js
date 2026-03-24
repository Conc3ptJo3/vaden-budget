export const INCOME = 1760
export const BONUS = 1000

// Bill schedule — day of month each bill is due, used for auto-generating weeks
// day: which paycheck week it falls in (1=1st paycheck, 2=2nd, 3=3rd, 4=4th of month)
// For perpetual generation, bills are assigned to the nearest paycheck on/after their due date
export const BILL_SCHEDULE = [
  { id: 'b-rent',       name: 'Rent',                    amount: 1735, day: 1,  note: 'Split: ~735 first paycheck, ~1000 end-of-month bonus' },
  { id: 'b-elec',       name: 'Electricity',             amount: 250,  day: 1,  note: '' },
  { id: 'b-wifi',       name: 'Wifi',                    amount: 53,   day: 1,  note: '' },
  { id: 'b-tommy',      name: 'Tommy Vet',               amount: 60,   day: 1,  note: '' },
  { id: 'b-target',     name: 'Target',                  amount: 50,   day: 3,  note: '' },
  { id: 'b-discover',   name: 'Discover (min)',           amount: 100,  day: 8,  note: 'Minimum payment' },
  { id: 'b-carecredit', name: 'CareCredit AutoPay',      amount: 100,  day: 8,  note: 'Auto-pay minimum' },
  { id: 'b-van',        name: 'Van Payment',             amount: 500,  day: 21, note: '' },
  { id: 'b-netflix',    name: 'Netflix/Spotify/ChatGPT', amount: 70,   day: 15, note: '' },
  { id: 'b-vanins',     name: 'Van Insurance',           amount: 55,   day: 23, note: '' },
  { id: 'b-verizon',    name: 'Verizon',                 amount: 250,  day: 18, note: '' },
  { id: 'b-jeepins',    name: 'Jeep Insurance',          amount: 93,   day: 2,  note: '' },
  { id: 'b-jeep',       name: 'Jeep Payment',            amount: 529,  day: 16, note: '' },
  { id: 'b-cashapp',    name: 'CashApp',                 amount: 350,  day: 7,  note: '' },
  { id: 'b-kay',        name: 'Kay',                     amount: 100,  day: 3,  note: 'Due ~6th' },
]

// Recurring variable expenses (always present every week)
export const WEEKLY_EXPENSES = [
  { name: 'Weed',  amount: 100 },
  { name: 'Food',  amount: 300 },
]

export const INITIAL_WEEKS = [
  {
    id: 'w1',
    date: 'March 27, 2026',
    label: 'End of March — Bonus Month',
    type: 'bonus',
    bonusIncome: BONUS,
    bonusExpense: { name: 'Rent (1st)', amount: 1000 },
    note: 'Runs -$27 vs original — birthday + all bills hit at once.',
    expenses: [
      { id: 'e1',  name: 'Weed',                         amount: 100 },
      { id: 'e2',  name: 'Food',                         amount: 300 },
      { id: 'e3',  name: 'Tilt',                         amount: 300 },
      { id: 'e4',  name: 'Electricity',                  amount: 209 },
      { id: 'e5',  name: 'Tommy Vet',                    amount: 60  },
      { id: 'e6',  name: 'Target',                       amount: 50  },
      { id: 'e7',  name: 'Jeep Insurance',               amount: 93  },
      { id: 'e8',  name: 'Birthday (hotel + expenses)',  amount: 600 },
      { id: 'e9',  name: 'Van Insurance',                amount: 55  },
      { id: 'e10', name: 'Progressive Leasing',          amount: 20  },
    ],
  },
  {
    id: 'w2',
    date: 'April 3, 2026',
    label: '',
    type: 'normal',
    note: 'Kay clears Apr 6 — slight timing buffer.',
    expenses: [
      { id: 'e1', name: 'Weed',               amount: 100 },
      { id: 'e2', name: 'Food',               amount: 300 },
      { id: 'e3', name: 'Discover (min)',      amount: 100 },
      { id: 'e4', name: 'CareCredit AutoPay', amount: 100 },
      { id: 'e5', name: 'CashApp',            amount: 350 },
      { id: 'e6', name: 'Rent (half)',         amount: 735 },
      { id: 'e7', name: 'Kay',                amount: 100 },
    ],
  },
  {
    id: 'w3',
    date: 'April 10, 2026',
    label: 'Wisdom Teeth Savings Push',
    type: 'savings',
    note: '',
    expenses: [
      { id: 'e1', name: 'Weed',               amount: 100 },
      { id: 'e2', name: 'Food',               amount: 300 },
      { id: 'e3', name: 'Jeep Payment',        amount: 528 },
      { id: 'e4', name: 'Wisdom Teeth Fund',   amount: 800 },
    ],
  },
  {
    id: 'w4',
    date: 'April 17, 2026',
    label: 'Progressive Leasing Payoff',
    type: 'payoff',
    note: 'Progressive Leasing done — frees $20/mo going forward.',
    expenses: [
      { id: 'e1', name: 'Weed',                        amount: 100 },
      { id: 'e2', name: 'Food',                        amount: 300 },
      { id: 'e3', name: 'Van Payment',                 amount: 500 },
      { id: 'e4', name: 'Van Insurance',               amount: 55  },
      { id: 'e5', name: 'Verizon',                     amount: 250 },
      { id: 'e6', name: 'Progressive Leasing PAYOFF',  amount: 300 },
      { id: 'e7', name: 'CashApp',                     amount: 200 },
    ],
  },
  {
    id: 'w5',
    date: 'April 24, 2026',
    label: 'End of April — Bonus Month',
    type: 'bonus',
    bonusIncome: BONUS,
    bonusExpense: { name: 'Rent (remainder)', amount: 1000 },
    note: 'Runs -$28 vs $1,760 — watch this one.',
    expenses: [
      { id: 'e1', name: 'Weed',               amount: 100 },
      { id: 'e2', name: 'Food',               amount: 300 },
      { id: 'e3', name: 'Rent (half)',         amount: 735 },
      { id: 'e4', name: 'Tommy Vet',           amount: 60  },
      { id: 'e5', name: 'Jeep Insurance',      amount: 93  },
      { id: 'e6', name: 'Wisdom Teeth Fund',   amount: 500 },
    ],
  },
  {
    id: 'w6',
    date: 'May 1, 2026',
    label: 'Wisdom Teeth Savings Push',
    type: 'savings',
    note: 'Surgery one week away — final savings push.',
    expenses: [
      { id: 'e1',  name: 'Weed',               amount: 100 },
      { id: 'e2',  name: 'Food',               amount: 300 },
      { id: 'e3',  name: 'Electricity',         amount: 250 },
      { id: 'e4',  name: 'Tommy Vet',           amount: 60  },
      { id: 'e5',  name: 'Target',             amount: 50  },
      { id: 'e6',  name: 'Discover (min)',      amount: 100 },
      { id: 'e7',  name: 'Jeep Insurance',      amount: 93  },
      { id: 'e8',  name: 'Wisdom Teeth Fund',   amount: 500 },
      { id: 'e9',  name: 'Wifi',               amount: 53  },
      { id: 'e10', name: 'Kay',                amount: 100 },
    ],
  },
  {
    id: 'w7',
    date: 'May 8, 2026',
    label: "Lisa's Wisdom Teeth Surgery",
    type: 'surgery',
    note: '~$3,000 saved across prior weeks covers surgery costs.',
    expenses: [
      { id: 'e1', name: 'Weed',                         amount: 100  },
      { id: 'e2', name: 'Food',                         amount: 300  },
      { id: 'e3', name: 'CareCredit AutoPay (min)',      amount: 90   },
      { id: 'e4', name: 'Wisdom Teeth Surgery',          amount: 1200 },
    ],
  },
  {
    id: 'w8',
    date: 'May 15, 2026',
    label: 'Post-Surgery — CareCredit Attack Begins',
    type: 'payoff',
    note: 'CareCredit extra payments start May 22.',
    expenses: [
      { id: 'e1', name: 'Weed',         amount: 100 },
      { id: 'e2', name: 'Food',         amount: 300 },
      { id: 'e3', name: 'Van Payment',  amount: 500 },
      { id: 'e4', name: 'Verizon',      amount: 250 },
      { id: 'e5', name: 'Jeep Payment', amount: 528 },
    ],
  },
  {
    id: 'w9',
    date: 'May 22, 2026',
    label: 'CareCredit Extra Payment',
    type: 'payoff',
    note: 'CareCredit ~$3,813 combined. After this: ~$2,723.',
    expenses: [
      { id: 'e1', name: 'Weed',                   amount: 100  },
      { id: 'e2', name: 'Food',                   amount: 300  },
      { id: 'e3', name: 'Van Insurance',           amount: 55   },
      { id: 'e4', name: 'CareCredit EXTRA PAYMENT', amount: 1000 },
    ],
  },
  {
    id: 'w10',
    date: 'May 29, 2026',
    label: 'End of May — Bonus Month',
    type: 'bonus',
    bonusIncome: BONUS,
    bonusExpense: { name: 'Rent (remainder)', amount: 1000 },
    note: '',
    expenses: [
      { id: 'e1', name: 'Weed',          amount: 100 },
      { id: 'e2', name: 'Food',          amount: 300 },
      { id: 'e3', name: 'Rent (half)',   amount: 735 },
      { id: 'e4', name: 'Electricity',   amount: 250 },
      { id: 'e5', name: 'Jeep Insurance', amount: 93  },
      { id: 'e6', name: 'Wifi',          amount: 53  },
      { id: 'e7', name: 'Tommy Vet',     amount: 60  },
      { id: 'e8', name: 'Target',        amount: 50  },
    ],
  },
  {
    id: 'w11',
    date: 'June 5, 2026',
    label: 'CareCredit Extra Payment',
    type: 'payoff',
    note: 'CareCredit down to ~$1,633. Kay nearly done.',
    expenses: [
      { id: 'e1', name: 'Weed',                    amount: 100  },
      { id: 'e2', name: 'Food',                    amount: 300  },
      { id: 'e3', name: 'Discover (min)',           amount: 100  },
      { id: 'e4', name: 'CareCredit EXTRA PAYMENT', amount: 1000 },
      { id: 'e5', name: 'Kay',                     amount: 100  },
    ],
  },
  {
    id: 'w12',
    date: 'June 12, 2026',
    label: 'CareCredit Final Push',
    type: 'payoff',
    note: 'CareCredit ~$1,283 remaining after this.',
    expenses: [
      { id: 'e1', name: 'Weed',                    amount: 100 },
      { id: 'e2', name: 'Food',                    amount: 300 },
      { id: 'e3', name: 'Verizon',                 amount: 250 },
      { id: 'e4', name: 'Jeep Payment',            amount: 528 },
      { id: 'e5', name: 'CareCredit EXTRA PAYMENT', amount: 350 },
    ],
  },
  {
    id: 'w13',
    date: 'June 19, 2026',
    label: 'CareCredit — Finish It',
    type: 'payoff',
    note: 'CareCredit paid off. Pivot fully to Discover.',
    expenses: [
      { id: 'e1', name: 'Weed',             amount: 100 },
      { id: 'e2', name: 'Food',             amount: 300 },
      { id: 'e3', name: 'Van Payment',      amount: 500 },
      { id: 'e4', name: 'Van Insurance',    amount: 55  },
      { id: 'e5', name: 'CareCredit PAYOFF', amount: 805 },
    ],
  },
  {
    id: 'w14',
    date: 'June 26, 2026',
    label: 'End of June — Bonus Month',
    type: 'bonus',
    bonusIncome: BONUS,
    bonusExpense: { name: 'Rent (remainder)', amount: 1000 },
    note: 'Discover paydown begins in earnest.',
    expenses: [
      { id: 'e1', name: 'Weed',                    amount: 100 },
      { id: 'e2', name: 'Food',                    amount: 300 },
      { id: 'e3', name: 'Rent (half)',              amount: 735 },
      { id: 'e4', name: 'Electricity',             amount: 250 },
      { id: 'e5', name: 'Wifi',                    amount: 53  },
      { id: 'e6', name: 'Tommy Vet',               amount: 60  },
      { id: 'e7', name: 'Target',                  amount: 50  },
      { id: 'e8', name: 'Jeep Insurance',           amount: 93  },
      { id: 'e9', name: 'Discover EXTRA PAYMENT',   amount: 119 },
    ],
  },
  {
    id: 'w15',
    date: 'July 3, 2026',
    label: 'Discover Full Attack Mode',
    type: 'payoff',
    note: 'Most bills hit other weeks — throw everything at Discover.',
    expenses: [
      { id: 'e1', name: 'Weed',                   amount: 100  },
      { id: 'e2', name: 'Food',                   amount: 300  },
      { id: 'e3', name: 'Discover EXTRA PAYMENT',  amount: 1260 },
    ],
  },
]

export const INITIAL_DEBTS = [
  { id: 'd1', name: 'Kay',             balance: 550,   apr: '33%',     min: 100, note: '$100/mo min until done — nearly there',     priority: 0 },
  { id: 'd2', name: 'CareCredit Lisa', balance: 2346,  apr: '0% promo', min: 90,  note: 'Deferred interest — kill before promo ends', priority: 1 },
  { id: 'd3', name: 'CareCredit Joe',  balance: 1467,  apr: '0% promo', min: 0,   note: 'Treat as one ~$3,813 combined balance',       priority: 1 },
  { id: 'd4', name: 'Discover',        balance: 3841,  apr: '22.5%',   min: 100, note: 'Pay to $1,000 then min while attacking Van',  priority: 2 },
  { id: 'd5', name: 'Van Loan',        balance: 15600, apr: '~6.5%',   min: 500, note: 'Lowest rate — attack last',                   priority: 3 },
]

// Given the last week's date, generate the next 4 weeks with scheduled bills
export function generateNextMonth(lastWeekDate, existingWeekIds) {
  const last = new Date(lastWeekDate)
  const newWeeks = []

  for (let i = 1; i <= 4; i++) {
    const weekDate = new Date(last)
    weekDate.setDate(last.getDate() + 7 * i)

    const dom = weekDate.getDate() // day of month for this paycheck
    const month = weekDate.getMonth() + 1
    const year = weekDate.getFullYear()

    // Determine which bills fall in this paycheck's window
    // This paycheck covers the 7-day window starting on weekDate
    const windowStart = dom
    const windowEnd = dom + 6

    const billsThisWeek = BILL_SCHEDULE.filter(bill => {
      const d = bill.day
      // Handle month-wrap for window
      const daysInMonth = new Date(year, month, 0).getDate()
      if (windowEnd > daysInMonth) {
        // window wraps to next month
        return d >= windowStart || d <= (windowEnd - daysInMonth)
      }
      return d >= windowStart && d <= windowEnd
    })

    // Is this an end-of-month bonus week? (last Thursday of month, roughly)
    // Detect by checking if next week crosses into a new month
    const nextWeek = new Date(weekDate)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const isEndOfMonth = nextWeek.getMonth() !== weekDate.getMonth()

    const dateStr = weekDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const id = 'w-gen-' + dateStr.replace(/[^a-z0-9]/gi, '-').toLowerCase()

    // Build expenses — always include weekly staples
    const expenses = [
      { id: 'eg-weed-' + i, name: 'Weed', amount: 100 },
      { id: 'eg-food-' + i, name: 'Food', amount: 300 },
      ...billsThisWeek.map((b, bi) => ({
        id: `eg-bill-${i}-${bi}`,
        name: b.name,
        amount: b.amount,
      }))
    ]

    // Deduplicate (weed/food already in BILL_SCHEDULE? no, but just in case)
    const seen = new Set()
    const dedupedExpenses = expenses.filter(e => {
      if (seen.has(e.name)) return false
      seen.add(e.name)
      return true
    })

    newWeeks.push({
      id,
      date: dateStr,
      label: isEndOfMonth ? 'End of Month — Bonus' : '',
      type: isEndOfMonth ? 'bonus' : 'normal',
      bonusIncome: isEndOfMonth ? BONUS : undefined,
      bonusExpense: isEndOfMonth ? { name: 'Rent (remainder)', amount: 1000 } : undefined,
      note: 'Auto-generated — edit as needed.',
      expenses: dedupedExpenses,
    })
  }

  return newWeeks
}