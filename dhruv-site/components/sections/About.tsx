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
      { threshold: 0.1 }
    )
    ref.current?.querySelectorAll('.fade-section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" ref={ref} className="py-32 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="fade-section mb-6 flex items-center gap-3">
          <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs tracking-widest uppercase opacity-20">/about</span>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>
        <h2 className="fade-section text-4xl sm:text-5xl font-bold leading-tight max-w-3xl mb-8" style={{ fontFamily: 'Syne, sans-serif' }}>
          Analytics should move from{' '}
          <span className="gradient-text-static">dashboards</span> to{' '}
          <span className="gradient-text-static">conversational intelligence.</span>
        </h2>
        <div className="fade-section space-y-4 text-lg font-light max-w-2xl mb-16 text-white/50">
          <p>I lead a team of analysts at Article, building the data infrastructure that powers decisions across ecommerce, merchandising, and operations. But I'm not interested in just building more dashboards.</p>
          <p>I'm building <span className="text-white/85">AI assistants</span> — systems that let anyone in the business query enterprise data using natural language. Systems that replaced 20+ static reports with 100+ weekly AI-driven conversations.</p>
          <p>My background spans analytics engineering, experimentation, BI, and data modeling. My focus is the future: AI-native analytics workflows.</p>
        </div>
        <div className="fade-section grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          {pillars.map((p) => (
            <div key={p.title} className="card-glass rounded-xl p-6">
              <div className="text-cyan-400 text-2xl mb-4 opacity-60">{p.icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-sm font-semibold text-white/80 mb-3">{p.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="fade-section">
          <div style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs text-white/20 tracking-widest uppercase mb-6">Career Path</div>
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-6 pb-8 last:pb-0">
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-2.5 h-2.5 rounded-full border flex-shrink-0 ${item.current ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_8px_rgba(0,212,255,0.5)]' : 'border-white/20 bg-white/5'}`} />
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-white/[0.06] mt-1" />}
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <span style={{ fontFamily: 'Syne, sans-serif' }} className={`text-sm font-semibold ${item.current ? 'text-white' : 'text-white/60'}`}>{item.role}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs text-white/25">· {item.company}</span>
                  </div>
                  <div className="flex gap-3 items-center flex-wrap">
                    <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs text-white/20">{item.period}</span>
                    <span className="text-xs text-white/25">·</span>
                    <span className="text-xs text-white/30">{item.note}</span>
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
