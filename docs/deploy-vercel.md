# Deploying the Foodcheck Frontend to Vercel

This project is a monorepo with the React frontend in `client/` (built by Vite) and the backend in `server/`. These instructions cover deploying the frontend only to Vercel.

## Overview
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Production env var: `VITE_API_BASE` (e.g., `https://food-safety-backend.onrender.com`)

Vercel will build the app from the `client/` directory using `@vercel/static-build` and serve the static output from `dist`.

## One-time Vercel Project Setup
1. Create a new Vercel project and connect it to this GitHub repository.
2. In Project Settings → General:
   - Framework Preset: Vite (auto-detected)
   - Root Directory: `client`
3. In Project Settings → Build & Development Settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. In Project Settings → Environment Variables (Production):
   - Add `VITE_API_BASE` with the full base URL of your backend, e.g. `https://food-safety-backend.onrender.com`.

Notes:
- If `VITE_API_BASE` is not set, the production build will call `/api/query` relative to the frontend origin, which will fail unless your backend is hosted on the same origin under `/api`.
- For local development, the Vite dev server proxies `/api` to `http://localhost:3001` (see `client/vite.config.js`).

## Continuous Deployment
- Every push to `main` will trigger a deployment. The repo includes `vercel.json` that points Vercel to build from `client/` and serve `dist/`.

## Optional Backend CORS Hardening
- By default (when `CORS_ORIGIN` is unset), the backend allows all origins. To restrict it, set `CORS_ORIGIN` on your backend host (e.g., Render) to your Vercel domain, e.g. `https://your-project.vercel.app`.

## Smoke Test Checklist
1. After deploy, open the Vercel URL.
2. Enter a question and submit.
3. Verify requests are sent to `${VITE_API_BASE}/api/query` and a JSON response is returned.
4. If you see CORS or network errors:
   - Confirm `VITE_API_BASE` is set correctly in Vercel (Production) and redeploy.
   - If using strict CORS on the backend, confirm your Vercel domain is allowed.

## Rollback/Retry
- Use Vercel → Deployments to promote a previous successful deployment or trigger a redeploy of the latest commit.
