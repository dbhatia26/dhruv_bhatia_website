'use client'

import { useEffect, useRef } from 'react'

const pillars = [
  { icon: '⬡', title: 'Data as Product', body: 'Dashboards are artifacts. I build data products — trusted, versioned, discoverable systems that evolve with the business.' },
  { icon: '◈', title: 'Conversational Intelligence', body: 'Natural language is the new query language. I build AI interfaces that let any team member interrogate enterprise data without SQL.' },
  { icon: '△', title: 'Decision Infrastructure', body: "Great analytics doesn't end at insight — it closes the loop into action. I design systems that automate the path from data to decision." },
]

const timeline = [
  { role: 'Lead Business Analyst — Data Operations', company: 'Article', period: 'Present', note: 'AI Analytics, Team Leadership, Data Products', current: true },
  { role: 'Senior Business Analyst — eCommerce', company: 'Article', period: '2022–2024', note: 'A/B Testing, Revenue Analytics, Heap', current: false },
  { role: 'Data Analyst II — Business Intelligence', company: 'Article', period: '2021–2022', note: 'KPI Dashboards, Revenue Modeling', current: false },
  { role: 'Business Analyst — Org Excellence', company: 'Article', period: '2020–2021', note: 'Automation, Dashboards, Business Cases', current: false },
  { role: 'Junior Business Analyst', company: 'SFU Segal School of Business', period: '2019–2020', note: 'Salesforce, Financial Modeling', current: false },
  { role: 'IT Support Specialist', company: 'Simon Fraser University', period: '2018–2019', note: 'System Administration, Technical Support', current: false },
]

export default function About() {
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
    <section id="about" ref={ref} style={{ padding: '120px 24px', position: 'relative' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="fade-section" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>/about</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <h2 className="fade-section" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.15, maxWidth: '700px', marginBottom: '28px' }}>
          Analytics should move from{' '}
          <span className="gradient-text-static">dashboards</span> to{' '}
          <span className="gradient-text-static">conversational intelligence.</span>
        </h2>

        <div className="fade-section" style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.75, fontWeight: 300, maxWidth: '600px', marginBottom: '56px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p>I lead a team of analysts at Article, building the data infrastructure that powers decisions across ecommerce, merchandising, and operations. But I&apos;m not interested in just building more dashboards.</p>
          <p>I&apos;m building <span style={{ color: 'var(--text-strong)' }}>AI assistants</span> — systems that let anyone in the business query enterprise data using natural language. Systems that replaced 20+ static reports with 100+ weekly AI-driven conversations.</p>
          <p>My background spans analytics engineering, experimentation, BI, and data modeling. My focus is the future: AI-native analytics workflows.</p>
        </div>

        <div className="fade-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '64px' }}>
          {pillars.map((p) => (
            <div key={p.title} className="card-glass" style={{ borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '20px', color: 'var(--cyan)', opacity: 0.6, marginBottom: '14px' }}>{p.icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text-strong)', marginBottom: '8px' }}>{p.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{p.body}</p>
            </div>
          ))}
        </div>

        <div className="fade-section">
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '24px' }}>Career Path</div>
          <div>
            {timeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', paddingBottom: i < timeline.length - 1 ? '28px' : '0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                    border: item.current ? '1px solid var(--cyan)' : '1px solid var(--border)',
                    background: item.current ? 'rgba(0,212,255,0.18)' : 'var(--surface)',
                    boxShadow: item.current ? '0 0 8px rgba(0,212,255,0.5)' : 'none',
                  }} />
                  {i < timeline.length - 1 && <div style={{ width: '1px', flex: 1, background: 'var(--border)', marginTop: '4px' }} />}
                </div>
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 600, color: item.current ? 'var(--text-strong)' : 'var(--text-muted)' }}>{item.role}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-faint)' }}>· {item.company}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-faint)' }}>{item.period}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>·</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.note}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
