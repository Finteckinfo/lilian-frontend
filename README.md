# Being Lillian — Frontend

Next.js App Router site for **Being Lillian**: Soft Luxe marketing pages, journal, portfolio gallery, booking form, and authenticated studio admin.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3 (class `dark` mode)
- Talks only to the FastAPI backend via `NEXT_PUBLIC_API_URL`

## Requirements

- Node.js 20+ (22 LTS recommended)
- Running Being Lillian API (see sibling `lilian-backend`)

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run start -- -p 3000
```

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | API base URL (e.g. `https://api.example.com`) |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Yes (prod) | Digits only, country code included |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Optional | Defaults to studio Instagram |

Copy from `.env.example`. **Never commit** `.env.local`.

## Routes

| Path | Access | Purpose |
|------|--------|---------|
| `/` | Public | Soft Luxe home |
| `/portfolio` | Public | Media gallery |
| `/journal`, `/journal/[slug]` | Public | Archives + article |
| `/book` | Public | Lead form → `POST /v1/leads` |
| `/admin/signup` | Public when signup open | First admin bootstrap |
| `/admin/login` | Public | Studio sign-in |
| `/admin` | JWT required | Monitor, CRM, journal/gallery editors, appearance |

Admin has no header/footer marketing chrome. Unauthenticated `/admin` redirects to login.

## Architecture

```
app/                 App Router pages + layout
components/          UI (header, gallery, admin tabs, forms)
lib/                 API client, content mappers, seed fallback, auth helpers
public/              Logos + media assets
```

- Server components fetch posts/portfolio from the API with a short timeout; seed data is used if the API is unreachable (build/dev resilience).
- Client admin modules send `Authorization: Bearer <access_token>` from `localStorage`.
- Theme tokens live in CSS variables (`globals.css` + Tailwind); light/dark share one Soft Luxe hue family.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build + typecheck/lint |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Security expectations

See [SECURITY.md](./SECURITY.md). Summary:

- No Supabase service role or database credentials in this package.
- Admin JWT is issued by the API; the frontend only stores and attaches it.
- WhatsApp deep links are client-side convenience; leads must still be stored via the API.

## Related

- Backend README: `../../backend/lilian-backend/README.md` (from this path: sibling under workspace)
- Design archive: `../../resources/`
