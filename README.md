# Hotel Sapphire — Next.js

A Next.js (App Router) port of the Angular Hotel Sapphire site that lives one folder up. The two apps are
deliberately independent (separate `package.json`, lockfile and assets) so their performance can be compared fairly.

- **Visuals:** a faithful 1:1 port. `next/image` and `next/font` replace the Angular lazy images and render-blocking
  Google Fonts import; Font Awesome is replaced by `lucide-react` plus four inline brand SVGs (no icon webfont).
- **Rendering:** every page is static (SSG / hourly ISR) and served from the CDN. Client JavaScript is limited to the
  interactive islands (header menu, booking bar and modal, calendar, guests picker, ticker, gallery filter, contact form).
- **Stack:** Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, Zod 4, Vitest + Testing Library, Playwright
  (+ axe-core), ESLint + Prettier, pnpm.

## Setup

```bash
pnpm install
cp .env.example .env.local   # then edit; see "Environment variables"
pnpm dev                     # http://localhost:3000
```

Requires Node 22+ and pnpm. If pnpm reports "Ignored build scripts: unrs-resolver", that is harmless
(an optional native speed-up for the ESLint import resolver).

## Scripts

| Script           | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| `pnpm dev`       | Dev server                                               |
| `pnpm build`     | Production build                                         |
| `pnpm start`     | Serve the production build                               |
| `pnpm lint`      | ESLint, zero warnings allowed                            |
| `pnpm typecheck` | `tsc --noEmit` (strict)                                  |
| `pnpm test`      | Unit and component tests (Vitest)                        |
| `pnpm test:e2e`  | Playwright against `next start` (run `pnpm build` first) |
| `pnpm format`    | Prettier write (`format:check` to verify)                |

The e2e suite runs on the **production build** on port 3100 and stubs Cloudflare Turnstile and the mail API, so it needs
no network or real secrets.

## Environment variables

Validated with Zod: public values in `lib/env.ts`, secrets in `lib/env.server.ts` (importing it from client code fails
the build). See `.env.example`.

| Variable                                                     | Scope  | Purpose                                                                  |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`                                       | public | Canonical URLs, Open Graph, sitemap, robots                              |
| `NEXT_PUBLIC_BOOKING_HOTEL_ID` / `_STYLE_ID` / `_DC_ID`      | public | TravelBook booking-engine identifiers (same values the Angular app uses) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                             | public | Cloudflare Turnstile widget key                                          |
| `RESEND_API_KEY`                                             | secret | Sends contact-form mail                                                  |
| `CONTACT_TO_EMAIL`                                           | secret | Inbox that receives contact messages                                     |
| `CONTACT_FROM_EMAIL`                                         | secret | Sender; must be on a domain verified in Resend                           |
| `TURNSTILE_SECRET_KEY`                                       | secret | Server-side Turnstile verification                                       |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` (optional, set together) | secret | Shared rate-limit store. Without it an in-memory limiter is used         |

The `.env.example` Turnstile values are Cloudflare's published always-pass **test** keys. Use real keys in production.

## Architecture

```
app/                 Routes only: thin pages that compose components and call lib/
  api/contact/       POST route handler (Node runtime, never cached)
  rooms/[slug]/      SSG via generateStaticParams, dynamicParams = false (unknown slug → 404)
  not-found · error · global-error · sitemap · robots
components/
  layout/            Header (+ mobile menu), footer, WhatsApp button
  booking/           BookingProvider, BookingBar, MobileBookingModal, Calendar, GuestsPicker, DateField
  home/ rooms/ gallery/ contact/   Feature components
  ui/                Primitives (headings, marquee, status page, brand icons)
lib/
  booking-rules.ts   The single source of truth for booking limits (nights, rooms, adults, children, time zone)
  booking.ts         Pure URL builder + validation, used on the server and the client
  dates.ts           Plain "YYYY-MM-DD" date helpers; "today" is evaluated in Africa/Nairobi
  data/              Static typed content behind getRooms()/getRoom() so a CMS swap is a data-layer change
  schemas/           Zod schemas (contact, booking, rooms, content)
  contact/           Rate limiter, Turnstile check, Resend client, request handler (all dependency-injected)
tests/  e2e/         Vitest/RTL and Playwright
```

