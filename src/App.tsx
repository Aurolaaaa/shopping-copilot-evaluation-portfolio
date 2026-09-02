import { useId, useMemo, useState } from 'react'
import data from './data/dashboardData.json'
import { Icon } from './components/Icon'
import { GroupedBars, HorizontalBars, ScoreStrip } from './components/Charts'
import type { Session, ViewId } from './types'
import { LandingPage } from './LandingPage'

const nav: { id: ViewId; label: string }[] = [
  { id: 'overview', label: 'Overview' }, { id: 'official', label: 'Official 200' },
  { id: 'diagnostics', label: 'Diagnostics' }, { id: 'ablations', label: 'Ablations' },
  { id: 'generalization', label: 'Generalization' }, { id: 'robustness', label: 'Robustness' },
  { id: 'engineering', label: 'Engineering' }, { id: 'sessions', label: 'Sessions' },
]

const colors = ['#285f4b', '#88ad91', '#c5cbd0']
const n3 = (value: number) => value.toFixed(3)
const title = (id: ViewId) => nav.find(item => item.id === id)?.label ?? 'Overview'

const termExplanations: Record<string, string> = {
  'HR@10': 'Hit Rate at 10: the share of sessions where the target product appears in the top 10 recommendations.',
  'MRR': 'Mean Reciprocal Rank: rewards placing the target product closer to rank 1. Higher is better.',
  'Technical Score': 'The official composite score calculated from hit rate, ranking quality, and efficiency.',
  'API Cost': 'Estimated external API spend for this evaluation run. Version A used no paid API calls.',
  'Version A HR@10': 'The share of new-target sessions where Version A placed the target product in its top 10 recommendations.',
  'Official Weak HR@10': 'The top-10 hit rate of the official weak baseline on the same new-target sessions.',
  'Version A MRR': 'Version A’s average reciprocal rank on the new-target evaluation. Higher values mean earlier placement.',
  'Cold start': 'Time required to initialize the agent and build its in-memory search resources before evaluation.',
  'Turn P95': 'The response time that 95% of evaluated conversation turns completed within.',
  'Peak RSS': 'The highest resident memory used by the evaluation process.',
  'Official Public 200': 'Comparison of the official weak baseline and two reproducible Version A runs on the public 200-session set.',
  'Submission Readiness': 'Checks that the selected version, results, hashes, and evaluation workflow are ready for submission.',
  'Generalization Check': 'Compares official public performance with results on unseen product targets using the official evaluator protocol.',
  'New-target Outcomes': 'How Version A’s 480 new-target sessions ended: rank 1, another top-10 rank, or no hit.',
  'Scenario Performance': 'Official public-set quality split by shopping conversation scenario.',
  'Engineering': 'Runtime, memory, token, and operational characteristics of the offline agent.',
  'Three-run comparison': 'Side-by-side official metrics for the weak baseline, Version A offline, and Version A without an API key.',
  'Scenario breakdown': 'Performance reported separately for Boundary, Browsing, Buying, and Intent Override sessions.',
  'Primary attribution': 'The main pipeline stage responsible for delayed or missed target exposure in each diagnosed session.',
  'Focus set': 'The subset of official sessions selected for detailed error and ranking analysis.',
  'Diagnostic interpretation': 'A concise explanation of what the stage-level traces reveal about the agent’s remaining weaknesses.',
  'Module contribution': 'Controlled ablations showing how official public metrics change when one module is disabled.',
  'Technical score': 'The official composite score for each controlled ablation configuration.',
  'Decision': 'The configuration recommendation supported by the measured quality and coverage trade-offs.',
  'New-target comparison': 'Five runs evaluated on the same 480 unseen-target sessions with the unmodified official evaluator.',
  'Version A outcomes': 'The final rank distribution for Version A across all 480 new-target sessions.',
  'Input perturbation matrix': 'Measures how performance changes after synonym, spelling, missing-condition, or negation edits.',
  'Latency profile': 'Initialization-independent timing statistics for turns, sessions, and the full evaluation run.',
  'Cost': 'External model usage and API spending recorded during the evaluation.',
  'Fallback matrix': 'Observed agent behavior when keys, networks, models, indexes, or catalog resources are unavailable.',
  'Official public 200 sessions': 'The searchable session-level evidence behind the official public-set summary metrics.',
}

