# 🏠 SubleaseU

Student sublease marketplace. Find or post subleases using your .edu email — no Facebook Groups, no sketchy Craigslist.

## Stack
| | |
|---|---|
| **Framework** | React Native + Expo (iOS + Android + Web from one codebase) |
| **Backend/DB** | Supabase (Postgres + Auth + Realtime + Storage) |
| **Navigation** | React Navigation v6 |
| **Auth** | Supabase Auth — .edu email verification only |

---

## 🚀 Setup (Day 1 — do this in order)

### Step 1: Install tools
```bash
# Install Node.js (https://nodejs.org) then:
npm install -g expo-cli

# Install Expo Go on your phone (App Store / Google Play)
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Create Supabase project
1. Go to https://supabase.com → New project
2. Copy your **Project URL** and **anon key** from Settings → API
3. Copy `.env.example` to `.env` and fill in both values:
```bash
cp .env.example .env
# Edit .env with your values
```

### Step 4: Run the database schema
1. Open your Supabase dashboard
2. Go to **SQL Editor** → **New Query**
3. Paste the entire contents of `supabase/schema.sql` and click **Run**

### Step 5: Enable Realtime (in Supabase dashboard)
1. Database → Replication
2. Enable `messages`, `listings`, `seekers` tables

### Step 6: Create Storage buckets (in Supabase dashboard)
1. Storage → New bucket → `listing-photos` → **Public**
2. Storage → New bucket → `lease-pdfs` → **Private**

### Step 7: Run the app
```bash
npx expo start
```
Scan the QR code with **Expo Go** on your phone. The app is live.

---

## 📁 File map

```
subleaseU/
├── App.js                          ← Entry point
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js         ← Auth-aware routing
│   ├── screens/
│   │   ├── AuthScreen.js           ← Login / signup (.edu only)
│   │   ├── MarketplaceScreen.js    ← Main dual leaser/leasee view
│   │   ├── PostListingScreen.js    ← Form: post your sublease
│   │   ├── PostSeekerScreen.js     ← Form: post what you need
│   │   ├── ListingDetailScreen.js  ← Full listing page + message CTA
│   │   └── MessagesScreen.js       ← Realtime chat thread
│   ├── components/
│   │   ├── LeaserCard.js           ← Card for someone listing their unit
│   │   ├── LeaseeCard.js           ← Card for someone seeking a unit
│   │   ├── FilterBar.js            ← Bed/price/urgent filters
│   │   └── MatchBadge.js           ← "Perfect Match" badge
│   ├── hooks/
│   │   ├── useListings.js          ← Listings CRUD + realtime
│   │   ├── useSeekers.js           ← Seekers CRUD + realtime
│   │   └── useMessages.js          ← Messages + realtime
│   └── lib/
│       └── supabase.js             ← Supabase client + helpers
└── supabase/
    └── schema.sql                  ← Full DB schema, RLS, triggers
```

---

## 🎓 Launch strategy (UT Austin)

1. Sign up with your own `.utexas.edu` email to test
2. Post a fake listing (your friend Jake's WAMPUS situation is perfect)
3. Share the Expo Go QR in:
   - r/UTAustin
   - UT Class of 2026/2027 Facebook groups
   - Your dorm GroupMe
   - Apartment-specific Discord servers (WAMPUS, Dobie, etc.)
4. Once you have 20+ real users, ship to App Store

---

## 💸 Cost to launch
| | |
|---|---|
| Supabase | Free (up to 50k MAU) |
| Expo | Free |
| Apple Developer | $99/year |
| Google Play | $25 one-time |
| **Total** | **$124** |
