# LipaInsight: Augmented Analytics Platform for Kenyan MSMEs

## 🎯 Objective
Build a zero-footprint, client-side SaaS analytics platform that transforms raw M-Pesa and mobile money transaction data into actionable business intelligence for Kenya's 15+ million MSME workers. LipaInsight democratizes high-end analytics for the "Mama Mboga" and "Instagram Boutique" owner — no coding, no complex API integrations, just upload a CSV and get insights. The platform generates professional PDF credit reports that business owners can present to Saccos and banks to prove creditworthiness, directly facilitating financial inclusion.

---

## 📋 Tech Stack Requirements

| Requirement | Choice | Status |
|---|---|---|
| **Framework** — Next.js (v14+, App Router preferred) | Next.js 14+ with App Router | ✅ Required |
| **Styling** — Any (Tailwind CSS, CSS Modules, Shadcn/ui, etc.) | Tailwind CSS + Shadcn/ui + CSS Modules where needed | ✅ Required |
| **Backend** — Next.js API Routes or Server Actions | Next.js API Routes (webhooks, payments) + Server Actions (form submissions, DB mutations) | ✅ Required |
| **Database** — Optional but encouraged (Supabase, PlanetScale, Neon, etc.) | Supabase PostgreSQL + Prisma ORM (alternatives: PlanetScale, Neon) | 🔄 Encouraged |
| **Auth** — NextAuth, Clerk, etc. | NextAuth.js (alternative: Clerk) | 🔄 Encouraged |
| **Deployment** — Required, must be publicly accessible (Vercel recommended) | Vercel | ✅ Required |

---

## 🏗️ 1. Architecture Design

The architecture follows a **Zero-Footprint, Client-First** pattern — all data processing happens in the browser to protect user privacy and eliminate server costs at scale:

- **Framework (Next.js 14+, App Router):** The full-stack foundation. The App Router powers both the marketing/SEO pages (server-rendered) and the interactive analytics dashboard (client-rendered). All backend logic lives within **Next.js API Routes and Server Actions** — no separate backend server required.
- **Styling (Tailwind CSS + Shadcn/ui):** Tailwind for utility-first responsive design; Shadcn/ui for pre-built, accessible UI components (cards, dialogs, data tables, forms) that accelerate development while maintaining a polished look. CSS Modules may be used for component-scoped overrides where needed.
- **Data Processing Layer (Client-Side TypeScript):** A modular pipeline that ingests CSVs from multiple sources (M-Pesa Till, M-Pesa Paybill, Shopify), detects the format automatically, and maps all transactions to a unified financial schema.
- **Visualization Engine (Recharts / Chart.js):** Renders "High-Signal" charts — Transaction Density heatmaps, Revenue Velocity trends, Customer Churn matrices, and Cash Flow waterfalls — all interactive and mobile-responsive.
- **PDF Report Generator (Client-Side):** Generates professional, bank-ready PDF credit reports using `jsPDF` or `@react-pdf/renderer` directly in the browser. Reports include business health scores, revenue trends, and predictive analytics.
- **Authentication (NextAuth.js or Clerk):** User authentication via OAuth providers (Google, GitHub) and magic-link/email login. NextAuth.js is recommended for flexibility and native Next.js integration; Clerk is an alternative for faster setup with pre-built UI components. Handles session management, route protection, and role-based access (free vs. pro users).
- **Database (Supabase PostgreSQL — optional but encouraged):** Stores user profiles, saved reports metadata (not raw transaction data — that stays client-side), subscription status, and usage analytics. Alternatives include PlanetScale (MySQL, serverless-friendly) or Neon (serverless Postgres). Prisma ORM provides type-safe database access regardless of provider. If no database is used, the app can function in a stateless "demo mode" with client-side-only analytics.
- **Payments (Stripe + M-Pesa Integration):** Subscription management via Stripe for international payments and M-Pesa STK Push (via Daraja API) for local Kenyan payments — meeting users where they are. Payment webhooks handled via Next.js API Routes.
- **Deployment (Vercel — required, must be publicly accessible):** Production deployment on Vercel for edge-optimized delivery, serverless API route execution, automatic HTTPS, preview deployments on PRs, and seamless Next.js integration. The live URL must be publicly accessible for demo and review.