function InfoTooltip({ term }: { term: string }) {
  const id = useId()
  const explanation = termExplanations[term]
  if (!explanation) return null
  return <span className="info-tooltip">
    <button type="button" className="info-tooltip-trigger" aria-label={`Explain ${term}`} aria-describedby={id}><Icon name="info" size={14}/></button>
    <span className="info-tooltip-content" id={id} role="tooltip"><strong>{term}</strong><span>{explanation}</span></span>
  </span>
}

function Panel({ title, children, className = '', action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return <section className={`panel ${className}`}><header className="panel-header"><h2>{title} <InfoTooltip term={title}/></h2>{action}</header>{children}</section>
}

function Pill({ children, tone = 'official' }: { children: React.ReactNode; tone?: string }) {
  return <span className={`pill ${tone}`}>{children}</span>
}

function Kpi({ label, value, tone = 'official' }: { label: string; value: string; tone?: string }) {
  return <div className="kpi"><div className="kpi-label">{label}<InfoTooltip term={label}/></div><div className="kpi-row"><strong>{value}</strong><Pill tone={tone}>{tone}</Pill></div></div>
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | number | React.ReactNode)[][] }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>
}

function Overview({ setView }: { setView: (id: ViewId) => void }) {
  const runs = data.official.runs
  const current = runs[1]
  const scenarios = Object.entries(data.official.scenarios)
  const newTarget = data.synthetic.runs.find(run => run.label === 'Version A')!.exact
  const newTargetWeak = data.synthetic.runs.find(run => run.label === 'Official Weak')!.exact
  return <>
    <div className="kpi-grid">
      <Kpi label="HR@10" value={n3(current.hr)}/><Kpi label="MRR" value={n3(current.mrr)}/>
      <Kpi label="Technical Score" value={n3(current.score)}/><Kpi label="API Cost" value="$0" tone="engineering"/>
    </div>
    <div className="overview-grid top-row">
      <Panel title="Official Public 200" className="chart-panel" action={<button className="text-button" onClick={() => setView('official')}>View details</button>}>
        <div className="legend">{runs.map((run, i) => <span key={run.label}><i style={{background: colors[i]}}/>{run.label}</span>)}</div>
        <GroupedBars data={[
          { label: 'HR@10', values: runs.map((r, i) => ({ label:r.label, value:r.hr, color:colors[i] })) },
          { label: 'MRR', values: runs.map((r, i) => ({ label:r.label, value:r.mrr, color:colors[i] })) },
          { label: 'Technical Score', values: runs.map((r, i) => ({ label:r.label, value:r.score, color:colors[i] })) },
        ]}/>
      </Panel>
      <Panel title="Submission Readiness" className="readiness">
        {['Evaluation suite','Version frozen','Results reproducible','Hash verified'].map(item => <div className="status-row" key={item}><Icon name="check"/><span>{item}</span><strong>Verified</strong></div>)}
        <div className="status-row"><Icon name="check"/><span>New-target evaluation</span><strong>475 / 480 session hits</strong></div>
      </Panel>
    </div>
    <div className="overview-grid middle-row">
      <Panel title="Generalization Check">
        <div className="legend"><span><i className="green"/>Official 200</span><span><i className="amber"/>Synthetic new-target</span><span><i className="red"/>Weak baseline</span></div>
        <ScoreStrip items={[{label:'Official HR@10',value:1,tone:'#285f4b'},{label:'New-target HR@10',value:newTarget.hit_rate_at_10,tone:'#dc9700'},{label:'Weak new-target HR@10',value:newTargetWeak.hit_rate_at_10,tone:'#c74c4c'}]}/>
      </Panel>
      <Panel title="New-target Outcomes"><HorizontalBars data={data.synthetic.outcomes.map((x, i) => ({...x,color:i === 0 ? '#285f4b' : i === 1 ? '#88ad91' : '#c74c4c'}))} max={480}/></Panel>
    </div>
    <div className="overview-grid bottom-row">
      <Panel title="Scenario Performance">
        <DataTable headers={['Scenario','HR@10','MRR','MTTC','Trend']} rows={scenarios.map(([name, value]) => [name.replace('_',' '),n3(value.hit_rate_at_10),n3(value.mrr),n3(value.mttc),<span className="spark" aria-label="stable high performance">▮▮▮▮▮▮▮▮</span>])}/>
      </Panel>
      <Panel title="Engineering"><div className="kv-list"><div><span>Cold start</span><strong>{(data.engineering.coldStartMs/1000).toFixed(1)} s</strong></div><div><span>Turn P95</span><strong>{Math.round(data.engineering.turn.p95_ms)} ms</strong></div><div><span>Peak RSS</span><strong>{Math.round(data.engineering.peakRssMiB)} MiB</strong></div><div><span>Tokens</span><strong>{data.engineering.tokens}</strong></div></div></Panel>
    </div>
    <p className="separation-note">Official, synthetic, and robustness results are reported separately.</p>
  </>
}