### Booking

There is no booking backend: "Book Now" opens the external TravelBook engine in a new tab. The link is built on the
server for every page (works without JavaScript) and rebuilt on the client as the visitor changes dates or guests.
Rules enforced in the UI and validated again by `lib/booking.ts`: check-out strictly after check-in, check-in not in the
past (hotel time), max 30 nights, 1–5 rooms, 1–10 adults, 0–6 children.

### Contact form

`POST /api/contact` runs, in order: per-IP rate limit → body size cap (16 KB) → Zod validation → honeypot → Turnstile →
Resend. Replies keep the Angular `{ success, message }` shape. Visitor-supplied values are HTML-escaped in the email,
single-line fields reject line breaks (header injection), and errors are generic to the client with detail in the server
log. A tripped honeypot gets a fake success so bots learn nothing. A limiter outage fails open; a Turnstile outage fails
closed.

## Deployment (Firebase App Hosting)

The app needs a Node runtime (contact route, hourly ISR), so it runs on **Firebase App Hosting** (Cloud Run), which
requires the Blaze plan. Static Firebase Hosting cannot run it, and `output: 'export'` is not an option.

1. `firebase login` with the account that owns the project; `.firebaserc` points at `hotelsapphire-next`.
2. Create the secrets in Secret Manager (values are never committed):
   `firebase apphosting:secrets:set RESEND_API_KEY` (also `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`,
   `TURNSTILE_SECRET_KEY`), granting the backend access when prompted.
3. Edit `apphosting.yaml`: set `NEXT_PUBLIC_SITE_URL` and the real `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   (the committed one is Cloudflare's always-pass test key).
4. Create the backend (`firebase apphosting:backends:create --project hotelsapphire-next`, backend id
   `hotel-sapphire-next`), connect this GitHub repo and choose the live branch. Each push to it rolls out a new version.
5. Optional: add Upstash Redis and uncomment the two `UPSTASH_*` entries for rate limiting shared across instances.

## Deliberate differences from the Angular app

- **Unknown routes are real 404s**, including `/rooms/<unknown>` (Angular silently showed the Deluxe Room).
- **Hourly ISR** instead of pure SSG, so the server-built "Book Now" link never carries a stale date.
- **Turnstile loads only on `/contact`.** That is extra third-party JavaScript the Angular app does not have; keep it in
  mind when comparing contact-page numbers.
- **Accessibility fixes:** pause/play on the auto-scrolling ticker (WCAG 2.2.2), reduced-motion support, a keyboard
  accessible calendar and guests picker, a skip link, and small grey text slightly brighter for contrast. The white-on-gold
  and white-on-green buttons keep the original colours (a known contrast gap of about 2.8:1 and 2.2:1, excluded from the
  axe test), as fidelity to the old design was preferred.
- **Font weights are clamped to 300-700** (`app/globals.css`) to match the Angular app, which loaded its fonts at those
  weights only; without this, `font-thin` renders as a true hairline.
- **Guests control** is now real (the original was a dead text field) and the default summary reads "1 Room, 2 Guests",
  matching what the booking URL always sent.
- **Rooms Previous/Next** on the detail page step through the rooms (they did nothing before). The slider arrows on the
  rooms and events pages stay decorative, as there is no slider behind them.
- **Calendar** opens on the selected month and stops at the selectable range.
- **Prices** are shown as `Ksh 11,900` (Intl `en-KE`), not `KSh 11,900`.

Known quirks carried over 1:1: the "Book Your Room" card and the promo-code fields on the home page are not connected
to anything, and the Standard Room has a detail page but is not on the rooms list.

## Security notes

Baseline headers (nosniff, frame deny, referrer policy, HSTS, permissions policy) are set for every route in
`next.config.ts`. There is no Content-Security-Policy yet: Next's inline bootstrap scripts need per-request nonces, which
would force dynamic rendering and defeat the static delivery this port is meant to measure.
