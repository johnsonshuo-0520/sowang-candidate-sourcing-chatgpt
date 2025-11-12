import express, { type Request, type Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { randomUUID } from "crypto";
import { auth } from "./auth.js"; // note the .js

const app = express();
app.use(helmet());
app.use(express.json({ limit: "200kb" }));
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

// Require bearer token for all routes
// Allow token via ?key=... query param
app.use((req, res, next) => {
  const token =
      (req.query.key as string) ||
      (req.headers.authorization?.replace("Bearer ", "") ?? "");

  if (token === process.env.MCP_AUTH_TOKEN) return next();
  if (req.path === "/health") return res.json({ ok: true });
  res.status(401).json({ error: "Unauthorized" });
});
app.use(auth(true));

// Health
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// Tools
app.post("/tools/create_job", (req: Request, res: Response) => {
  const { title, location, company, description } = (req.body ?? {}) as {
    title?: string; location?: string; company?: string; description?: string;
  };
  if (!title || !location || !company || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  return res.json({ job_id: randomUUID() });
});

app.post("/tools/source_candidates", (req: Request, res: Response) => {
  const { job_id } = (req.body ?? {}) as { job_id?: string };
  if (!job_id) return res.status(400).json({ error: "job_id required" });

  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  const titles = ["Senior Backend Engineer","Staff Data Engineer","Principal Backend"];
  const companies = ["Acme Systems","DataWorks.io","Nimbus"];
  const locs = ["Mountain View, CA, US","San Francisco, CA, US","Berlin, DE"];

  const mk = (i: number) => ({
    candidate_id: `cand_${i}_${job_id.slice(0,8)}`,
    name: `candidate_${i}`,
    company: pick(companies),
    title: pick(titles),
    location: pick(locs),
    qualifications: [
      "Java/Scala, Kafka, Pinot/Trino",
      "Nearline dedupe & SLA monitors",
      "Experience with candidate ranking"
    ]
  });

  res.json({ candidates: [mk(1), mk(2), mk(3), mk(4), mk(5), mk(6)] });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`MCP shim on http://localhost:${PORT}`));