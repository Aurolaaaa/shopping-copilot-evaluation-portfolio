import { useId, useState } from 'react'
import { Icon } from './components/Icon'

type Language = 'en' | 'zh'

const copy = {
  en: {
    cta: 'Explore Dashboard',
    intro: 'An interactive dashboard for evaluating and diagnosing a conversational shopping agent across recommendation quality, engineering reliability, and generalization performance.',
    roleTitle: 'My Role — Evaluation Lead',
    role: 'Owned the end-to-end evaluation of our Shopping Copilot, from evaluation framework design and benchmark construction to automated testing, failure diagnosis, and performance reporting.',
    steps: ['Define evaluation goals and success metrics', 'Design evaluation framework and taxonomies', 'Build and curate benchmarks', 'Develop automated evaluation pipeline', 'Run evaluations and collect results', 'Diagnose failures and root-cause analysis', 'Report performance and drive iteration'],
    workTitle: 'What I did',
    work: [
      ['Evaluation Framework', 'Defined evaluation objectives, metrics, and taxonomies across quality, robustness, and generalization.'],
      ['Benchmarking', 'Curated high-quality public and synthetic benchmarks to reflect real user scenarios and edge cases.'],
      ['Automated Evaluation', 'Built scalable evaluation pipelines to run tests, compute metrics, and ensure reproducibility.'],
      ['Failure Analysis', 'Analyzed failures systematically to identify root causes and prioritize improvements.'],
      ['Robustness Testing', 'Stress-tested the agent on noisy inputs, perturbations, and challenging conditions.'],
      ['Generalization Evaluation', 'Measured performance on out-of-distribution and new-target scenarios to validate generalization.'],
      ['Performance Tracking', 'Tracked performance over time with dashboards and evidence to drive continuous iteration.'],
    ],
    outcome: 'Key Outcome',
    tooltip: {
      'Technical Score': 'The official composite score used to evaluate overall agent performance.',
      'Hit Rate@10': 'The percentage of sessions where the target product appears in the top 10 recommendations.',
      'Evaluation Coverage': 'The evaluation areas included in this project.',
    },
  },
  zh: {
    cta: '查看仪表盘',
    intro: '一个用于评估与诊断 Shopping Copilot 的交互式仪表盘，从推荐质量、工程可靠性与泛化性能等维度，全面洞察评测表现。',
    roleTitle: '我的职责 — 评测负责人',
    role: '负责 Shopping Copilot 的端到端评测工作，涵盖评测框架设计、基准集构建、自动化测试、失败诊断与性能报告。',
    steps: ['定义评测目标与成功指标', '设计评测框架与分类体系', '构建并整理评测基准', '开发自动化评测流水线', '执行评测并收集结果', '进行失败诊断与根因分析', '汇报性能并推动迭代'],
    workTitle: '我的工作',
    work: [
      ['评测框架', '定义覆盖质量、鲁棒性与泛化能力的评测目标、指标和分类体系。'],
      ['基准评测', '构建高质量公开与自建基准，覆盖真实用户场景与边界案例。'],
      ['自动化评测', '搭建可扩展的评测流水线，用于运行测试、计算指标并确保结果可复现。'],
      ['失败分析', '系统分析失败案例，定位根因并确定改进优先级。'],
      ['鲁棒性测试', '通过噪声输入、扰动与挑战性条件检验 Agent 的稳定性。'],
      ['泛化能力评测', '在分布外与新目标场景中衡量表现，验证泛化能力。'],
      ['性能追踪', '通过 Dashboard 持续追踪性能变化，为迭代提供依据。'],
    ],
    outcome: '关键成果',
    tooltip: {
      'Technical Score': '用于衡量 Agent 整体表现的官方综合评分。',
      'Hit Rate@10': '目标商品进入推荐结果前 10 名的 Session 比例。',
      'Evaluation Coverage': '本项目覆盖的评测范围。',
    },
  },
} as const

const workIcons = ['overview', 'sessions', 'engineering', 'diagnostics', 'robustness', 'generalization', 'ablations']

function Arrow() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>
}

function LandingInfo({ term, language }: { term: keyof typeof copy.en.tooltip; language: Language }) {
  const id = useId()
  return <span className="landing-info">
    <button type="button" aria-label={language === 'en' ? `Explain ${term}` : `查看 ${term} 解释`} aria-describedby={id}><Icon name="info" size={15}/></button>
    <span id={id} role="tooltip"><strong>{term}</strong>{copy[language].tooltip[term]}</span>
  </span>
}

function DashboardButton({ language, onExplore }: { language: Language; onExplore: () => void }) {
  return <button className="landing-cta" type="button" onClick={onExplore}>{copy[language].cta}<Arrow/></button>
}