---

## ✨ 2. Feature Design

### Core Features to Build:

1. **Landing Page & Marketing Site (Next.js):**
   - Build a high-performance website  inspired by the design of [framer.plat-form](https://plat-form.framer.ai/).
   - Build a high-conversion landing page targeting Kenyan MSME owners with clear value propositions in both English and Swahili.
   - Feature testimonials, demo animations of the analytics dashboard, and a prominent CTA to "Upload Your First CSV — Free."
   - SEO-optimized pages explaining how LipaInsight helps with credit access, cash flow management, and business growth.

2. **Smart CSV Upload & Auto-Detection:**
   - Drag-and-drop CSV upload component with progress indicator.
   - **Format Auto-Detection Engine:** Automatically identifies whether the uploaded file is an M-Pesa Till statement, M-Pesa Paybill statement, Shopify export, or generic bank CSV based on column headers and data patterns.
   - **Data Harmonization Pipeline:** Maps all detected formats to a unified transaction schema: `{ date, time, amount, type (credit/debit), counterparty, reference, balance }`.
   - **Data Validation & Cleaning:** Handles common issues — duplicate transactions, missing fields, date format inconsistencies (DD/MM/YYYY vs MM/DD/YYYY), and currency formatting (KES commas vs decimals).
   - **Error Feedback UI:** If parsing fails, show clear, non-technical error messages ("It looks like row 45 has a missing date — would you like to skip it or fix it?").

3. **Analytics Dashboard:**
   - **Revenue Overview Card:** Total revenue, total expenses, net profit, and transaction count for the selected period.
   - **Revenue Velocity Chart (Line/Area):** Month-over-month growth rate with trend line and simple projection (linear regression) for the next 1–3 months.
   - **Transaction Density Heatmap:** A day-of-week × hour-of-day heatmap showing when the business is busiest — helps owners optimize staffing and inventory.
   - **Cash Flow Waterfall Chart:** Visual breakdown of money in vs money out, categorized by transaction type.
   - **Top Customers Table:** Ranked by total spend, frequency, and recency — with a "Churn Risk" flag for customers who haven't transacted in 30+ days.
   - **Customer Segmentation Matrix:** Simple RFM (Recency, Frequency, Monetary) segmentation displayed as a visual grid — "Loyal Champions," "At Risk," "Lost Customers."
   - **Expense Categorization:** Auto-categorize outgoing transactions (supplier payments, rent, utilities, etc.) using keyword matching on transaction descriptions.
   - **Date Range Selector:** Filter all analytics by custom date ranges, with preset options (Last 7 days, Last 30 days, This Month, This Quarter, YTD).

4. **Predictive Health Scoring (Client-Side Statistical Models):**
   - **Business Health Score (0–100):** A composite score based on revenue consistency, growth rate, customer retention, and cash flow stability. Displayed as a prominent gauge/dial on the dashboard.
   - **Churn Risk Model:** For each customer, calculate days since last transaction and flag those exceeding the business's average inter-transaction interval by 2x+ standard deviations.
   - **Revenue Forecast:** Simple linear regression on monthly revenue to project next-quarter performance with confidence intervals.
   - **Seasonality Detection:** Identify recurring revenue patterns (weekly, monthly) and surface them as insights ("Your sales dip 23% every Monday — consider running a Monday promotion").

5. **PDF Credit Report Generator:**
   - **Professional Layout:** Branded PDF with LipaInsight logo, business name, date range, and a unique report ID for verification.
   - **Executive Summary Section:** Business Health Score, total revenue, growth rate, and a plain-language assessment ("This business shows consistent monthly growth of 8% with strong customer retention").
   - **Financial Charts Embedded:** Revenue trend, cash flow waterfall, and transaction density charts rendered as images in the PDF.
   - **Customer Metrics Section:** Total unique customers, repeat customer rate, average transaction value.
   - **Predictive Section:** Revenue forecast and risk indicators.
   - **QR Code Verification:** Each report includes a QR code linking to a verification page (stored report hash in Supabase) so a bank officer can confirm the report hasn't been tampered with.
   - **Download & Share:** One-click download as PDF, with option to email directly to a specified address (bank/Sacco loan officer).

6. **User Authentication & Accounts (NextAuth.js or Clerk):**
   - Magic-link email login (no passwords to remember — optimized for the target demographic).
   - Google OAuth as an alternative.
   - NextAuth.js with the App Router for native session handling via `getServerSession()` and middleware-based route protection; or Clerk for drop-in pre-built sign-in/sign-up components and user management dashboard.
   - User profile page showing saved reports history and subscription status.
   - Account deletion with full data wipe for GDPR/Kenya Data Protection Act compliance.

7. **Subscription & Payments:**
   - **Free Tier:** Upload up to 3 CSVs per month, basic dashboard analytics, no PDF export.
   - **Pro Tier (KES 500/month or ~$4/month):** Unlimited uploads, full predictive analytics, unlimited PDF credit reports, email delivery of reports.
   - **Stripe Integration:** For card payments and international subscribers.
   - **M-Pesa STK Push Integration (Daraja API):** For local Kenyan payments — user enters phone number, receives payment prompt on their phone, subscription activates on confirmation via callback webhook.
   - **Subscription Management Page:** View current plan, upgrade/downgrade, view payment history, cancel subscription.

8. **Security & Privacy Features:**
   - All transaction data is processed client-side and **never uploaded to any server**. Only report metadata (date generated, health score, business name) is stored in the database for the verification system.
   - All secret keys (Stripe, Supabase/Neon/PlanetScale, Daraja API) stored in `.env.local` environment variables, never exposed to the frontend. Server-only access enforced via Next.js Server Actions and API Routes.
   - Rate limiting on auth endpoints and payment webhooks (implemented via Next.js API Route middleware or edge middleware).
   - Input sanitization on all user-provided text fields to prevent XSS.
   - Content Security Policy headers to prevent code injection.
   - Database-level access control: Supabase Row Level Security (RLS) policies if using Supabase, or Prisma middleware-based authorization if using PlanetScale/Neon, ensuring users can only access their own data.

9. **Localization & Accessibility:**
   - UI text available in English and Swahili.
   - Mobile-first responsive design (most Kenyan MSME owners access the internet via smartphone).
   - Low-bandwidth optimized — minimal JavaScript bundles, lazy-loaded charts, skeleton loading states.
   - Offline capability for previously loaded dashboards using service workers.

---

## 🗄️ 3. Database Design

The database schema (managed via **Prisma ORM** with your choice of **Supabase PostgreSQL**, **PlanetScale**, or **Neon**) is intentionally lightweight. **Raw transaction data is never stored server-side** — only user accounts, report metadata, and subscription logistics. A database is optional but encouraged; without one, the app can run in stateless demo mode with client-side-only analytics:

### `User` Table
Stores authenticated user profiles.
- `id` (UUID, Primary Key — synced with Supabase Auth UID)
- `email` (String, Unique)
- `name` (String, Nullable)
- `businessName` (String, Nullable)
- `phone` (String, Nullable — for M-Pesa payments)
- `locale` (Enum: `EN`, `SW` — default `EN`)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### `Subscription` Table
Tracks user subscription status and payment method.
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → `User`)
- `plan` (Enum: `FREE`, `PRO`)
- `status` (Enum: `ACTIVE`, `CANCELLED`, `PAST_DUE`, `TRIALING`)
- `paymentMethod` (Enum: `STRIPE`, `MPESA`)
- `stripeCustomerId` (String, Nullable)
- `stripeSubscriptionId` (String, Nullable)
- `mpesaPhone` (String, Nullable)
- `currentPeriodStart` (DateTime)
- `currentPeriodEnd` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### `Report` Table
Stores metadata for generated PDF credit reports (for QR verification).
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → `User`)
- `reportHash` (String, Unique — SHA-256 hash of the PDF content for tamper verification)
- `businessName` (String)
- `periodStart` (DateTime)
- `periodEnd` (DateTime)
- `healthScore` (Integer — 0 to 100)
- `totalRevenue` (Decimal)
- `totalTransactions` (Integer)
- `generatedAt` (DateTime)
- `createdAt` (DateTime)

