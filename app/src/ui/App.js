import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
/**
 * Mock-first App UI:
 * - Set VITE_USE_MOCK=true (or omit) to run fully offline in the browser.
 * - Set VITE_USE_MOCK=false and VITE_MCP_BASE_URL to call your real MCP server.
 *
 * Usage:
 *  - cd app
 *  - echo "VITE_USE_MOCK=true" > .env.local
 *  - npm run dev
 */
const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "true").toString() !== "false";
const BASE = import.meta.env.VITE_MCP_BASE_URL || "http://localhost:3001";
async function api(path, body) {
    const r = await fetch(`${BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok)
        throw new Error(await r.text());
    return r.json();
}
/* ----------------- Mock implementations ----------------- */
function uuidv4() {
    // simple uuid generator for frontend-only mock
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        // eslint-disable-next-line eqeqeq
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function makeMockQualifications(title) {
    const techs = ["Java", "Scala", "Go", "Python", "Kafka", "Pinot", "Trino", "Redis", "MySQL", "Kubernetes", "AWS", "GCP"];
    const verbs = [
        `Built ingestion pipelines using ${pick(techs)}`,
        `Experienced with ${pick(techs)} and streaming systems`,
        `Designed low-latency ranking pipelines`,
        `Worked on nearline dedupe systems`,
        `Owned SLAs and monitoring for critical jobs`,
        `Familiar with data modeling and distributed systems`,
    ];
    const quals = [pick(verbs), pick(verbs), `Relevant title: ${title}`];
    // dedupe and return
    return Array.from(new Set(quals));
}
function sourceCandidatesMock(job_id, count = 6) {
    const baseTitles = ["Senior Backend Engineer", "Staff Data Engineer", "Senior Software Engineer", "Principal Backend Engineer", "Data Platform Engineer"];
    const companies = ["Acme Systems", "DataWorks.io", "BlueOcean Labs", "Nimbus Solutions", "VertexData"];
    const locations = ["San Francisco, CA, US", "Mountain View, CA, US", "New York, NY, US", "Berlin, DE", "London, UK", "Bengaluru, IN"];
    const candidates = Array.from({ length: count }).map((_, i) => {
        const title = pick(baseTitles);
        return {
            candidate_id: `cand_${i + 1}_${job_id.slice(0, 8)}`,
            name: `candidate_${i + 1}`, // masked alias on purpose
            company: pick(companies),
            title,
            location: pick(locations),
            qualifications: makeMockQualifications(title),
        };
    });
    return { candidates };
}
async function createJobMock(input) {
    // emulate a small delay like a network call
    await new Promise((res) => setTimeout(res, 220));
    const id = uuidv4();
    console.log("[mock] create_job ->", id, input.title);
    return { job_id: id };
}
/* ----------------- UI Components ----------------- */
function LeftItem({ c, active, onClick }) {
    return (_jsx("div", { className: `card list-item ${active ? "active" : ""}`, onClick: onClick, role: "button", tabIndex: 0, children: _jsxs("div", { className: "card-body", children: [_jsx("h3", { className: "title", children: c.title }), _jsxs("div", { className: "sub", children: [c.company, " \u00B7 ", c.location] })] }) }));
}
function RightPane({ c }) {
    if (!c)
        return (_jsx("div", { className: "card", children: _jsx("div", { className: "card-body", children: _jsx("div", { className: "small", children: "Select a candidate on the left to view details." }) }) }));
    return (_jsx("div", { className: "card right-pane", children: _jsxs("div", { className: "card-body", children: [_jsx("div", { className: "header-row", children: _jsxs("div", { children: [_jsx("h3", { className: "title", children: c.title }), _jsxs("div", { className: "sub", children: [c.company, " \u00B7 ", c.location] })] }) }), _jsxs("div", { className: "section", children: [_jsx("h4", { children: "Why a match" }), _jsx("ul", { className: "ul", children: c.qualifications.map((q, i) => (_jsx("li", { children: q }, i))) })] }), _jsx("div", { className: "hr" }), _jsx("div", { style: { marginTop: 16 }, children: _jsx("button", { className: "btn", style: { width: "100%", borderRadius: 8 }, onClick: () => alert("Redirecting to LinkedIn (stub)"), children: "Log in to see full profile" }) })] }) }));
}
/* ----------------- Main App ----------------- */
export default function App() {
    const [title, setTitle] = useState("Senior Backend Engineer");
    const [location, setLocation] = useState("Mountain View, CA, US");
    const [company, setCompany] = useState("Acme Systems");
    const [description, setDescription] = useState("Responsibilities: Own ingestion pipelines...\nRequirements: Java, Kafka, Pinot...");
    const [jobId, setJobId] = useState(null);
    const [cands, setCands] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const canCreate = useMemo(() => [title, location, company, description].every((x) => x && x.trim().length > 0), [title, location, company, description]);
    const active = cands && cands.length ? cands[Math.min(activeIndex, cands.length - 1)] : null;
    async function onCreateJob() {
        setError(null);
        setLoading(true);
        try {
            if (USE_MOCK) {
                const out = await createJobMock({ title, location, company, description });
                setJobId(out.job_id);
                setCands(null);
            }
            else {
                const out = await api("/tools/create_job", { title, location, company, description });
                setJobId(out.job_id);
                setCands(null);
            }
        }
        catch (e) {
            setError(e?.message ?? String(e));
        }
        finally {
            setLoading(false);
        }
    }
    async function onSource() {
        if (!jobId)
            return;
        setError(null);
        setLoading(true);
        try {
            if (USE_MOCK) {
                // produce 6 mock candidates locally
                const out = sourceCandidatesMock(jobId, 6);
                setCands(out.candidates);
                setActiveIndex(0);
            }
            else {
                const out = await api("/tools/source_candidates", { job_id: jobId });
                setCands(out.candidates);
                setActiveIndex(0);
            }
        }
        catch (e) {
            setError(e?.message ?? String(e));
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "container", children: [_jsxs("div", { className: "header", children: [_jsx("div", { className: "filter-chip", children: "Jobs" }), _jsxs("div", { className: "filter-chip", children: ["Date posted ", _jsx("span", { className: "x", children: "\u00D7" })] }), _jsx("div", { className: "filter-chip", children: "Backend" }), _jsx("div", { className: "filter-chip", children: "Full-time" })] }), _jsx("div", { className: "card", children: _jsxs("div", { className: "card-body", children: [_jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }, children: [_jsxs("div", { children: [_jsx("label", { className: "small", children: "Job title" }), _jsx("input", { className: "input", style: { width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "8px" }, value: title, onChange: (e) => setTitle(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "small", children: "Location" }), _jsx("input", { className: "input", style: { width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "8px" }, value: location, onChange: (e) => setLocation(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "small", children: "Company" }), _jsx("input", { className: "input", style: { width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "8px" }, value: company, onChange: (e) => setCompany(e.target.value) })] }), _jsxs("div", { style: { gridColumn: "1 / -1" }, children: [_jsx("label", { className: "small", children: "Job description" }), _jsx("textarea", { className: "input", rows: 4, style: { width: "100%", padding: "8px 10px", border: "1px solid var(--border)", borderRadius: "8px" }, value: description, onChange: (e) => setDescription(e.target.value) })] })] }), _jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }, children: [_jsx("div", { className: "small", children: jobId ? _jsxs(_Fragment, { children: ["Created job ", _jsxs("strong", { children: [jobId.slice(0, 8), "\u2026"] })] }) : 'Not created' }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { className: "btn secondary", disabled: !canCreate || loading, onClick: onCreateJob, children: "Create job" }), _jsx("button", { className: "btn", disabled: !jobId || loading, onClick: onSource, children: "Source candidates" })] })] }), error && _jsx("div", { style: { color: "#b00020", marginTop: 8 }, children: error })] }) }), _jsx("div", { style: { height: 12 } }), _jsxs("div", { className: "grid", children: [_jsxs("div", { className: "left-list", children: [(cands ?? []).map((c, i) => (_jsx(LeftItem, { c: c, active: i === activeIndex, onClick: () => setActiveIndex(i) }, c.candidate_id))), !cands && _jsx("div", { className: "card", children: _jsx("div", { className: "card-body small", children: "No results yet \u2014 create a job and click \u201CSource candidates\u201D." }) })] }), _jsx(RightPane, { c: active })] }), _jsx("div", { style: { height: 16 } }), _jsxs("div", { className: "banner", children: ["PII policy: This surface only shows masked aliases (e.g., ", _jsx("span", { className: "mask", children: "candidate_123" }), "). Full profiles available on LinkedIn via deep link outside ChatGPT."] })] }));
}
