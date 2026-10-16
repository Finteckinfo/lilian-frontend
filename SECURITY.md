# Security — Being Lillian Frontend

## Scope

This package is a **public web client**. It must never hold privileged credentials.

## Allowed in the browser

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_INSTAGRAM_URL`
- Admin **access token** in `localStorage` after login (treat as session secret; clear on logout)

## Forbidden in this package

- `SUPABASE_SERVICE_ROLE_KEY` / database passwords
- `AUTH_JWT_SECRET` / signing keys
- Hard-coded production WhatsApp numbers in source (use env)

## Auth flow

1. User signs up once at `/admin/signup` (or signs in at `/admin/login`).
2. API returns a JWT; frontend stores it as `admin_token`.
3. `/admin` calls `/v1/auth/me` and `/v1/admin/*` with `Authorization: Bearer …`.
4. Sign out removes the token and returns to login.

## Reporting

If you discover a vulnerability, contact the repository owner privately. Do not open a public issue with exploit details.
