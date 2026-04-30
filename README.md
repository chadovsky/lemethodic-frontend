# LeMethodic

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_3DyaZQpS34B7WwC4zWaeaMhrHrdS)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Backend / API

This frontend talks to the FluentPath FastAPI backend (`tcf-oral-tool`, separate repo). The API base URL is read from `NEXT_PUBLIC_API_URL` — see `.env.example`. For local dev, copy it to `.env.local`:

```bash
cp .env.example .env.local
# then edit so NEXT_PUBLIC_API_URL=http://localhost:8000
```

### CORS — backend must allow the dev origin

Because the frontend runs on `http://localhost:3000` and the backend on `http://localhost:8000`, browsers block the cross-origin requests unless FastAPI explicitly permits them. The backend needs `CORSMiddleware` configured with:

- `allow_origins=["http://localhost:3000"]` (add the production origin later)
- `allow_methods=["*"]`, `allow_headers=["*"]`

Auth is JWT-only: the frontend injects `Authorization: Bearer <token>` from localStorage, so `allow_credentials` is not required.

If you see `CORS error` / `No 'Access-Control-Allow-Origin'` in the browser console, that's the fix — land it on the backend repo, not here.

## Deferred features

- **Test-drive recording screen** (free diagnostic before paywall) — deferred to post-launch Phase 2 for conversion-optimization A/B testing. The `/test-drive` route has been removed; the onboarding funnel now routes step 6 (`EcoleReveal`) directly to `/paywall`.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
