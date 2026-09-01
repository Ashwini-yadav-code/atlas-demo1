# Atlas — the real app

This is the actual Next.js application, replacing the static prototype in
the repo root (`../*.html`) per `CLAUDE.md`'s build order. Everything here
is real: a real database, real auth, a real matching engine, real
server-enforced stage-unlock rules — not mock JS objects in a `<script>`
tag. The static prototype stays in the repo as the design reference; this
is what actually runs.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Prisma 7 · NextAuth
(Auth.js) v5 · SQLite for local dev, Postgres-ready.

## Getting it running

```bash
npm install
cp .env.example .env.local  # then edit AUTH_SECRET to a real random value
npx prisma migrate dev      # creates dev.db and applies the schema
npx tsx prisma/seed.ts      # populates the same data the static prototype used
npm run dev                 # http://localhost:3000
```

Two accounts are seeded and ready to sign in with (OTP flow — see below):

- **`harman.sidhu@email.com`** — the full demo student. Same shortlist,
  applications, advisors, tasks and messages as the static prototype
  (University of Manchester 96% match / offer accepted, UCL 91% /
  awaiting, Leeds 84% / shortlisted; Priya S. and James O. as advisors
  with real seeded conversations).
- **`admin@atlas.dev`** — role `ADMIN`, lands at `/admin`.

Sign up with any other email to go through the real onboarding quiz and
matching engine from a blank profile.

## What's real here (vs. the static prototype)

Every item in `atlas-build-checklist.md` §1 (screens) has a real,
server-rendered, database-backed page: `/`, `/journey`, `/services[/:cat]`,
`/universities[/:courseId]`, `/community[/:type[/:id]]`, `/checklist`,
`/calendar`, `/messages`, `/profile`, `/onboarding`, `/auth`, `/admin/*`.

- **Auth** (§3) — real OTP sign-in backed by a database-stored,
  time-limited code (`src/lib/otp.ts`), NextAuth JWT sessions,
  `middleware`-free route protection via `requireUser()` /
  `requireAdmin()` in `src/lib/session.ts` (every `(app)` page and every
  `/admin` page calls one of these — there's no page that trusts the
  client).
- **Matching engine** (§3) — `src/lib/matching.ts` scores every course in
  the catalogue against a student's budget, grades and course interest;
  the onboarding quiz calls it live and creates real `Application` rows
  for the top 3. Re-visiting `/universities` re-scores the entire
  catalogue against the current profile, so editing your profile changes
  your matches.
- **Stage engine** (§3) — `src/lib/stage.ts` computes which
  `JourneyStage`s are unlocked from real `Application`/`Task` state (an
  application must be `ACCEPTED` before `VISA_DOCS` unlocks; every
  `VISA_DOCS` task must be `done` before `PRE_DEPARTURE` unlocks). Every
  server action that touches a gated stage calls
  `assertStageUnlocked()` first — this is enforced in `src/lib/actions.ts`,
  not hidden behind a disabled button. Verified in testing: hitting a
  locked-stage mutation directly (bypassing the UI) is rejected
  server-side.
- **Admin tooling** (§4) — `/admin` is role-gated (`requireAdmin()`, not
  just an unlinked route): a catalogue editor that adds real `Course`
  rows the student app immediately reflects, a service-partner
  priority/removal tool, a community-content publish/draft toggle, an
  advisor console showing real assigned students and their outstanding
  task counts, and a dashboard of real counts (including an actual
  onboarding-drop-off percentage).
- **Search** (§3) — `/api/search` queries the real `Course`/
  `ServicePartner`/`CommunityContent` tables, not a hardcoded array.

## What still isn't real, and can't be made real by writing more code

Flagged explicitly rather than silently shipped as if finished:

- **Email/SMS delivery.** `src/lib/otp.ts` generates and stores a real,
  time-limited, single-use code — but there's no provider wired in to
  send it anywhere. In development the code is logged to the server
  console and returned in the API response (visible on the sign-in
  screen itself, clearly labeled "dev mode"). Wiring a real provider
  (Resend, Postmark, Twilio) is one function (`requestOtp`) plus API
  credentials neither of which exist in this environment — do that
  before this ships, and delete the `devCode` response field when you do.
- **Postgres.** This runs on SQLite because there's no Postgres or Docker
  in this sandbox. The schema is provider-agnostic; switching is:
  `npm install @prisma/adapter-pg`, change `provider = "postgresql"` in
  `prisma/schema.prisma`, swap the adapter in `src/lib/prisma.ts` for
  `new PrismaPg({ connectionString: ... })`, point `DATABASE_URL` at a
  real instance, `prisma migrate deploy`.
- **Real catalogue/partner/content data.** Every University, Course,
  ServicePartner and CommunityContent row is the same representative
  seed data the static prototype used. There's no version of "real
  curated UK course data" or "real vetted service partner agreements"
  that code can produce — that's checklist §5, a content/business task,
  not an engineering one.
- **Legal pages** (§6) — no privacy policy, terms, or the "who pays whom"
  transparency page exist. Drafting real ones (DPDPA + UK data
  considerations, as the checklist itself calls out) needs actual legal
  review, not template text presented as done.
- **Hosting/infra** (§7) — no domain, no production database, no error
  monitoring, no backups, no deployed environment. All of that needs
  accounts and credentials that are yours to create, not mine to assume.
- **Google OAuth** — the checklist mentions it as a "maybe." The
  `Account`/`Session` Prisma models are already shaped for it; adding the
  provider to `src/auth.ts` is small, but needs real OAuth client
  credentials from a Google Cloud project.

## Notable implementation choices

- **Styling is the actual design system, not a Tailwind reimplementation.**
  `src/app/*.css` are the same files from `../shared/` (copied, not
  symlinked — see the note at the top of `globals.css`), so every class
  name (`.card`, `.focus-card`, `.stepper`, `.drawer`, …) is pixel-identical
  to the reviewed static prototype. Tailwind is configured to the same
  color/radius/font tokens (`@theme inline` in `globals.css`) for any new
  component code, but a full hand-port to Tailwind utilities was judged
  not worth the fidelity risk.
- **No GSAP.** The static prototype's boot loader, cursor spotlight, and
  tilt/ripple theatrics were explicitly presentation framing for a design
  demo (`atlas-ux-spec.md` §1 says as much about the bezel/URL bar, and
  §2 of the checklist separately calls out swapping the animation for
  something lighter once real data is on screen). This app uses plain
  CSS transitions instead — one fewer dependency, no fake fixed-duration
  loading state on top of real network/DB latency.
- **Mobile nav** (`atlas-ux-spec.md` §4) is ported into
  `src/app/atlas-mobile-nav.css` — the same pattern built for the static
  prototype (bottom tab bar, sidebar collapses into an account menu,
  Journey's board becomes swipeable single-column tabs), adapted for
  `<Link>`-based routing instead of the prototype's `<button>` tab
  switcher.

## Testing this was actually run, not just written

Every flow above was driven end-to-end with a real headless-Chromium
session (Playwright) during development, not just read back: sign-up →
OTP → onboarding → live-scored shortlist; every page's real data
rendering; task-toggle persistence; stage-lock enforcement server-side;
admin CRUD reflecting into the student-facing app; role-based access
denial; sign-out actually clearing the session and re-locking every
route. Two real bugs were caught and fixed this way — a hydration
mismatch in the drawer portal, and a raw 500 on a unique-constraint
violation in profile save — that static review would not have surfaced.
