# Earnings Calendar — Product Brief

**Last Updated:** February 25, 2026  
**Product Manager:** Happy AI  
**Status:** v0.1 MVP Live → Planning v1.0

---

## 🎯 Executive Summary

Earnings Calendar is a Next.js web app that displays upcoming earnings reports with beat/miss indicators and AI-generated analysis. Currently deployed on Vercel with Jan-Mar 2026 data backfilled.

**Current state:** Functional MVP with core calendar + report pages  
**Opportunity:** Build the best AI-powered earnings intelligence platform for retail traders  
**Target users:** Active retail traders, options traders, swing traders  

---

## 📊 Competitive Landscape

### Direct Competitors

| Platform | Pricing | Strengths | Weaknesses |
|----------|---------|-----------|------------|
| **Earnings Whispers** | $50-200/mo | Whisper numbers, PEAD analysis, brand recognition | Expensive, clunky UI, dated design |
| **Benzinga Pro** | $29-200/mo | News speed, squawk box, comprehensive | Overwhelming, not earnings-focused |
| **Seeking Alpha** | $20-30/mo (Premium) | Community analysis, articles | Generalist, not calendar-focused |
| **Earnings Hub** (iOS) | $15/mo or $48-192/yr | Live calls, transcripts, mobile-native | iOS only, no web app |
| **Yahoo Finance** | Free | Ubiquitous, trusted | Basic, no analysis, ad-heavy |
| **Stock Analysis** | Free | Clean UI, good data | No AI, no alerts |

### Our Differentiation Opportunity
1. **AI-first analysis** — Not just data, but actionable insights
2. **Modern UX** — Clean, fast, mobile-responsive (competitors are stuck in 2015)
3. **Trader-focused** — Built for people who trade earnings, not passive investors
4. **Transparent pricing** — Simple tiers, not hidden upsells

---

## 🚀 Top Product Improvements (10x Features)

### 1. **Personalized Watchlist + Alerts**
> *"Only show me what I care about"*

- Add/remove tickers to personal watchlist
- Push notifications: "NVDA reports in 1 hour" 
- Email digest: Weekly earnings preview for watchlist
- Telegram/Discord bot integration

**Value:** Transforms from browsing tool → trading assistant

### 2. **Post-Earnings Trade Signals**
> *"What do I do after the report?"*

- **Price reaction tracker:** Show stock move in first 30min/1hr/1day after report
- **Historical patterns:** "NVDA beat estimates 8/8 last quarters. Average next-day move: +4.2%"
- **Options implied move vs actual:** "Market expected 8% move, actual was 12%"
- **Gap analysis:** Pre-market vs close

**Value:** Turns historical data into actionable trading edges

### 3. **Earnings Call Transcripts + Audio**
> *"I want to hear what the CEO said"*

- Full transcript with timestamps
- AI-highlighted key moments ("CEO dodged margin question at 14:22")
- Audio player with variable speed
- "Jump to Q&A" button

**Value:** Matches Earnings Hub's killer feature, on web

### 4. **Real-time During-Report Experience**
> *"What's happening RIGHT NOW?"*

- Live EPS/revenue as it drops
- Real-time stock price overlay
- Live sentiment from Twitter/X
- "Earnings in progress" indicator on calendar

**Value:** Turns passive calendar into live trading dashboard

### 5. **Options Chain Integration**
> *"Should I sell premium or buy calls?"*

- Show implied volatility percentile
- Expected move calculation
- Historical IV crush patterns
- Iron condor profit zone visualization

**Value:** Options traders are our power users → give them power tools

### 6. **Social & Community Features**
> *"What are others thinking?"*

- User predictions: "Will NVDA beat?" polls
- Comment threads on report pages
- Trader reputation scores
- "Hot takes" feed during earnings season

**Value:** Creates stickiness and FOMO to check back

### 7. **Mobile-First PWA**
> *"I check earnings on my phone"*

- Install as PWA (add to home screen)
- Push notifications via service worker
- Offline calendar access
- Quick-action widgets

**Value:** 60%+ of retail traders are mobile-first

### 8. **Sector/Theme Views**
> *"Show me all the AI stocks reporting this week"*

- Filter by sector: Tech, Healthcare, Financials, etc.
- Theme tags: "AI stocks", "Dividend aristocrats", "Meme stocks"
- Market cap filters
- Custom views ("My Mag7 tracker")

**Value:** Reduces noise, increases relevance

---

## 💰 Monetization Strategy

### Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Calendar, 3-day lookahead, basic beat/miss, limited AI summaries (5/week) |
| **Pro** | $9/mo or $79/yr | Full calendar, unlimited AI analysis, watchlist (25 tickers), email alerts, historical data (1yr) |
| **Trader** | $29/mo or $249/yr | Everything in Pro + push notifications, options data, transcripts, API access, unlimited watchlist |
| **Team** | $99/mo | 5 seats, priority support, white-label embeds, bulk API |

