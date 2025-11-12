import React, { useMemo, useState } from 'react'

const BASE = import.meta.env.VITE_MCP_BASE_URL || 'http://localhost:3001'

type CreateJobInput = { title: string; location: string; company: string; description: string }
type CreateJobOutput = { job_id: string }
type SourceCandidatesInput = { job_id: string }
type Candidate = { candidate_id: string; name: string; company: string; title: string; location: string; qualifications: string[] }

async function api<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error(await r.text())
  return r.json() as Promise<T>
}

function LeftItem({ c, active, onClick }: { c: Candidate, active: boolean, onClick: ()=>void }){
  return (
    <div className={`card list-item ${active ? 'active':''}`} onClick={onClick}>
      <div className="card-body">
        <h3 className="title">{c.title}</h3>
        <div className="sub">{c.company} · {c.location}</div>
        <div className="meta">
          <span className="pill">On-site</span>
          <span className="pill">Full-time</span>
        </div>
      </div>
    </div>
  )
}

function RightPane({ c }: { c: Candidate | null }){
  if(!c) return (
    <div className="card">
      <div className="card-body">
        <div className="small">Select a candidate on the left to view details.</div>
      </div>
    </div>
  )
  return (
    <div className="card right-pane">
      <div className="card-body">
        <div className="header-row">
          <div>
            <h3 className="title">{c.title}</h3>
            <div className="sub">{c.company} · {c.location}</div>
          </div>
          <div className="cta">
            <button
                className="btn"
                onClick={() => alert('Redirecting to LinkedIn (stub)')}
            >
              Log in to see full profile
            </button>
          </div>
        </div>

        <div className="section">
          <h4>Why a match</h4>
          <ul className="ul">
            {c.qualifications.map((q,i)=>(<li key={i}>{q}</li>))}
          </ul>
        </div>

        <div className="hr" />
      </div>
    </div>
  )
}

export default function App(){
  const [title, setTitle] = useState('Senior Backend Engineer')
  const [location, setLocation] = useState('Mountain View, CA, US')
  const [company, setCompany] = useState('Acme Systems')
  const [description, setDescription] = useState('Responsibilities: Own ingestion pipelines...\nRequirements: Java, Kafka, Pinot...')
  const [jobId, setJobId] = useState<string | null>(null)
  const [cands, setCands] = useState<Candidate[] | null>(null)
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canCreate = useMemo(()=> [title, location, company, description].every(x => x && x.trim().length > 0), [title, location, company, description])
  const active = cands && cands.length ? cands[Math.min(activeIndex, cands.length - 1)] : null

  async function onCreateJob(){
    setError(null); setLoading(true)
    try{
      const out = await api<CreateJobOutput>('/tools/create_job', { title, location, company, description } as CreateJobInput)
      setJobId(out.job_id)
      setCands(null)
    }catch(e:any){ setError(e.message) }finally{ setLoading(false) }
  }

  async function onSource(){
    if(!jobId) return
    setError(null); setLoading(true)
    try{
      const out = await api<{candidates: Candidate[]}>('/tools/source_candidates', { job_id: jobId } as SourceCandidatesInput)
      setCands(out.candidates)
      setActiveIndex(0)
    }catch(e:any){ setError(e.message) }finally{ setLoading(false) }
  }

  return (
    <div className="container">
      {/* Filter chips like LinkedIn */}
      <div className="header">
        <div className="filter-chip">Jobs</div>
        <div className="filter-chip">Date posted <span className="x">×</span></div>
        <div className="filter-chip">Remote</div>
        <div className="filter-chip">Backend</div>
        <div className="filter-chip">Full-time</div>
        <div className="filter-chip">In my network</div>
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px'}}>
            <div>
              <label className="small">Job title</label>
              <input className="input" style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:'8px'}} value={title} onChange={e=>setTitle(e.target.value)} />
            </div>
            <div>
              <label className="small">Location</label>
              <input className="input" style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:'8px'}} value={location} onChange={e=>setLocation(e.target.value)} />
            </div>
            <div>
              <label className="small">Company</label>
              <input className="input" style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:'8px'}} value={company} onChange={e=>setCompany(e.target.value)} />
            </div>
            <div style={{gridColumn:'1 / -1'}}>
              <label className="small">Job description</label>
              <textarea className="input" rows={4} style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:'8px'}} value={description} onChange={e=>setDescription(e.target.value)} />
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
            <div className="small">{jobId ? <>Created job <strong>{jobId.slice(0,8)}…</strong></> : 'Not created'}</div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn secondary" disabled={!canCreate || loading} onClick={onCreateJob}>Create job</button>
              <button className="btn" disabled={!jobId || loading} onClick={onSource}>Source candidates</button>
            </div>
          </div>
          {error && <div style={{color:'#b00020', marginTop:8}}>{error}</div>}
        </div>
      </div>

      <div style={{height:12}} />

      <div className="grid">
        <div className="left-list">
          {(cands ?? []).map((c, i) => (
            <LeftItem key={c.candidate_id} c={c} active={i===activeIndex} onClick={()=>setActiveIndex(i)} />
          ))}
          {!cands && <div className="card"><div className="card-body small">No results yet — create a job and click “Source candidates”.</div></div>}
        </div>

        <RightPane c={active} />
      </div>

      <div style={{height:16}}/>
    </div>
  )
}
