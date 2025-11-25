# orbis
Orbis

Orbis is a playful, modern learning app MVP designed as a daily coding mentor. It delivers a smooth UI, clean build pipeline, and Vercel-ready deployment flow so you can focus on features (like AI coaching) without build headaches.

✨ Features (MVP)

Next.js App Router structure

Tailwind + shadcn/ui components

Dark/light mode toggle

Collapsible right-rail “Coach” panel

Responsive layout + icons with lucide-react

TypeScript-first DX

🧰 Tech Stack

Framework: Next.js (App Router)

Styling: Tailwind CSS + shadcn/ui

Icons: lucide-react

Language: TypeScript

Linting & Formatting: ESLint + Prettier

🚀 Deployment

Deployed on Vercel. The `app` router powers both the marketing landing (`/page.tsx`) and the Orbis workspace (`/app/page.tsx`), so the default Vercel entrypoint can stay marketing-focused while `/app` hosts the interactive experience.

Required environment variables (Vercel → Project Settings → Environment Variables):

- `GOOGLE_API_KEY` or `GEMINI_API_KEY` (server-only)
- Optional: `GEMINI_MODEL` or `GOOGLE_GEMINI_MODEL` (defaults to `gemini-2.5-flash`)

Notes:
- `/api/gemini/*` returns `{ ok: false, error }` + `requestId` when keys are missing, so monitoring can spot misconfigurations quickly.
- `/api/health/ai` reports `{ ok, model, keyConfigured }` for automated checks.
- `/ok` remains a lightweight health (returns `{ ok: true }`).
- CSP/security headers are configured in `next.config.js`; the worker for the in-browser code runner runs from `public/` with `worker-src 'self' blob:` so the main page never needs `unsafe-eval`.
- Deploy previews can skip API keys; the UI falls back to deterministic local templates (see `lib/ai.ts`).
