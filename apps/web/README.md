# web — Next.js report flow frontend

Mobile-first, static-export Next.js (App Router) frontend implementing
Therumunai's anonymous civic issue report flow: a Start screen (tagline +
"Report an Issue" / "குறையைப் பதிவிடு" CTA) followed by 4 steps — Photo →
Location → Category → Submit — with full EN/தமிழ் i18n (PRD §4.3, §6).

## Layout

```text
app/
  i18n/         Dictionary type + en/ta translations, LanguageProvider
  components/   DisclosureFooter, LanguageToggle, report/ (step components)
  lib/api.ts    Pure fetch client for services/submit (presign, upload, submit)
  page.tsx      Orchestrates the 4-step flow state
  layout.tsx    Root layout — header, LanguageProvider, DisclosureFooter
```

## Local development

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL to your API Gateway URL
npm run dev -w web
```

`NEXT_PUBLIC_API_BASE_URL` must point at the deployed `services/submit` API
Gateway stage. See `.env.example` for details.

## Build (static export)

```bash
npm run build -w web
```

Produces static files in `apps/web/out/` for S3 + CloudFront or Amplify
hosting (`output: "export"` in `next.config.mjs`).

## Tests

```bash
npm run test -w web
```

Runs Vitest + Testing Library (jsdom) — i18n dictionary parity, the API
client's request shapes, and the full Photo → Location → Category → Submit
flow (including the out-of-boundary "Other TN Region" success case, HARD
RULE 5).

## Hard rules in play

- **Disclosure Footer** (HARD RULE 3) renders verbatim EN/தமிழ் text on every
  view via the root layout.
- **Bilingual strings** (HARD RULE 4): `app/i18n/dictionaries.ts`'s
  `Dictionary` type is implemented by both `en` and `ta`, so a missing
  translation fails to compile.
- **Out-of-boundary fallback** (HARD RULE 5): a `201` response with
  `city: "Other TN Region"` and `zone: null` renders as a normal success
  screen, never an error.
- **No PII**: language preference is the only client-persisted value, stored
  in `localStorage` only — no cookies, no analytics.