function OfficialPage() {
  const runs = data.official.runs
  return <div className="page-stack"><div className="page-intro"><Pill>official</Pill><p>Local results on the frozen official public 200 set. These are not private leaderboard results.</p></div>
    <Panel title="Three-run comparison"><DataTable headers={['Run','HR@10','MRR','MTTC','Efficiency','Technical Score']} rows={runs.map(r => [r.label,n3(r.hr),n3(r.mrr),n3(r.mttc),n3(r.efficiency),n3(r.score)])}/></Panel>
    <Panel title="Scenario breakdown"><DataTable headers={['Scenario','Sessions','HR@10','MRR','MTTC']} rows={Object.entries(data.official.scenarios).map(([key,v]) => [key.replace('_',' '),v.sample_count,n3(v.hit_rate_at_10),n3(v.mrr),n3(v.mttc)])}/></Panel>
  </div>
}

function DiagnosticsPage() {
  return <div className="page-stack"><div className="callout"><strong>Stage diagnosis</strong><span>Target position tracked across candidate recall, reranking, and final output gating.</span></div>
    <div className="two-col"><Panel title="Primary attribution"><HorizontalBars data={[{label:'Output gate delay',value:83},{label:'Ranking delay',value:43},{label:'State / Override wait',value:27},{label:'Recall delay',value:3}]} max={100}/></Panel>
    <Panel title="Focus set"><div className="stat-list"><div><strong>7</strong><span>later than weak baseline</span></div><div><strong>19</strong><span>non-Rank-1 sessions</span></div><div><strong>24</strong><span>late Intent Override hits</span></div></div></Panel></div>
    <Panel title="Diagnostic interpretation"><div className="insight-grid"><article><Pill>gate</Pill><h3>Primary public-set contributor</h3><p>Targets were already inside rerank Top-10 in 83 delayed cases, but the current emit threshold withheld them.</p></article><article><Pill tone="synthetic">ranking</Pill><h3>Deep-candidate pressure</h3><p>Forty-three sessions reached the candidate pool but were delayed outside rerank Top-10.</p></article><article><Pill tone="robustness">state</Pill><h3>Override timing</h3><p>Most late hits after turn three are concentrated in the Intent Override protocol.</p></article></div></Panel>
  </div>
}

function AblationsPage() {
  const base = data.ablations[0].score
  return <div className="page-stack"><div className="page-intro"><Pill>official</Pill><p>Controlled public-200 ablations explain public-dev behavior only; they do not establish private-set generalization.</p></div>
    <Panel title="Module contribution"><DataTable headers={['Configuration','HR@10','MRR','MTTC','Technical Score','Δ Score']} rows={data.ablations.map((r,i) => [r.label,n3(r.hr),n3(r.mrr),n3(r.mttc),n3(r.score),i===0?'—':(r.score-base).toFixed(6)])}/></Panel>
    <div className="two-col"><Panel title="Technical score"><HorizontalBars data={data.ablations.map((r,i)=>({label:r.label,value:Math.round(r.score*1000),color:i===0?'#285f4b':'#88ad91'}))} max={1000}/></Panel><Panel title="Decision"><div className="decision-card"><strong>Keep the Version A control profile</strong><p>Emit gate off improves early coverage, but public TechnicalScore falls by 0.068512. Other modules have near-zero net movement.</p></div></Panel></div>
  </div>
}

