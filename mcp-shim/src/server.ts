// mcp-shim/src/server.ts
import express, { type Request, type Response, type NextFunction } from "express";
import { randomUUID } from "crypto";

const app = express();

// tiny request logger (helps you see if the connector hits your server)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(express.json({ limit: "200kb" }));

// ---- Public root & health (as light as possible)
app.get("/", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true, name: "sowang-mcp-shim", version: "1.0" });
});
app.head("/", (_req: Request, res: Response) => res.sendStatus(200));
app.options("/", (_req: Request, res: Response) => res.sendStatus(204));
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

// ---- Tools (public, since auth is off)
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

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`MCP shim running on :${PORT}`);
});

// keep connections alive; some proxies prefer explicit timeouts
server.keepAliveTimeout = 65000; // 65s
server.headersTimeout = 66000;   // 66s