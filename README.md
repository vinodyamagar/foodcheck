# Packaged Food Safety Advisor (MVP)

Minimal full-stack app for Indian parents to ask natural-language questions about packaged foods and get grounded guidance.

- Backend: Node.js (Express). Retrieves relevant facts from a small built-in knowledge base and generates a readable answer using a local GPT-2 model via transformers.js (optional). English only.
- Frontend: React (Vite). Single page with input and results.

## Quickstart

Prereqs: Node.js 18+ (includes `fetch`). First model run will download weights (if you enable local model).

### Backend

```
cd server
npm ci
npm test
npm start
```

Environment variables:
- MODEL_ID (default `Xenova/distilgpt2`)
- PORT (default `3001`)
- TRANSFORMERS_CACHE (optional path for model cache)
- USE_HF_INFERENCE=1 and HUGGINGFACE_API_TOKEN (optional HuggingFace Inference API fallback)

Note: For CI/tests we stub the model. The server attempts to load `@xenova/transformers` only at runtime. Install it if you want local inference:

```
npm install @xenova/transformers@latest
```

### Frontend

```
cd client
npm ci
npm run dev
```

The dev server proxies `/api` to the backend on port 3001.

Build:

```
npm run build
```

### Manual smoke test

- Start backend: `npm start` in `server/`.
- Start frontend: `npm run dev` in `client/`.
- Try queries like:
  - "Is instant noodles safe for my 5-year-old?"
  - "What about drinks with sodium benzoate and artificial colours?"

## Deployment (Frontend on Vercel)

See docs/deploy-vercel.md for step-by-step instructions to deploy the React frontend to Vercel from the main branch (Root Directory=client, Build Command=npm run build, Output Directory=dist, and the VITE_API_BASE environment variable).

## Scope and Safety

- GPT-2 is not instruction-tuned and may hallucinate; we mitigate by grounding with retrieved facts and listing sources. Recommendations are derived from the knowledge base.
- English only. No accounts/auth.
- This is general information, not medical advice.
