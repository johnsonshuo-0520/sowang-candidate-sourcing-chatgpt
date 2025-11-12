# Candidate Sourcing (Local Mock + UI)

This starter lets you build a **LinkedIn‑style** candidate sourcing experience locally—no real MCP server or ChatGPT app required yet.

## Projects
- `mock-mcp/` — Express + TypeScript mock of the MCP tools: `create_job`, `source_candidates`
- `sdk/` — Thin TypeScript client used by the UI (and re‑usable for ChatGPT native app later)
- `app/` — Vite + React + TypeScript UI (LinkedIn‑like cards, no PII)
- `schemas/` — JSON Schemas for contracts (and `openapi.yaml` at repo root)

## Quickstart
Requirements: Node 18+

### 1) Install deps
```bash
cd mock-mcp && npm i && cd ../sdk && npm i && cd ../app && npm i
```

### 2) Run the mock MCP
```bash
cd mock-mcp
npm run dev
# server on http://localhost:3001
```

### 3) Run the UI
In a new terminal:
```bash
cd app
# set the MCP base URL if needed (defaults to http://localhost:3001)
echo "VITE_MCP_BASE_URL=http://localhost:3001" > .env.local
npm run dev
# open http://localhost:5173
```

## Contracts
- **No PII** returns in `source_candidates`. Only masked alias (`name` like `candidate_123`), `candidate_id`, `title`, `company`, `location`, `qualifications`.
- `job_id` is a **string** (safe round‑trip, can be UUID or stringified numeric).

## Swap in real MCP later
- Change `VITE_MCP_BASE_URL` in `app/.env.local` (and `sdk` if used server‑side).
- If the real MCP’s shapes differ, add an adapter in `sdk/adapter.ts`.
