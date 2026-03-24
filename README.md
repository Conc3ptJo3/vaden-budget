# Budget App - Joe & Lisa

A personal budget tracker with week-by-week paycheck breakdowns, live expense editing, and a debt payoff plan.

---

## Deploy to Vercel (one time)

### 1. Get the code on GitHub

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Click **New repository** → name it `budget-app` → click **Create repository**
3. On your computer, open a terminal in this folder and run:

```bash
git init
git add .
git commit -m "Initial budget app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/budget-app.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
2. Click **Add New Project**
3. Import your `budget-app` repository
4. Leave all settings as default - Vercel auto-detects Vite
5. Click **Deploy**

Your app will be live in about 60 seconds at a `*.vercel.app` URL.

### 3. Add your custom domain

1. Buy your domain (Namecheap, Google Domains, etc.)
2. In Vercel → your project → **Settings** → **Domains**
3. Add your domain and follow the DNS instructions Vercel gives you
4. Usually live within 10–30 minutes

---

## Local development

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## How it works

- All changes save automatically to the browser's localStorage
- Works on any device - phone, tablet, desktop
- Changes on one device don't sync to another (no server/database)
- Use the **Reset** button in the top-right to restore original data

### Adding expenses
1. Tap any paycheck row to expand it
2. Type the expense name and dollar amount at the bottom
3. Tap **+ Add** - the remaining balance updates instantly

### Editing expenses
- Tap any expense name or amount to edit it inline
- Tap **done** when finished
- Tap **×** to delete an expense

---

## Want real-time sync between your phone and Lisa's?

If you want changes on one device to show up on the other, that requires a backend database. Options:
- **Firebase** (free tier) - I can add this later
- **Supabase** (free tier) - same
- Both take about 30 min to wire up
