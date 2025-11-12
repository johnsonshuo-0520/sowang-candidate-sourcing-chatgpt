export type CreateJobInput = {
  title: string;
  location: string;
  company: string;
  description: string;
};
export type CreateJobOutput = { job_id: string };

export type SourceCandidatesInput = { job_id: string };
export type Candidate = {
  candidate_id: string;
  name: string;         // masked alias, e.g., "candidate_123"
  company: string;
  title: string;
  location: string;
  qualifications: string[];
};
export type SourceCandidatesOutput = { candidates: Candidate[] };

const BASE = process.env.MCP_BASE_URL ?? "http://localhost:3001";

async function jsonPost<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`HTTP ${r.status}: ${text}`);
  }
  return r.json() as Promise<T>;
}

export async function createJob(input: CreateJobInput): Promise<CreateJobOutput> {
  return jsonPost<CreateJobOutput>("/tools/create_job", input);
}

export async function sourceCandidates(input: SourceCandidatesInput): Promise<SourceCandidatesOutput> {
  return jsonPost<SourceCandidatesOutput>("/tools/source_candidates", input);
}