function GeneralizationPage() {
  const versionA = data.synthetic.runs.find(run => run.label === 'Version A')!.exact
  const weak = data.synthetic.runs.find(run => run.label === 'Official Weak')!.exact
  return <div className="page-stack"><div className="page-intro warning-intro"><Pill tone="synthetic">synthetic</Pill><p>Updated 2 Sep 2026: 120 unseen targets × four official scenarios = 480 sessions, generated and scored by the unmodified official evaluator. These remain self-built proxy results, not official public or private scores.</p></div>
    <div className="three-kpis"><Kpi label="Version A HR@10" value={n3(versionA.hit_rate_at_10)} tone="synthetic"/><Kpi label="Official Weak HR@10" value={n3(weak.hit_rate_at_10)} tone="synthetic"/><Kpi label="Version A MRR" value={n3(versionA.mrr)} tone="synthetic"/></div>
    <Panel title="New-target comparison"><DataTable headers={['Run','HR@10','MRR','MTTC','Efficiency','Technical Score']} rows={data.synthetic.runs.map(r=>[r.label,n3(r.exact.hit_rate_at_10),n3(r.exact.mrr),n3(r.exact.mttc),n3(r.exact.efficiency),n3(r.exact.technical_score)])}/></Panel>
    <div className="two-col"><Panel title="Version A outcomes"><HorizontalBars data={data.synthetic.outcomes.map((x,i)=>({...x,color:i===0?'#285f4b':i===1?'#88ad91':'#c74c4c'}))} max={480}/></Panel><Panel title="Scenario breakdown"><DataTable headers={['Scenario','N','HR@10','MRR','MTTC']} rows={Object.entries(data.synthetic.scenarios).map(([key,value])=>[key.replace('_',' '),value.sample_count,n3(value.hit_rate_at_10),n3(value.mrr),n3(value.mttc)])}/></Panel></div>
    <div className="callout"><strong>What changed</strong><span>Version A hit 475 of 480 sessions and 413 were Rank 1. Emit gate off found two additional sessions sooner, but MRR fell by 0.197 and Technical Score by 0.047, so the control profile remains the recommended configuration.</span></div>
    <div className="callout danger"><strong>Evidence boundary</strong><span>The earlier 240-session custom-dialogue result is retained only as a separate language-stress signal. Its hand-written conversations, three-turn limit and scoring rules differ, so its 0.104 HR must not be compared directly with this result.</span></div>
  </div>
}

function RobustnessPage() {
  const a = data.robustness.absolute.version_a
  const variants = [['original','Original'],['synonym','Synonym'],['spelling','Spelling'],['missing_condition','Missing condition'],['equivalent_negation','Equivalent negation']] as const
  return <div className="page-stack"><div className="page-intro risk-intro"><Pill tone="robustness">legacy stress test</Pill><p>Paired input perturbations from the earlier 240-session custom-dialogue protocol. They remain useful for language sensitivity, but are not directly comparable with the updated 480-session official-evaluator generalization result.</p></div>
    <div className="three-kpis"><Kpi label="Original HR" value={n3(a.original.exact.hr)} tone="robustness"/><Kpi label="Synonym HR" value={n3(a.synonym.exact.hr)} tone="robustness"/><Kpi label="Session mismatches" value="0" tone="robustness"/></div>
    <Panel title="Input perturbation matrix"><DataTable headers={['Input','Exact HR','MRR','MTTC','Candidate Recall','Δ HR']} rows={variants.map(([key,label])=>[label,n3(a[key].exact.hr),n3(a[key].exact.mrr),n3(a[key].exact.mttc),n3(a[key].candidate_recall),key==='original'?'—':(a[key].exact.hr-a.original.exact.hr).toFixed(6)])}/></Panel>
    <div className="callout danger"><strong>Primary finding</strong><span>All 25 original exact hits were lost under synonym rewriting; candidate recall fell from 0.392 to 0.092.</span></div>
  </div>
}

function EngineeringPage() {
  const e = data.engineering
  return <div className="page-stack"><div className="three-kpis"><Kpi label="Cold start" value={`${(e.coldStartMs/1000).toFixed(1)} s`} tone="engineering"/><Kpi label="Turn P95" value={`${Math.round(e.turn.p95_ms)} ms`} tone="engineering"/><Kpi label="Peak RSS" value={`${Math.round(e.peakRssMiB)} MiB`} tone="engineering"/></div>
    <div className="two-col"><Panel title="Latency profile"><div className="kv-list"><div><span>Evaluation</span><strong>{(e.evaluationMs/1000).toFixed(1)} s</strong></div><div><span>Total in process</span><strong>{(e.totalMs/1000).toFixed(1)} s</strong></div><div><span>Turn mean</span><strong>{e.turn.mean_ms.toFixed(1)} ms</strong></div><div><span>Turn P99</span><strong>{e.turn.p99_ms.toFixed(1)} ms</strong></div><div><span>Session P95</span><strong>{e.sessionSummary.p95_ms.toFixed(1)} ms</strong></div></div></Panel>
    <Panel title="Cost"><div className="cost-display"><strong>$0</strong><span>0 prompt tokens · 0 completion tokens</span><p>Version A runs locally with BM25 and deterministic rules.</p></div></Panel></div>
    <Panel title="Fallback matrix"><DataTable headers={['Failure condition','Observed behavior','Status']} rows={e.fallbackChecks.map(([condition,behavior])=>[condition,behavior,<Pill tone={behavior.includes('failure')||behavior.includes('Empty')?'robustness':'official'}>{behavior.includes('failure')||behavior.includes('Empty')?'Guardrail':'Verified'}</Pill>])}/></Panel>
  </div>
}