function ScoreCard({ language }: { language: Language }) {
  return <div className="landing-score-card">
    <div className="score-main">
      <div className="landing-label">Technical Score <LandingInfo term="Technical Score" language={language}/></div>
      <div className="score-value"><span>0.1067</span><b>→</b><strong>0.9543</strong></div>
      <svg className="score-chart" viewBox="0 0 560 170" role="img" aria-label="Technical Score increased from 0.1067 to 0.9543">
        <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#88ad91" stopOpacity=".25"/><stop offset="1" stopColor="#88ad91" stopOpacity="0"/></linearGradient></defs>
        <path className="chart-axis" d="M42 14v118h492"/><path className="chart-area" d="M44 120L150 92L258 57L370 30L528 8V132H44Z"/><path className="chart-line" d="M44 120L150 92L258 57L370 30L528 8"/><circle cx="44" cy="120" r="4"/><circle cx="528" cy="8" r="4"/>
        <text x="12" y="18">1.0</text><text x="12" y="77">0.5</text><text x="25" y="136">0</text><text x="42" y="158">Baseline</text><text x="430" y="158">Optimized Agent</text>
      </svg>
    </div>
    <div className="score-subgrid">
      <div><div className="landing-label">Hit Rate@10 <LandingInfo term="Hit Rate@10" language={language}/></div><strong className="hit-value">100%</strong><div className="hit-ticks" aria-hidden="true">{Array.from({length: 12},(_,i)=><i key={i}/>)}</div></div>
      <div><div className="landing-label">Evaluation Coverage <LandingInfo term="Evaluation Coverage" language={language}/></div><div className="coverage"><span>{Array.from({length: 5},(_,i)=><i key={i}/>)}</span><strong>5 / 5</strong></div></div>
    </div>
  </div>
}

export function LandingPage({ onExplore }: { onExplore: () => void }) {
  const [language, setLanguage] = useState<Language>('en')
  const t = copy[language]
  return <div className={`landing-page ${language === 'zh' ? 'is-zh' : ''}`} lang={language === 'zh' ? 'zh-CN' : 'en'}>
    <header className="landing-nav">
      <strong>Evaluation Copilot by Liang Xuanmian (Aurola L.)</strong>
      <div className="landing-nav-actions"><span className="event-name">TikTok TechJam 2026</span><div className="language-toggle" role="group" aria-label="Language"><button className={language === 'zh' ? 'active' : ''} onClick={()=>setLanguage('zh')} aria-pressed={language === 'zh'}>中文</button><button className={language === 'en' ? 'active' : ''} onClick={()=>setLanguage('en')} aria-pressed={language === 'en'}>English</button></div><DashboardButton language={language} onExplore={onExplore}/></div>
    </header>

    <section className="landing-hero">
      <div className="hero-copy"><h1>{language === 'zh' ? <><span>Shopping Copilot</span><span>评测仪表盘</span></> : <>Shopping Copilot<br/>Evaluation Dashboard</>}</h1><p className="hero-meta">TikTok TechJam 2026 · Shopping Copilot</p><p className="hero-intro">{t.intro}</p></div>
      <ScoreCard language={language}/>
    </section>

    <section className="landing-role landing-section">
      <div><h2>{t.roleTitle}</h2><p>{t.role}</p></div>
      <ol>{t.steps.map((step,i)=><li key={step}><span>{i+1}</span>{step}</li>)}</ol>
    </section>

    <section className="landing-work landing-section"><h2>{t.workTitle}</h2><div className="work-timeline">{t.work.map(([title,description],i)=><article className={i%2 ? 'right' : 'left'} key={title}><span className="work-number">{i+1}</span><div><h3>{title}</h3><p>{description}</p></div><span className="work-icon"><Icon name={workIcons[i]} size={22}/></span></article>)}</div></section>

    <section className="landing-outcome landing-section"><h2>{t.outcome}</h2><div className="outcome-grid"><div><span>Technical Score <LandingInfo term="Technical Score" language={language}/></span><strong><em>0.1067</em> → <b>0.9543</b></strong></div><div><span>Hit Rate@10 <LandingInfo term="Hit Rate@10" language={language}/></span><strong><b>100%</b></strong></div><div><span>Evaluation Coverage <LandingInfo term="Evaluation Coverage" language={language}/></span><p>Baseline · Optimized Agent · Robustness · Generalization · Failure Attribution</p></div></div><DashboardButton language={language} onExplore={onExplore}/></section>
    <footer><span>Evaluation Copilot</span><i>·</i><span>TikTok TechJam 2026</span></footer>
  </div>
}