### `UsageLog` Table
Tracks CSV uploads for free-tier enforcement.
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → `User`)
- `action` (Enum: `CSV_UPLOAD`, `PDF_EXPORT`, `REPORT_SHARED`)
- `csvFormat` (Enum: `MPESA_TILL`, `MPESA_PAYBILL`, `SHOPIFY`, `GENERIC`, Nullable)
- `transactionCount` (Integer, Nullable)
- `createdAt` (DateTime)

### `PaymentEvent` Table
Audit log for all payment events (Stripe webhooks + M-Pesa callbacks).
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → `User`)
- `provider` (Enum: `STRIPE`, `MPESA`)
- `eventType` (String — e.g., `invoice.paid`, `mpesa.confirmed`)
- `amount` (Decimal)
- `currency` (String — `KES`, `USD`)
- `reference` (String — Stripe invoice ID or M-Pesa receipt number)
- `rawPayload` (JSON — full webhook payload for audit)
- `createdAt` (DateTime)

---

## 📐 4. Data Processing Pipeline Design (Client-Side)

The CSV-to-Insight pipeline runs entirely in the browser:

### Step 1: File Ingestion
- Accept `.csv` file via drag-and-drop or file picker.
- Parse using PapaParse (streaming parser for large files).
- Detect encoding (UTF-8, ISO-8859-1) and handle BOM characters.

