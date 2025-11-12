import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: true, credentials: false }));
// --- Simple auth guard ---
const AUTH = process.env.MCP_AUTH_TOKEN;
app.use((req, res, next) => {
    if (!AUTH)
        return next();
    const hdr = req.headers.authorization || "";
    if (hdr === `Bearer ${AUTH}`)
        return next();
    res.status(401).json({ error: "Unauthorized" });
});
// --- Health check ---
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
// --- /tools/create_job ---
app.post("/tools/create_job", (req, res) => {
    const { title, location, company, description } = req.body;
    if (!title || !location || !company || !description) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const job_id = randomUUID();
    console.log(`✅ Job created: ${job_id} (${title} @ ${company})`);
    return res.json({ job_id });
});
// --- /tools/source_candidates ---
app.post("/tools/source_candidates", (req, res) => {
    const { job_id } = req.body ?? {};
    if (!job_id) {
        return res.status(400).json({ error: "job_id required" });
    }
    const mkCandidate = (i) => ({
        candidate_id: `cand_${i}_${job_id.slice(0, 8)}`,
        name: `candidate_${i}`,
        company: i % 2 ? "DataWorks.io" : "Acme Systems",
        title: i % 2 ? "Senior Backend Engineer" : "Staff Data Engineer",
        location: "Bay Area, US",
        qualifications: [
            "Java/Scala, Kafka, Pinot/Trino",
            "Built nearline dedupe & SLA monitors",
            "Experience with LinkedIn-style candidate ranking"
        ],
    });
    const candidates = [mkCandidate(1), mkCandidate(2), mkCandidate(3)];
    console.log(`🎯 Sourced ${candidates.length} candidates for job ${job_id}`);
    return res.json({ candidates });
});
// --- Start server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Mock MCP running at http://localhost:${PORT}`);
});
