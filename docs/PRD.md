# Therumunai — Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | Therumunai (தெருமுனை, "Street Corner") |
| **Type** | Open-source, anonymous civic-issue reporting platform |
| **Geography** | Tamil Nadu — launch in Chennai & Coimbatore |
| **Status** | Foundation phase (this document defines the build) |
| **License** | AGPL-3.0 + Contributor License Agreement |
| **Inspiration** | [nammakasa.in](https://nammakasa.in) |

---

## 1. Vision & problem

Civic issues in Indian cities — overflowing garbage, potholed roads, dead streetlights,
waterlogged streets — are reported through fragmented, friction-heavy channels that
demand logins, app installs, or phone numbers. Most citizens give up before finishing.

**Therumunai removes every barrier.** A citizen opens a single web page, takes a photo,
shares their location, taps a category, and submits — anonymously, in under a minute.
The output is a clean, public, geospatially-mapped dataset of street-level civic issues
that citizens, journalists, researchers, and (eventually) civic bodies can all see.

**Goal:** maximize the number of *useful, well-located* reports by minimizing friction
to near zero, while keeping contributors and citizens completely anonymous.

## 2. Target users & geography

| User | Need |
|---|---|
| **Citizen reporter** | Report a problem they just saw, fast, without giving up identity |
| **Public viewer** | Browse a map of reported issues in their area |
| **Researcher / journalist** | Access an open dataset of civic issues over time |

**Administrative geography (for auto zone-tagging):**

- **Greater Chennai Corporation (GCC):** Zones 1–15.
- **Coimbatore City Municipal Corporation (CCMC):** East, West, North, South, Central.
- **Fallback:** any coordinate outside both cities' polygons is tagged **"Other TN Region"**.

> **Requirement — graceful fallback:** Because launch is Chennai + Coimbatore only,
> citizens in Madurai, Trichy, Salem, etc. *will* test the site. The backend MUST tag
> these as "Other TN Region" and accept the report. An out-of-boundary coordinate must
> **never** break the submission path or drop the report.

## 3. Privacy & anonymity principles

These are product invariants, not features to negotiate:

- **No login, no sign-up, no account.** Ever.
- **No PII collected.** No name, email, phone, or device identifier.
- **No IP retention.** Do not log/store client IPs against reports.
- **Photos are of streets, not people.** Guidance in the UI discourages capturing
  identifiable individuals; consider server-side checks in a later phase.
- **The dataset is public.** Treat every stored field as world-readable and design
  accordingly — store only what a public civic map needs.

## 4. Core user flows

### 4.1 Report an issue (no login required)

1. **Primary CTA:** "Report an Issue / குறையைப் பதிவிடு".
2. **Step 1 — Photo:** capture or upload an image of the street-level issue. The
   frontend requests a **presigned S3 URL** from the backend and uploads directly to S3.
3. **Step 2 — Location:** grab high-accuracy HTML5 browser geolocation (latitude/longitude).
4. **Step 3 — Category** (fast-click picker):
   - Garbage & Waste — குப்பை / கழிவுகள்
   - Road Damage & Potholes — பழுதடைந்த சாலை
   - Streetlight Faults — மின்விளக்கு பழுது
   - Drainage & Waterlogging — சாக்கடை / தேங்கிய நீர்
5. **Step 4 — Submit Anonymously.** Backend tags the report with city + municipal zone
   and stores it.

### 4.2 Public map dashboard

- A public map (MapLibre GL or Leaflet) reads report coordinates from the backend and
  drops **colored pins by category**.
- Filter by city, zone, and category.
- Every report shows photo, category, zone, and timestamp — never any reporter identity.

## 5. Non-functional requirements

- **Mobile-first:** responsive Tailwind CSS layout; designed for one-handed phone use on
  slow networks.
- **Internationalization:** every user-facing string in **English and Tamil (தமிழ்)**,
  with a simple in-nav toggle.
- **Performance:** fast first load on mobile; direct-to-S3 uploads keep payloads off the API.
- **Scalability:** serverless-first so cost tracks usage.
- **Accessibility:** legible contrast, large tap targets, screen-reader labels (both languages).
- **Cost:** see §8 — start cheap, scale deliberately.

## 6. Architecture overview (AWS, serverless)

```text
                 ┌─────────────────────────┐
   Citizen ───►  │ Next.js (App Router)     │  Tailwind · EN/தமிழ் · MapLibre GL
   (mobile)      │ Amplify or S3+CloudFront │
                 └───────────┬─────────────┘
                             │  presigned-URL photo upload ──► Amazon S3 (public-read images)
                             ▼
                 ┌─────────────────────────┐
                 │ API Gateway → AWS Lambda │  anonymous JSON; presign + zone-tagging logic
                 └───────────┬─────────────┘
                             ▼
                 ┌─────────────────────────┐
                 │ Aurora Serverless v2     │  PostgreSQL + PostGIS
                 │ (MVP: t4g.micro RDS)     │  ST_Contains() → municipal zone
                 └─────────────────────────┘
```

- **Frontend hosting:** Next.js on AWS Amplify, or static export to S3 + CloudFront.
- **File storage:** S3 bucket, public-read for images; uploads via backend-generated
  **presigned URLs** so the client never holds AWS credentials.
- **Backend:** Lambda (Node/TypeScript) via API Gateway, handling anonymous JSON.
- **Database/GIS:** Aurora Serverless v2 PostgreSQL with **PostGIS**. (DynamoDB alone is
  unsuitable — it cannot do native spatial polygon intersection.)

## 7. Geospatial logic (PostGIS)

- **`municipal_zones` table** stores complex **GeoJSON boundary polygons** for GCC
  Zones 1–15 and CCMC's five zones, with city + zone-name attributes.
- **`reports` table** stores the report: category, photo URL, geometry point, derived
  city + zone, timestamp. No reporter identity fields.
- **Zone tagging:** on submit, a Lambda data handler runs a PostGIS **`ST_Contains()`**
  check of the report point against zone polygons:
  - Inside a polygon → tag with that city + zone name.
  - Inside neither city → tag **"Other TN Region"** (see §2 fallback requirement).

> The concrete SQL (`CREATE EXTENSION postgis;`, table DDL, and a sample `ST_Contains`
> query) is delivered in **Phase 2** (see roadmap), living under `db/`.

## 8. Cost guardrail

**Aurora Serverless v2 does not scale to zero** — it floors at **0.5 ACU** and carries a
standing base cost, unlike Lambda or DynamoDB. For a community-funded, greenfield MVP:

- **Start** on a small **`t4g.micro` RDS PostgreSQL + PostGIS** instance to keep the
  baseline cost low.
- **Graduate** to Aurora Serverless v2 once sustained traffic justifies it.
- **Monitor AWS billing from day one** (budgets + alerts) — spatial queries and image
  storage can grow quietly.

## 9. Infrastructure boundary (public vs private)

- **Public (this repo):** application code + a **sanitized** [`deploy/`](../deploy)
  reference — example Terraform with placeholder variables, no real account IDs, no
  state, no secrets — so other cities can replicate the platform.
- **Private (separate repo):** real production IaC, Terraform state, `.env` files, and
  all AWS credentials. These must **never** be committed to the public repo. Enforced by
  `.gitignore`, [`SECURITY.md`](../SECURITY.md), and [`CLAUDE.md`](../CLAUDE.md).

## 10. Phased roadmap

| Phase | Deliverable |
|---|---|
| **0 — Foundation** (this pass) | PRD, governance, license + CLA, CI gates, sanitized `deploy/` reference |
| **1 — Infrastructure** | Provisioning for S3, API Gateway, Lambda, and the DB (Terraform; real infra in the private repo, sanitized example in public `deploy/`) |
| **2 — Database** | PostGIS init: `CREATE EXTENSION postgis`, `reports` + `municipal_zones` schemas, zone seed data, sample `ST_Contains` query (`db/`) |
| **3 — Frontend report flow** | Mobile-first Next.js multi-step reporting form (photo → geolocation → category → submit), EN/தமிழ్ toggle |
| **4 — Map dashboard** | Public MapLibre GL / Leaflet dashboard with category-colored pins and filters |

## 11. Success metrics

- **Adoption:** number of valid reports/week; share completing the full flow.
- **Coverage:** distinct zones with ≥1 report; Chennai + Coimbatore reach.
- **Data quality:** % of reports correctly auto-tagged (low "Other TN Region" rate
  *within* the two cities); % with usable photo + coordinates.
- **Trust:** zero PII incidents; disclosure footer present on all views.

## 12. Out of scope (for now)

- User accounts, gamification, or reporter reputation.
- Two-way status tracking / official resolution workflows.
- Native mobile apps (web-first; PWA later if warranted).
- Automatic routing of reports to government systems (we are **not** affiliated with any
  government body — see disclosure footer).

---

> **Therumunai is an independent citizen-led civic initiative. We are not affiliated with
> the Greater Chennai Corporation (GCC), Coimbatore City Municipal Corporation (CCMC), or
> the Government of Tamil Nadu.**
