import express from "express";
import helmet from "helmet";
import { auth } from "./auth";
const app = express();
app.use(helmet());
app.use(express.json());
// Require the token for all routes
app.use(auth(true));
app.get("/health", (_req, res) => res.json({ ok: true }));
// --- tools (mock data, no LinkedIn needed)
app.post("/tools/create_job", (req, res) => {
    const { title, location, company, description } = req.body ?? {};
    if (!title || !location || !company || !description) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    const job_id = crypto.randomUUID();
    res.json({ job_id });
});
app.post("/tools/source_candidates", (req, res) => {
    const { job_id } = req.body ?? {};
    if (!job_id)
        return res.status(400).json({ error: "job_id required" });
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const titles = ["Senior Backend Engineer", "Staff Data Engineer", "Principal Backend"];
    const companies = ["Acme Systems", "DataWorks.io", "Nimbus"];
    const locs = ["Mountain View, CA, US", "San Francisco, CA, US", "Berlin, DE"];
    const mk = (i) => ({
        candidate_id: `cand_${i}_${String(job_id).slice(0, 8)}`,
        name: `candidate_${i}`,
        company: pick(companies),
        title: pick(titles),
        location: pick(locs),
        qualifications: [
            "Java/Scala, Kafka, Pinot/Trino",
            "Nearline dedupe & SLA monitors",
            "Experience w/ candidate ranking"
        ],
    });
    res.json({ candidates: [mk(1), mk(2), mk(3), mk(4), mk(5), mk(6)] });
});
// --- app surface (serves your built Vite bundle)
app.use("/app", express.static("dist")); // put your UI build here (see Step 2)
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`MCP shim on http://localhost:${PORT}`));
//# sourceMappingURL=server.js.map