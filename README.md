# ⚡ Truuk — Affiliate Marketing Platform

A full-stack affiliate marketing platform built with **Next.js 14**, **MongoDB**, and **NextAuth**.

---

## 🚀 SETUP IN 5 STEPS

### Step 1 — Unzip and open the folder
Unzip the file, then open **Terminal** and run:
```bash
cd ~/Downloads/truuk
```

### Step 2 — Get a FREE MongoDB Database
1. Go to https://mongodb.com/atlas
2. Create a free account → Create a free cluster (M0)
3. Click **Connect** → **Drivers** → copy the connection string
4. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

### Step 3 — Configure Environment
```bash
cp .env.example .env.local
open .env.local
```
Fill in your MongoDB URL:
```
MONGODB_URI=mongodb+srv://your-connection-string/truuk
NEXTAUTH_SECRET=any-long-random-string-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_TRACKING_DOMAIN=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Truuk
```

### Step 4 — Install & Seed
```bash
npm install
node scripts/seed.js
```

### Step 5 — Run
```bash
npm run dev
```
Open http://localhost:3000

**Login:** admin@truuk.io  
**Password:** admin123

---

## 📁 Project Structure

```
truuk/
├── app/
│   ├── api/              ← All backend API routes
│   │   ├── auth/         ← Login/logout (NextAuth)
│   │   ├── campaigns/    ← Campaign CRUD
│   │   ├── affiliates/   ← Affiliate CRUD
│   │   ├── clicks/       ← Click tracking endpoint
│   │   ├── conversions/  ← Postback / S2S tracking
│   │   ├── payouts/      ← Payout management
│   │   ├── reports/      ← Analytics aggregation
│   │   └── dashboard/    ← Dashboard stats
│   ├── dashboard/        ← Dashboard page
│   ├── campaigns/        ← Campaigns page
│   ├── affiliates/       ← Affiliates page
│   ├── reports/          ← Reports page
│   ├── payouts/          ← Payouts page
│   ├── settings/         ← Settings page
│   └── login/            ← Login page
├── components/
│   ├── layout/           ← Sidebar, Header
│   └── ui/               ← Shared UI components
├── models/               ← MongoDB Schemas
│   ├── User.js
│   ├── Campaign.js
│   ├── Affiliate.js
│   ├── Click.js
│   ├── Conversion.js
│   └── Payout.js
├── lib/
│   ├── mongoose.js       ← DB connection
│   └── utils.js          ← Helpers
└── scripts/
    └── seed.js           ← Sample data seeder
```

---

## 🌐 Deploy to Production FREE (Vercel)

1. Push code to GitHub
2. Go to https://vercel.com → Import project
3. Add Environment Variables (same as .env.local)
4. Change `NEXTAUTH_URL` to your Vercel domain (e.g. https://truuk.vercel.app)
5. Click **Deploy** ✅

---

## 🔗 Tracking URLs

**Click Tracking** (give to affiliates):
```
https://yourdomain.com/api/clicks?cid=CAMPAIGN_ID&aid=AFFILIATE_ID&sub1=SUB1
```

**Postback / S2S** (give to advertisers):
```
https://yourdomain.com/api/conversions?cid=CAMPAIGN_ID&aid=AFFILIATE_ID&txid=TRANSACTION_ID
```

---

## ❓ Troubleshooting

**`npm error: no such file or directory`**  
→ You're in the wrong folder. Run `cd ~/Downloads/truuk` first.

**`Cannot find module`**  
→ Run `npm install` before anything else.

**MongoDB connection error**  
→ Check your MONGODB_URI in .env.local is correct.

---

© 2024 Truuk · All rights reserved
