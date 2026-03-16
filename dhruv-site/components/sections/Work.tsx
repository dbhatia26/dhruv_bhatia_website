'use client'

import { useEffect, useRef, useState } from 'react'

const projects = [
  { id: '01', title: 'Genie — AI Analytics Assistants', category: 'AI-Enabled Analytics', tags: ['Databricks', 'LLM', 'NLP', 'Genie Spaces'], accent: '#00d4ff', problem: 'Teams relied on analysts to answer every data question. Dashboard sprawl meant 20+ reports, each requiring maintenance and context.', system: 'Built AI assistants ("Genies") on Databricks that allow any team to query curated enterprise datasets using plain English. Each Genie is scoped to a business domain — ecommerce, inventory, ops — with tuned prompts and trusted data models underneath.', impact: ['100+ AI-driven analytics conversations per week', 'Replaced 20+ static dashboards', 'Self-serve analytics for non-technical teams', 'Reduced analyst interrupt load by ~40%'], arch: ['Source Tables', 'DBT Models', 'Databricks', 'Genie AI'] },
  { id: '02', title: 'Halo Effect Measurement System', category: 'Decision Intelligence', tags: ['Statistics', 'SQL', 'Python', 'A/B Testing'], accent: '#818cf8', problem: 'No reliable way to measure whether opening a physical store boosted local online sales — or cannibalized them.', system: 'Designed a geo-holdout experimentation framework using matched markets. Built a synthetic control model to isolate the net effect of new store openings on localized digital revenue.', impact: ['Quantified incremental online lift from physical stores', 'Informed real estate & store expansion strategy', 'First data-backed model for omnichannel ROI'], arch: ['Geo Data', 'Matched Markets', 'Synthetic Control', 'Causal Estimate'] },
  { id: '03', title: 'Checkout Experimentation Platform', category: 'Experimentation & Growth', tags: ['A/B Testing', 'Heap', 'SQL', 'Databricks'], accent: '#34d399', problem: 'Checkout UX changes were being shipped without statistical validation, leading to revenue risk and inconclusive learnings.', system: 'Built end-to-end A/B testing infrastructure — from experiment design through data collection to significance reporting. Led multiple checkout experiments measuring conversion and AOV.', impact: ['Changes saving $M annually identified', 'Established rigorous experimentation culture', 'Enabled faster, safer product decisions'], arch: ['Heap Events', 'SQL Pipeline', 'Stats Engine', 'Decision'] },
  { id: '04', title: 'Universal Revenue Data Model', category: 'Analytics Infrastructure', tags: ['DBT', 'SQL', 'Databricks', 'Data Modeling'], accent: '#f59e0b', problem: 'Multiple reports pulling from different source tables produced conflicting revenue numbers — no single source of truth.', system: 'Designed a universal revenue model in DBT that unified all revenue sources, channel logic, and adjustment rules. Aligned 8+ downstream reports to a single canonical model.', impact: ['Eliminated revenue discrepancies across teams', 'Reduced reporting maintenance overhead', 'Trusted baseline for finance and exec reporting'], arch: ['Source Tables', 'DBT Models', 'Revenue Layer', 'All Reports'] },
]

export default function Work() {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('visible', e.isIntersecting)), { threshold: 0.05 })
    ref.current?.querySelectorAll('.fade-section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  const p = projects[active]
  return (
    <section id="work" ref={ref} style={{ padding: 'clamp(60px,10vw,120px) clamp(16px,5vw,24px)', borderTop: '1px solid var(--border)' }}>
      <style>{`
        .work-card { display: grid; grid-template-columns: 1fr 1.5fr; }
        @media (max-width: 700px) { .work-card { grid-template-columns: 1fr; } .work-card-right { border-top: 1px solid var(--border); } }
      `}</style>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="fade-section" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>/work</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>
        <h2 className="fade-section" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '10px' }}>Data Products</h2>
        <p className="fade-section" style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 300, marginBottom: '32px' }}>Each project is a system — designed to outlast any single report or query.</p>
        <div className="fade-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {projects.map((pr, i) => (
            <button key={pr.id} onClick={() => setActive(i)} style={{ padding: '7px 14px', borderRadius: '4px', fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', border: active === i ? `1px solid ${pr.accent}40` : '1px solid var(--border)', color: active === i ? 'var(--text-strong)' : 'var(--text-muted)', background: active === i ? 'var(--surface)' : 'transparent' }}>
              {pr.id} {pr.title.split(' ')[0]}
            </button>
          ))}
        </div>
        <div className="fade-section work-card" style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', background: 'var(--surface)' }}>
          <div style={{ padding: 'clamp(20px,4vw,28px)', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '42px', fontWeight: 700, color: p.accent, opacity: 0.25, marginBottom: '12px', lineHeight: 1 }}>{p.id}</div>
            <div style={{ display: 'inline-block', fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '3px', border: `1px solid ${p.accent}35`, color: p.accent, background: `${p.accent}08`, marginBottom: '14px' }}>{p.category}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(14px,3vw,17px)', fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.3, marginBottom: '16px' }}>{p.title}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
              {p.tags.map((t) => <span key={t} style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', padding: '3px 8px', borderRadius: '3px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{t}</span>)}
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: p.accent, opacity: 0.75, marginBottom: '10px' }}>Impact</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {p.impact.map((item) => (
                <li key={item} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', lineHeight: 1.4 }}>
                  <span style={{ color: p.accent, opacity: 0.65, flexShrink: 0 }}>→</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="work-card-right" style={{ padding: 'clamp(20px,4vw,28px)' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '10px' }}>Problem</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>{p.problem}</p>
            <div style={{ width: '100%', height: '1px', background: 'var(--border)', marginBottom: '20px' }} />
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '10px' }}>System Built</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>{p.system}</p>
            <div style={{ borderRadius: '10px', padding: '16px', background: `${p.accent}06`, border: `1px solid ${p.accent}18` }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: p.accent, opacity: 0.65, marginBottom: '10px' }}>Architecture</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                {p.arch.map((node, i) => (
                  <span key={i}>
                    <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', padding: '4px 8px', borderRadius: '3px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{node}</span>
                    {i < p.arch.length - 1 && <span style={{ color: 'var(--text-faint)', fontSize: '11px', margin: '0 2px' }}> → </span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
