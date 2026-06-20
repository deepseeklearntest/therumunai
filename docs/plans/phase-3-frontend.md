# Phase 3 — Frontend (Next.js report flow) · Implementation Plan

| | |
|---|---|
| **Phase** | 3 — Frontend |
| **PRD ref** | §4.3 categories, §6 frontend stack, §10 roadmap row "Phase 3" |
| **Status** | Built & verified (27/27 web tests green; lint, typecheck, and `next build` static export all pass). |
| **Goal** | Replace the `apps/web` stub with a mobile-first Next.js (App Router) static-export frontend implementing the 4-step anonymous report flow (Photo → Location → Category → Submit) with full EN/தமிழ் i18n, wired to the `services/submit` API exactly as it exists today. |

---

## 1. Integration contract (locked by existing Phase 1/2 code — do not drift)

| Source | Contract |
|---|---|
| `services/submit/src/presign.ts` | `GET /presign?contentType=<mime>` → `200 { uploadUrl, photoKey }`. Allowed MIME: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`. `photoKey` = `photos/YYYY/MM/<uuid>.<ext>`. |
| `services/submit/src/validate.ts` | `POST /reports` body must contain **exactly** `category, latitude, longitude, photoKey` — any extra key is rejected with `400 { errors }`. |
| `services/submit/src/index.ts` | `201` response carries `id, category, latitude, longitude, photoKey, city, zone, timestamp, status, disclosure`. `city: "Other TN Region"` / `zone: null` is the HARD RULE 5 fallback — a **success**, not an error. |
| CLAUDE.md HARD RULE 3 | Verbatim Disclosure Footer (EN + தமிழ்) on every view. |
| CLAUDE.md HARD RULE 4 | Every user-facing string has EN + தமிழ். |
| CLAUDE.md HARD RULE 5 | Out-of-boundary coordinates render as normal success, never an error state. |

## 2. Architecture

- **Framework:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v3, static export (`output: "export"`, `images.unoptimized: true`) for S3/CloudFront or Amplify hosting.
- **i18n:** `app/i18n/dictionaries.ts` defines a single `Dictionary` type; `en` and `ta` both implement it, so a missing translation key is a compile error. `LanguageProvider` (client context) exposes `lang`, `setLang`, `t()`, persisted to `localStorage` only (no cookies, no PII, no analytics).
- **Flow state:** `app/page.tsx` is a client component using `useReducer` over a `StepId` enum (`start | photo | location | category | submit | success`). Each step is its own component under `app/components/report/`. The `start` step is an intro screen showing the bilingual tagline and the named Primary CTA (`ctaReportIssue` / "Report an Issue" · "குறையைப் பதிவிடு" — PRD-named CTA) that begins the flow.
- **API client:** `app/lib/api.ts` exposes `getPresignedUrl`, `uploadPhoto`, `submitReport` as pure `fetch`-based functions. `submitReport` builds the request body as an explicit 4-key object literal so it can never accidentally leak extra fields to the validator.

## 3. Task breakdown

| # | Task | Files | Acceptance |
|---|---|---|---|
| 1 | Scaffold Next.js app, Tailwind, ESLint, Vitest | `apps/web/{package.json,next.config.mjs,tsconfig.json,tailwind.config.ts,postcss.config.mjs,.eslintrc.json,vitest.config.ts}` | `npm run build -w web` emits `apps/web/out/` |
| 2 | i18n dictionaries + provider + toggle | `app/i18n/dictionaries.ts`, `app/i18n/LanguageProvider.tsx`, `app/components/LanguageToggle.tsx` | EN/TA key sets identical (tested); toggle persists to `localStorage` |
| 3 | Root layout + Disclosure Footer | `app/layout.tsx`, `app/components/DisclosureFooter.tsx` | Verbatim EN/TA disclosure text rendered on every page |
| 4 | API client | `app/lib/api.ts` | `submitReport` body has exactly 4 allowed keys; `400 { errors }` parsed into typed `ApiError` |
| 5 | Report flow steps | `app/components/report/{StartStep,PhotoStep,LocationStep,CategoryStep,SubmitStep}.tsx`, `app/page.tsx` | Full flow drives Start → Photo → Location → Category → Submit → Success |
| 6 | Tests | `app/**/*.test.{ts,tsx}` | 27/27 green (Vitest + Testing Library) |
| 7 | Docs | `apps/web/README.md`, this file | markdownlint clean |

## 4. Key decisions

- **Next 15 + React 19, not Next 16:** spec explicitly calls for Next.js 15; pinned to the latest 15.x (`15.5.19`) for security patches while staying on the requested major.
- **`next/image` with `unoptimized`:** used instead of bare `<img>` to satisfy `next/core-web-vitals` lint cleanly; harmless under static export since `images.unoptimized: true` disables the optimization server anyway.
- **Photo upload is synchronous with selection:** `PhotoStep` calls `getPresignedUrl` + `PUT`s to S3 as soon as a file is chosen (not deferred to the final Submit step), so the user sees upload errors immediately and `SubmitStep` only needs the already-issued `photoKey`.
- **`localStorage`-only language persistence:** no cookies, no analytics — matches the anonymous-by-design constraint (HARD RULE 1) even though language preference is not PII.
- **Out-of-boundary success path:** `SubmitStep` renders `result.city` / `result.zone ?? <bilingual "zone not available">` unconditionally as success UI — there is no separate "degraded" state, by design (HARD RULE 5).

## 5. Test plan (executed)

- **Unit:** `dictionaries.test.ts` — EN/TA key parity, no empty strings, verbatim disclosure text. `api.test.ts` — exact method/URL/headers/body per function; `submitReport` body key-set assertion; `400 { errors }` parsing.
- **Component:** `PhotoStep`, `LocationStep`, `CategoryStep`, `DisclosureFooter` each rendered in both languages, asserting bilingual strings and disabled-until-valid button states.
- **Integration:** `page.test.tsx` drives the full flow with mocked `fetch` and mocked `navigator.geolocation.getCurrentPosition`, asserting:
  - an in-city `201` (`city: "Chennai"`, real `zone`) renders the success screen;
  - an out-of-boundary `201` (`city: "Other TN Region"`, `zone: null`) **also** renders the success screen, with the bilingual "zone not available" string, and never the error UI;
  - the disclosure footer text is present on the success screen.

**Result:** 8 test files, 27/27 tests passing.

## 6. Definition of Done

- [x] `apps/web` scaffolded with Next.js 15 App Router, Tailwind, static export.
- [x] EN/TA dictionaries with compiler-enforced key parity; language toggle persists via `localStorage`.
- [x] Disclosure Footer (verbatim EN/TA) rendered in the root layout on every view.
- [x] Start screen (tagline + Primary CTA) → 4-step flow (Photo → Location → Category → Submit) implemented and wired to `services/submit`'s exact contract.
- [x] `submitReport` request body contains only the 4 allowed fields — verified against `services/submit/src/validate.ts`.
- [x] Out-of-boundary (`Other TN Region` / `zone: null`) renders as success, never error — covered by an explicit test.
- [x] `npm run lint && npm run typecheck && npm run test && npm run build` green across all workspaces (web, submit-service, db).
- [x] `apps/web/out/` produced by static export.
- [x] No secrets/PII committed (HARD RULE 1); no real infra touched (HARD RULE 2).

## 7. Residual risk / not verifiable in this environment

- Camera capture (`capture="environment"`) and live `navigator.geolocation` behavior can only be exercised on a real mobile device/browser — tests mock both.
- No live backend was exercised end-to-end (no deployed API Gateway URL); the contract was verified by re-reading `services/submit/src/validate.ts` and asserting the exact request shape in `api.test.ts`.
- Visual/responsive rendering on physical small screens was not manually checked — Tailwind utility classes were chosen for large tap targets per the PRD's one-handed-use requirement, but should be eyeballed on a device before launch.