### Step 2: Format Detection
- Inspect first 5 rows and column headers.
- Match against known schema signatures:
  - **M-Pesa Till:** Columns include `Receipt No`, `Completion Time`, `Paid In`, `Withdrawn`.
  - **M-Pesa Paybill:** Columns include `Transaction ID`, `Trans. Date`, `Credit`, `Debit`.
  - **Shopify:** Columns include `Name`, `Total`, `Created at`, `Financial Status`.
  - **Generic:** Fallback — user maps columns manually via a simple UI.

### Step 3: Schema Mapping & Cleaning
- Map source columns to unified schema: `{ date, time, amount, type, counterparty, reference, balance }`.
- Parse dates into ISO format.
- Normalize amounts (strip "KES", commas; handle negatives).
- Deduplicate by reference/receipt number.
- Flag and surface anomalies for user review.

### Step 4: Analytics Computation
- Aggregate by day, week, month.
- Calculate: totals, averages, growth rates, customer frequency, RFM scores.
- Run linear regression for forecasting.
- Compute Business Health Score.

### Step 5: Visualization Rendering
- Feed computed data into Recharts/Chart.js components.
- Render interactive, mobile-responsive charts.

### Step 6: PDF Generation (on demand)
- Capture chart components as canvas images.
- Compose PDF layout with jsPDF or @react-pdf/renderer.
- Embed charts, metrics, QR verification code.
- Trigger browser download.

---

## 🎓 5. Learning Outcomes & Kenya Vision 2030 Alignment

### For Developers Building This:
1. How to build a privacy-first, client-side data processing pipeline in TypeScript.
2. How to auto-detect and harmonize diverse CSV formats into a unified schema.
3. How to implement simple statistical models (linear regression, RFM segmentation, anomaly detection) without a backend ML service.
4. How to generate professional PDF reports programmatically in the browser.
5. How to integrate dual payment systems (Stripe + M-Pesa Daraja API) for a Kenyan audience.
6. How to use **Next.js API Routes and Server Actions** as a full backend — no separate Express server needed.
7. Relational database modeling with **Prisma** and a serverless database provider (Supabase, PlanetScale, or Neon).
8. Authentication flows with **NextAuth.js or Clerk** — magic links, OAuth, session management, and route protection.
9. **Deployment to Vercel** — CI/CD, preview deployments, environment variable management, and production readiness.
10. Mobile-first, low-bandwidth responsive design for emerging markets using **Tailwind CSS and Shadcn/ui**.

