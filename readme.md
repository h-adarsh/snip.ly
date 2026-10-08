# Snip.ly

A full-stack URL shortener with authentication, link analytics, dark mode, and link preview cards. Deployed with Cloudflare Pages (frontend) + Workers + D1.

## What This Project Includes
- Auth with JWT, password strength validation, and secure hashing.
- Short link creation, copy, delete, and click tracking.
- Link preview cards (title, description, image).
- Dark/light mode toggle with persistence.
- Cloudflare Worker API backed by D1.

## Cloudflare Deployment
**Worker (backend)**
- Uses `backend/worker.js` and `backend/schema.sql` with D1.
- Deployed via Wrangler.

**Pages (frontend)**
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

**Pages env vars**
- `VITE_API_BASE=https://<your-worker>.workers.dev/api`
- `VITE_SHORT_DOMAIN=https://<your-worker>.workers.dev`

## Local Development
**Backend (Cloudflare Worker + D1)**
```bash
cd backend
npm install
npm run worker:dev
```

Wrangler uses the D1 binding in `backend/wrangler.toml`. Configure the Worker
secret before testing authentication:

```bash
npx wrangler secret put JWT_SECRET
```

The Worker expects the frontend origin in `CORS_ORIGIN`. Use
`http://localhost:5173` for local development and set the deployed Pages
origin when deploying.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:3000`.
To use the local Worker instead, set `VITE_API_BASE` to the URL printed by
Wrangler, followed by `/api`.

**Legacy Express + MongoDB backend**

The repository also contains an Express/MongoDB implementation for legacy
deployments. It is not the backend used by the Cloudflare deployment. Set
`MONGO_URI`, `JWT_SECRET`, and optionally `PORT` and `SHORT_DOMAIN`, then run:

```bash
cd backend
npm run dev
```
