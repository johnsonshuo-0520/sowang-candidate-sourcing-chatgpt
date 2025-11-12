// mcp-shim/src/server.ts
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { randomUUID } from "crypto";

const app = express();
app.use(helmet());
app.use(express.json({ limit: "200kb" }));
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

// -----------------------------------------------------------------------------
// ✅ Option B: allow auth via ?key=<TOKEN> query param (for ChatGPT connectors)
// -----------------------------------------------------------------------------
app.use((req, res, next) => {
  // Make /health and /app public
  if (req.path === "/health" || req.path.startsWith("/app")) return next();

  const queryKey = (req.query.key as string) || "";
  const expected = process.env.MCP_AUTH_TOKEN || "";

  if (queryKey && expected && queryKey === expected) return next();

  return res.status(401).json({ error: "Unauthorized" });
});

// -----------------------------------------------------------------------------
// ✅ Routes
// -----------------------------------------------------------------------------

// Health endpoint (always public)
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// Create Job endpoint
app.post("/tools/create_job", (req: Request, res: Response) => {
  const { title, location, company, description } = (req.body ?? {}) as {
    title?: string;
    location?: string;
    company?: string;
    description?: string;
  };

  if (!title || !location || !company || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  return res.json({ job_id: randomUUID() });
});

// Source Candidates endpoint
app.post("/tools/source_candidates", (req: Request, res: Response) => {
  const { job_id } = (req.body ?? {}) as { job_id?: string };
  if (!job_id) return res.status(400).json({ error: "job_id required" });

  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  const titles = ["Senior Backend Engineer", "Staff Data Engineer", "Principal Backend"];
  const companies = ["Acme Systems", "DataWorks.io", "Nimbus"];
  const locs = ["Mountain View, CA, US", "San Francisco, CA, US", "Berlin, DE"];

  const mk = (i: number) => ({
    candidate_id: `cand_${i}_${job_id.slice(0, 8)}`,
    name: `candidate_${i}`,
    company: pick(companies),
    title: pick(titles),
    location: pick(locs),
    qualifications: [
      "Java/Scala, Kafka, Pinot/Trino",
      "Nearline dedupe & SLA monitors",
      "Experience with LinkedIn-style candidate ranking"
    ]
  });

  res.json({ candidates: [mk(1), mk(2), mk(3), mk(4), mk(5)] });
});

// -----------------------------------------------------------------------------
// ✅ Start server
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Mock MCP running on port ${PORT}`);
  console.log(`Auth key prefix: ${(process.env.MCP_AUTH_TOKEN || "").slice(0, 6)}...`);
});