### Pricing Rationale
- **Free tier:** Generous enough to be useful, gated enough to convert
- **Pro at $9/mo:** Undercuts Earnings Hub ($15), targets casual traders
- **Trader at $29/mo:** Matches Benzinga Basic, targets serious traders
- **Annual discount:** ~30% off drives commitment, reduces churn

### Revenue Projections (Conservative)

| Milestone | Users | Paid Conv. | MRR | ARR |
|-----------|-------|------------|-----|-----|
| Month 3 | 5,000 | 3% | $1,350 | $16K |
| Month 6 | 20,000 | 4% | $7,200 | $86K |
| Month 12 | 50,000 | 5% | $22,500 | $270K |

### Additional Revenue Streams

#### 1. **Affiliate Partnerships** 
- Broker referrals (Robinhood, IBKR, Schwab): $50-200 per funded account
- Options education courses: 30-50% rev share
- Trading tools (TradingView, Unusual Whales): 20-30% rev share

*Est. potential:* $2-5 per user/year

#### 2. **Data Licensing / API**
- Historical earnings data + AI analysis via API
- Hedge fund / fintech integrations
- White-label earnings widgets for financial sites

*Est. potential:* $1K-10K/mo per enterprise customer

#### 3. **Sponsored Content**
- "Featured Earnings" placements (tasteful, clearly marked)
- Earnings preview sponsored by brokers
- Pre-earnings webinar sponsorships

*Est. potential:* $500-2K/placement during peak earnings season

#### 4. **Premium AI Features**
- "Ask AI" about any earnings: "Compare NVDA vs AMD margin trends"
- Custom report generation
- Portfolio-wide earnings impact analysis

*Est. potential:* Usage-based pricing, $0.10-0.50 per query

---

## 🗓️ Product Roadmap

### Phase 1: Quick Wins (Next 2 Weeks)

| Feature | Effort | Impact | Notes |
|---------|--------|--------|-------|
| **Watchlist (local storage)** | 2 days | 🔥🔥🔥 | No backend needed, instant personalization |
| **Search/filter bar** | 1 day | 🔥🔥 | Find any ticker quickly |
| **Mobile responsive polish** | 1 day | 🔥🔥 | Currently works, but not optimized |
| **Share buttons** | 0.5 day | 🔥 | Twitter/X cards, copy link |
| **SEO optimization** | 1 day | 🔥🔥 | Meta tags, sitemap, structured data |
| **"This week" summary email** | 2 days | 🔥🔥 | Mailchimp/Resend integration |
| **Historical beat/miss indicator** | 1 day | 🔥🔥 | "Beat 6/8 last quarters" badge |

**Goal:** Ship all by end of Week 2

### Phase 2: Core Differentiators (Month 1)

| Feature | Effort | Impact | Notes |
|---------|--------|--------|-------|
| **User accounts (Auth)** | 3 days | 🔥🔥🔥 | Clerk or NextAuth, enables everything |
| **Persistent watchlist** | 2 days | 🔥🔥🔥 | Synced across devices |
| **Email alerts** | 3 days | 🔥🔥🔥 | "NVDA reports tomorrow" |
| **Post-earnings price reaction** | 3 days | 🔥🔥🔥 | Show 1hr/1day move, huge value-add |
| **Enhanced AI analysis** | 2 days | 🔥🔥 | More depth, sector context |
| **Stripe integration** | 3 days | 🔥🔥🔥 | Pro tier launch! |
| **Basic paywall** | 2 days | 🔥🔥🔥 | Free vs Pro gates |

**Goal:** Launch paid Pro tier by Week 4

### Phase 3: Moat Builders (3 Months)

| Feature | Effort | Impact | Notes |
|---------|--------|--------|-------|
| **Push notifications (PWA)** | 1 week | 🔥🔥🔥 | Mobile engagement driver |
| **Earnings call transcripts** | 2 weeks | 🔥🔥🔥 | Major value-add, API integration needed |
| **Options data integration** | 2 weeks | 🔥🔥🔥 | IV, expected move, historical crush |
| **Historical data (5yr+)** | 1 week | 🔥🔥 | Backtesting patterns |
| **Community predictions** | 2 weeks | 🔥🔥 | Social engagement |
| **Telegram/Discord bot** | 1 week | 🔥🔥 | Alert delivery, engagement |
| **API for developers** | 2 weeks | 🔥🔥 | B2B revenue stream |
| **Real-time earnings tracking** | 3 weeks | 🔥🔥🔥 | Live during-report experience |