function SessionsPage() {
  const [query,setQuery] = useState('')
  const [scenario,setScenario] = useState('all')
  const [selected,setSelected] = useState<Session | null>(null)
  const sessions = data.official.sessions as Session[]
  const filtered = useMemo(()=>sessions.filter(s=>(scenario==='all'||s.scenario_type===scenario)&&s.sample_id.includes(query.trim().toLowerCase())),[query,scenario,sessions])
  return <div className="page-stack"><div className="filters"><label className="search"><Icon name="search" size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search session ID"/></label><select value={scenario} onChange={e=>setScenario(e.target.value)}><option value="all">All scenarios</option><option value="boundary">Boundary</option><option value="browsing">Browsing</option><option value="buying">Buying</option><option value="intent_override">Intent Override</option></select><span>{filtered.length} sessions</span></div>
    <Panel title="Official public 200 sessions"><DataTable headers={['Session','Scenario','First hit','Best rank','Reciprocal rank','']} rows={filtered.map(s=>[s.sample_id,s.scenario_type.replace('_',' '),`Turn ${s.first_hit_turn}`,`#${s.best_rank}`,s.reciprocal_rank.toFixed(3),<button className="text-button" onClick={()=>setSelected(s)}>Inspect</button>])}/></Panel>
    {selected&&<div className="drawer-backdrop" onClick={()=>setSelected(null)}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="icon-button" onClick={()=>setSelected(null)} aria-label="Close"><Icon name="close"/></button><Pill>official</Pill><h2>{selected.sample_id}</h2><dl><div><dt>Scenario</dt><dd>{selected.scenario_type.replace('_',' ')}</dd></div><div><dt>First hit</dt><dd>Turn {selected.first_hit_turn}</dd></div><div><dt>Best rank</dt><dd>#{selected.best_rank}</dd></div><div><dt>Reciprocal rank</dt><dd>{selected.reciprocal_rank.toFixed(3)}</dd></div></dl><p>This compact view is sourced from the official result record. Full per-turn stage diagnostics remain in the frozen evaluation artifacts.</p></aside></div>}
  </div>
}

function DashboardApp() {
  const [view,setView] = useState<ViewId>('overview')
  const [mobileOpen,setMobileOpen] = useState(false)
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?'open':''}`}><div className="brand"><strong>Evaluation Copilot</strong><span>Shopping agent quality<br/>workspace</span></div><nav>{nav.map(item=><button className={view===item.id?'active':''} key={item.id} onClick={()=>{setView(item.id);setMobileOpen(false)}}><Icon name={item.id}/><span>{item.label}</span></button>)}</nav></aside>
    {mobileOpen&&<button className="mobile-scrim" aria-label="Close navigation" onClick={()=>setMobileOpen(false)}/>}
    <main><header className="topbar"><button className="menu-button" onClick={()=>setMobileOpen(v=>!v)} aria-label="Open navigation"><Icon name="menu"/></button><h1>{view==='overview'?'Evaluation Overview':title(view)}</h1><div className="version-status"><span>Version A</span><i>·</i><span>Frozen</span><i>·</i><span>Hash verified</span><Icon name="check" size={18}/></div></header><div className="content">
      {view==='overview'&&<Overview setView={setView}/>} {view==='official'&&<OfficialPage/>} {view==='diagnostics'&&<DiagnosticsPage/>} {view==='ablations'&&<AblationsPage/>} {view==='generalization'&&<GeneralizationPage/>} {view==='robustness'&&<RobustnessPage/>} {view==='engineering'&&<EngineeringPage/>} {view==='sessions'&&<SessionsPage/>}
    </div></main>
  </div>
}

function App() {
  const [showDashboard, setShowDashboard] = useState(false)
  return showDashboard ? <DashboardApp/> : <LandingPage onExplore={() => setShowDashboard(true)}/>
}

export default App
