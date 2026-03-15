'use client'

import { useEffect, useRef, useState } from 'react'

const projects = [
  {
    id: '01',
    title: 'Genie — AI Analytics Assistants',
    category: 'AI-Enabled Analytics',
    tags: ['Databricks', 'LLM', 'NLP', 'Genie Spaces'],
    problem:
      'Teams relied on analysts to answer every data question. Dashboard sprawl meant 20+ reports, each requiring maintenance and context.',
    system:
      'Built AI assistants ("Genies") on Databricks that allow any team to query curated enterprise datasets using plain English. Each Genie is scoped to a business domain — ecommerce, inventory, ops — with tuned prompts and trusted data models underneath.',
    impact: [
      '100+ AI-driven analytics conversations per week',
      'Replaced 20+ static dashboards',
      'Self-serve analytics for non-technical teams',
      'Reduced analyst interrupt load by ~40%',
    ],
    accent: '#00d4ff',
  },
  {
    id: '02',
    title: 'Halo Effect Measurement System',
    category: 'Decision Intelligence',
    tags: ['Statistics', 'SQL', 'Python', 'A/B Testing'],
    problem:
      'No reliable way to measure whether opening a physical store boosted local online sales — or cannibalized them.',
    system:
      'Designed a geo-holdout experimentation framework using matched markets. Built a synthetic control model to isolate the net effect of new store openings on localized digital revenue.',
    impact: [
      'Quantified incremental online lift from physical stores',
      'Informed real estate strategy and store expansion plans',
      'First data-backed model for omnichannel ROI',
    ],
    accent: '#818cf8',
  },
  {
    id: '03',
    title: 'Checkout Experimentation Platform',
    category: 'Experimentation & Growth',
    tags: ['A/B Testing', 'Heap', 'SQL', 'Databricks'],
    problem:
      'Checkout UX changes were being shipped without statistical validation, leading to revenue risk and inconclusive learnings.',
    system:
      'Built end-to-end A/B testing infrastructure — from experiment design through data collection to significance reporting. Led multiple checkout experiments measuring conversion and AOV.',
    impact: [
      'Identified changes saving $M annually',
      'Established rigorous experimentation culture',
      'Enabled faster, safer product decisions',
    ],
    accent: '#34d399',
  },
  {
    id: '04',
    title: 'Universal Revenue Data Model',
    category: 'Analytics Infrastructure',
    tags: ['DBT', 'SQL', 'Databricks', 'Data Modeling'],
    problem:
      'Multiple reports pulling from different source tables produced conflicting revenue numbers — no single source of truth.',
    system:
      'Designed a universal revenue model in DBT that unified all revenue sources, channel logic, and adjustment rules. Aligned 8+ downstream reports to a single canonical model.',
    impact: [
      'Eliminated revenue discrepancies across teams',
      'Reduced reporting maintenance overhead',
      'Became the trusted baseline for finance and exec reporting',
    ],
    accent: '#f59e0b',
  },
]

export default function Work() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    )
    ref.current?.querySelectorAll('.fade-section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const p = projects[active]

  return (
    <section id="work" ref={ref} className="py-32 px-6 relative">
      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <div className="fade-section mb-6 flex items-center gap-3" style={{ transitionDelay: '0ms' }}>
          <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs tracking-widest uppercase text-white/20">
            /work
          </span>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>

        <h2
          className="fade-section text-4xl sm:text-5xl font-bold text-white/90 mb-3"
          style={{ fontFamily: 'Syne, sans-serif', transitionDelay: '100ms' }}
        >
          Data Products
        </h2>
        <p
          className="fade-section text-white/40 text-lg mb-16 max-w-xl font-light"
          style={{ transitionDelay: '150ms' }}
        >
          Each project is a system — designed to outlast any single report or query.
        </p>

        {/* Tabs */}
        <div
          className="fade-section flex flex-wrap gap-2 mb-10"
          style={{ transitionDelay: '200ms' }}
        >
          {projects.map((pr, i) => (
            <button
              key={pr.id}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded text-xs font-mono tracking-wider uppercase transition-all ${
                active === i
                  ? 'bg-white/[0.06] text-white border border-white/[0.12]'
                  : 'text-white/30 border border-white/[0.04] hover:text-white/60 hover:border-white/[0.08]'
              }`}
            >
              {pr.id} {pr.title.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Active project */}
        <div
          className="fade-section grid grid-cols-1 lg:grid-cols-5 gap-0 card-glass rounded-2xl overflow-hidden"
          style={{ transitionDelay: '250ms' }}
          key={active}
        >
          {/* Left */}
          <div
            className="lg:col-span-2 p-8 border-b lg:border-b-0 lg:border-r border-white/[0.05]"
            style={{ borderColor: `${p.accent}15` }}
          >
            <div
              className="text-5xl font-bold mb-4"
              style={{ fontFamily: 'Syne, sans-serif', color: `${p.accent}30` }}
            >
              {p.id}
            </div>
            <div className="tag mb-4" style={{ borderColor: `${p.accent}40`, color: p.accent, background: `${p.accent}08` }}>
              {p.category}
            </div>
            <h3
              style={{ fontFamily: 'Syne, sans-serif' }}
              className="text-xl font-bold text-white/90 mb-6 leading-snug"
            >
              {p.title}
            </h3>

            <div className="flex flex-wrap gap-2 mb-8">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-mono px-2 py-1 rounded border border-white/[0.06] text-white/30"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Impact */}
            <div>
              <div
                style={{ fontFamily: 'DM Mono, monospace' }}
                className="text-xs tracking-widest uppercase mb-3"
                style={{ color: p.accent, opacity: 0.7 }}
              >
                Impact
              </div>
              <ul className="space-y-2">
                {p.impact.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                    <span style={{ color: p.accent }} className="mt-1 opacity-60 flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-3 p-8 space-y-8">
            <div>
              <div
                style={{ fontFamily: 'DM Mono, monospace' }}
                className="text-xs tracking-widest uppercase text-white/20 mb-3"
              >
                Problem
              </div>
              <p className="text-white/60 leading-relaxed text-sm">{p.problem}</p>
            </div>
            <div className="w-full h-px bg-white/[0.05]" />
            <div>
              <div
                style={{ fontFamily: 'DM Mono, monospace' }}
                className="text-xs tracking-widest uppercase text-white/20 mb-3"
              >
                System Built
              </div>
              <p className="text-white/60 leading-relaxed text-sm">{p.system}</p>
            </div>

            {/* Visual accent */}
            <div
              className="rounded-xl p-5 mt-4"
              style={{ background: `${p.accent}06`, border: `1px solid ${p.accent}15` }}
            >
              <div
                style={{ fontFamily: 'DM Mono, monospace', color: p.accent }}
                className="text-xs tracking-widest uppercase opacity-60 mb-3"
              >
                Architecture snapshot
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['Source Tables', '→', 'DBT Models', '→', p.tags[0], '→', 'AI / Dashboard'].map((node, i) => (
                  <span
                    key={i}
                    className={`text-xs font-mono ${
                      node === '→'
                        ? 'text-white/20'
                        : 'px-2 py-1 rounded border border-white/[0.08] text-white/50'
                    }`}
                  >
                    {node}
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
