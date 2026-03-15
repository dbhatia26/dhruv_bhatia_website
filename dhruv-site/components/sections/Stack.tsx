'use client'

import { useEffect, useRef } from 'react'

const stackLayers = [
  { layer: 'AI Layer', color: '#00d4ff', tools: [
    { name: 'Databricks Genie', desc: 'NL-to-SQL AI assistant' },
    { name: 'LLM Prompt Eng.', desc: 'Prompt design & tuning' },
    { name: 'Genie Spaces', desc: 'Domain-scoped AI contexts' },
  ]},
  { layer: 'Analytics & BI', color: '#818cf8', tools: [
    { name: 'Tableau', desc: 'Executive dashboards' },
    { name: 'Databricks SQL', desc: 'Ad-hoc & scheduled queries' },
    { name: 'Heap Analytics', desc: 'Web behavioral analytics' },
    { name: 'Google Analytics', desc: 'Digital marketing data' },
  ]},
  { layer: 'Data Engineering', color: '#34d399', tools: [
    { name: 'DBT', desc: 'Data transformation & modeling' },
    { name: 'Databricks', desc: 'Lakehouse platform' },
    { name: 'SQL', desc: 'Primary query language' },
    { name: 'Python', desc: 'Scripting & data processing' },
  ]},
  { layer: 'Experimentation', color: '#f59e0b', tools: [
    { name: 'A/B Testing', desc: 'Statistical experiment design' },
    { name: 'Synthetic Control', desc: 'Geo-based causal inference' },
    { name: 'JavaScript', desc: 'Web tracking & data layer' },
  ]},
]

const skills = ['Analytics Engineering','SQL · Python · JavaScript','Databricks · DBT','Business Intelligence','Experimentation & A/B Testing','Data Modeling','AI-Enabled Analytics','Prompt Engineering','Decision Intelligence','Data ETL','Financial Forecasting','X-Functional Leadership']

export default function Stack() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.08 }
    )
    ref.current?.querySelectorAll('.fade-section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="stack" ref={ref} style={{ padding: '120px 24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="fade-section" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>/stack</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>
        <h2 className="fade-section" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '10px' }}>Analytics Stack</h2>
        <p className="fade-section" style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 300, marginBottom: '44px' }}>The tools and technologies behind the systems I build.</p>

        <div className="fade-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '64px' }}>
          {stackLayers.map((layer) => (
            <div key={layer.layer} style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${layer.color}18`, background: `${layer.color}04` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderBottom: `1px solid ${layer.color}10` }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: layer.color, boxShadow: `0 0 8px ${layer.color}` }} />
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: layer.color, opacity: 0.8 }}>{layer.layer}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', padding: '16px 18px' }}>
                {layer.tools.map((tool) => (
                  <div key={tool.name}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '2px' }}>{tool.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tool.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="fade-section">
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '18px' }}>Core Competencies</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill) => (
              <span key={skill} style={{
                fontSize: '12px', fontFamily: 'DM Mono, monospace', padding: '6px 14px',
                borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--text-muted)',
                cursor: 'default', transition: 'all 0.2s',
              }}>{skill}</span>
            ))}
          </div>
        </div>

        <div className="fade-section" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px', marginTop: '48px' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '14px' }}>Education</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '4px' }}>Bachelor of Business Administration</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Beedie School of Business · Simon Fraser University</div>
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {['Concentration: Management of Information Systems', 'Certificate: Business Technology Management', 'Teaching Assistant: Data & Decisions II'].map(item => (
                  <span key={item} style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {item}</span>
                ))}
              </div>
            </div>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-faint)' }}>2019 – 2023</span>
          </div>
        </div>
      </div>
    </section>
  )
}