**Goal:** Trader tier launch + 3 major differentiating features

---

## 🎨 UX/Mockup Ideas

### Calendar View Enhancements
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 [Search ticker...]  [Filter: All ▼]  [My Watchlist ⭐]   │
├─────────────────────────────────────────────────────────────┤
│ Feb 24-28, 2026                              [< Week  >]    │
├─────────────────────────────────────────────────────────────┤
│  Mon 24     │  Tue 25     │  Wed 26     │  Thu 27     │ ... │
│  ─────────  │  ─────────  │  ─────────  │  ─────────  │     │
│  ☀️ PRE     │  ☀️ PRE     │             │             │     │
│  HD  +1.6%  │  LOW +2.8%  │  🌙 POST    │  🌙 POST    │     │
│  ⭐ beat    │  TJX +5.1%  │  NVDA 94%   │  MNST 74%   │     │
│             │             │  ⭐ CRM 85% │  DELL 82%   │     │
│  🌙 POST    │  🌙 POST    │  SNOW 78%   │             │     │
│  HIMS+120%  │  WDAY +3.1% │  OKTA 71%   │             │     │
│             │             │  ZM 65%     │             │     │
└─────────────────────────────────────────────────────────────┘
```

### Report Page Enhancements
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back]                                                    │
│                                                             │
│  [NVDA Logo]  NVIDIA                     🔔 Alert Me        │
│              ─────────────                                  │
│              🟡 PENDING  |  Feb 26  |  After Hours          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Est EPS  │ │ Beat Odds│ │ Exp Move │ │ IV Rank  │        │
│  │  $0.89   │ │   94%    │ │  ±8.2%   │ │   87%    │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                             │
│  📊 HISTORICAL PERFORMANCE                                  │
│  ├─ Beat 8/8 last quarters                                  │
│  ├─ Avg surprise: +12.3%                                    │
│  └─ Avg next-day move: +4.2%                                │
│                                                             │
│  🤖 AI PREVIEW                                              │
│  NVIDIA reports Q4 FY2026 earnings today...                 │
│                                                             │
│  📝 TRANSCRIPT (Premium)  🔒                                │
│  [Unlock with Pro →]                                        │
│                                                             │
│  💬 TRADER PREDICTIONS (Coming Soon)                        │
│  [Be first to predict →]                                    │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Card (Compact)
```
┌─────────────────────────┐
│ NVDA          ⭐  🔔    │
│ NVIDIA              94% │
│ Wed 26 • After Hours    │
│ Est $0.89 • IV 87%      │
└─────────────────────────┘
```

---

## 📈 Success Metrics

### North Star Metric
**Weekly Active Users (WAU) who view 3+ reports**  
*Why: Indicates engaged users who find real value*

### Supporting Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|--------|------------------|------------------|
| Total users | 5,000 | 20,000 |
| WAU | 2,000 | 8,000 |
| Free → Pro conversion | 3% | 4% |
| Pro MRR | $1,350 | $7,200 |
| Avg session duration | 2.5 min | 3.5 min |
| Email open rate | 35% | 40% |
| Push notification opt-in | — | 25% |

### Funnel
```
Visit → Sign up (15%) → Watchlist created (40%) → Alert enabled (30%) → Paid (5%)
```

---

## 🏁 Immediate Next Steps

1. **[ ] Set up Vercel Analytics** — Understand current traffic
2. **[ ] Add search bar** — Quick win, high impact
3. **[ ] Implement local watchlist** — No backend, instant value
4. **[ ] Create landing page with email capture** — Build list before paid launch
5. **[ ] Add "historical beat rate" to cards** — Low effort, high value
6. **[ ] Mobile responsive audit** — Ensure touch targets, swipe works
7. **[ ] Set up Stripe in test mode** — Prep for Pro launch

---

## 🧠 Open Questions

1. **Data source for real-time earnings?** — Need API for live EPS drops
2. **Transcripts provider?** — Earnings Hub uses some API, need to research
3. **Options data API?** — CBOE, Tradier, or scrape?
4. **Auth provider?** — Clerk (fast) vs NextAuth (flexible)?
5. **Cost of AI at scale?** — Currently using OpenAI, may need to optimize

---

## 💡 Wild Ideas (Future Exploration)

- **"Earnings Season" game** — Predict all Mag7 earnings, leaderboard
- **Earnings sentiment NFTs** — "I called NVDA beat" collectibles
- **AI-generated trade plans** — "If NVDA beats, buy 0DTE calls"
- **Voice alerts** — "NVIDIA just reported, stock up 4%"
- **Shorts tracker** — High short interest + earnings = volatility
- **Earnings correlation map** — "When NVDA beats, AMD usually follows"

---

*Document owned by Happy PM Bot. Questions → Mike.*