### Kenya Vision 2030 Alignment:
- **Digital Transformation:** Converts informal paper/SMS-based record-keeping into structured digital analytics.
- **Financial Inclusion:** PDF credit reports bridge the gap between MSMEs and formal financial institutions.
- **SME Resilience:** Predictive health scoring and customer churn detection enable proactive business decisions.
- **Local Innovation:** Built on the unique M-Pesa ecosystem — a Kenyan solution for Kenyan businesses, extensible across East Africa.

---

## 🛠️ 6. Tech Stack Summary

> **Note:** The table below maps each layer to the required tech stack constraints. Items marked ⚙️ are required; items marked 🔄 are optional but encouraged.

| Layer | Technology | Requirement | Rationale |
|---|---|---|---|
| ⚙️ Framework | **Next.js 14+ (App Router)** | Required | Full-stack React framework — SSR for marketing, CSR for dashboard |
| ⚙️ Styling | **Tailwind CSS + Shadcn/ui** | Any (Tailwind, CSS Modules, Shadcn/ui) | Tailwind for utilities, Shadcn/ui for polished accessible components |
| ⚙️ Backend | **Next.js API Routes + Server Actions** | Next.js API Routes or Server Actions | No separate server — all backend logic inside Next.js |
| 🔄 Database | **Supabase PostgreSQL** (alt: PlanetScale, Neon) + **Prisma** | Optional but encouraged | Managed serverless DB with type-safe ORM; app works stateless without it |
| 🔄 Auth | **NextAuth.js** (alt: Clerk) | Optional but encouraged | Native Next.js integration, magic links + OAuth, session middleware |
| ⚙️ Deployment | **Vercel** (must be publicly accessible) | Required | Edge-optimized, preview deploys, seamless Next.js integration |
| CSV Parsing | PapaParse | — | Streaming, client-side CSV parsing for large files |
| Charts | Recharts | — | React-native charting with good mobile support |
| PDF Generation | @react-pdf/renderer or jsPDF | — | Client-side PDF creation, no server dependency |
| Payments (Intl) | Stripe | — | Card payments, subscription management via webhooks |
| Payments (Local) | Safaricom Daraja API | — | M-Pesa STK Push for Kenyan users |
| Analytics | PostHog or Plausible | — | Privacy-respecting product analytics |
| Localization | next-intl | — | i18n for English/Swahili |

---

## 🚀 7. MVP Scope & Phasing

### Phase 1 — MVP (Weeks 1–4):
- Landing page with value proposition (Next.js App Router + Tailwind + Shadcn/ui)
- CSV upload + M-Pesa Till format auto-detection
- Basic analytics dashboard (revenue overview, transaction density, top customers)
- NextAuth.js or Clerk authentication (magic link + Google OAuth)
- Stripe supported payment only
- **Deployed to Vercel — publicly accessible URL**

### Phase 2 — Credit Reports (Weeks 5–8):
- PDF credit report generation with QR verification
- Business Health Score calculation
- Revenue forecasting (linear regression)
- Customer churn risk flags
- M-Pesa Paybill and Shopify format support

### Phase 3 — Monetization (Weeks 9–12):
- Stripe subscription integration (webhooks via Next.js API Routes)
- M-Pesa STK Push payment integration (Daraja API callbacks via Next.js API Routes)
- Pro tier gating (unlimited uploads, PDF exports)
- Subscription management page
- Usage tracking and free-tier enforcement (Prisma + serverless DB)

### Phase 4 — Growth (Weeks 13+):
- Swahili localization
- Offline/PWA support
- Expense categorization
- Customer segmentation (RFM matrix)
- Report sharing via email
- Referral system for organic growth
