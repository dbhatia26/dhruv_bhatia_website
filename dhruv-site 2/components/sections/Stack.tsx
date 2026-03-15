'use client'

import { useEffect, useRef } from 'react'

const stackLayers = [
  {
    layer: 'AI Layer',
    color: '#00d4ff',
    tools: [
      { name: 'Databricks Genie', desc: 'NL-to-SQL AI assistant' },
      { name: 'LLM Prompt Eng.', desc: 'Prompt design & tuning' },
      { name: 'Genie Spaces', desc: 'Domain-scoped AI contexts' },
    ],
  },
  {
    layer: 'Analytics & BI',
    color: '#818cf8',
    tools: [
      { name: 'Tableau', desc: 'Executive dashboards' },
      { name: 'Databricks SQL', desc: 'Ad-hoc & scheduled queries' },
      { name: 'Heap Analytics', desc: 'Web behavioral analytics' },
      { name: 'Google Analytics', desc: 'Digital marketing data' },
    ],
  },
  {
    layer: 'Data Engineering',
    color: '#34d399',
    tools: [
      { name: 'DBT', desc: 'Data transformation & modeling' },
      { name: 'Databricks', desc: 'Lakehouse platform' },
      { name: 'SQL', desc: 'Primary query language' },
      { name: 'Python', desc: 'Scripting & data processing' },
    ],
  },
  {
    layer: 'Experimentation',
    color: '#f59e0b',
    tools: [
      { name: 'A/B Testing', desc: 'Statistical experiment design' },
      { name: 'Synthetic Control', desc: 'Geo-based causal inference' },
      { name: 'JavaScript', desc: 'Web tracking & data layer' },
    ],
  },
]

const coreSkills = [
  'Analytics Engineering',
  'SQL · Python · JavaScript',
  'Databricks · DBT',
  'Business Intelligence',
  'Experimentation & A/B Testing',
  'Data Modeling',
  'AI-Enabled Analytics',
  'Prompt Engineering',
  'Decision Intelligence',
  'Data ETL',
  'Financial Forecasting',
  'X-Functional Leadership',
]

export default function Stack() {
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
    <section id="stack" ref={ref} className="py-32 px-6 relative">
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <div className="fade-section mb-6 flex items-center gap-3" style={{ transitionDelay: '0ms' }}>
          <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs tracking-widest uppercase text-white/20">
            /stack
          </span>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>

        <h2
          className="fade-section text-4xl sm:text-5xl font-bold text-white/90 mb-3"
          style={{ fontFamily: 'Syne, sans-serif', transitionDelay: '100ms' }}
        >
          Analytics Stack
        </h2>
        <p
          className="fade-section text-white/40 text-lg mb-16 max-w-xl font-light"
          style={{ transitionDelay: '150ms' }}
        >
          The tools and technologies behind the systems I build.
        </p>

        {/* Stack layers */}
        <div className="fade-section space-y-4 mb-20" style={{ transitionDelay: '200ms' }}>
          {stackLayers.map((layer) => (
            <div
              key={layer.layer}
              className="rounded-xl overflow-hidden"
              style={{ border: `1px solid ${layer.color}15`, background: `${layer.color}04` }}
            >
              <div
                className="px-5 py-3 flex items-center gap-3"
                style={{ borderBottom: `1px solid ${layer.color}10` }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: layer.color, boxShadow: `0 0 8px ${layer.color}` }} />
                <span
                  style={{ fontFamily: 'DM Mono, monospace', color: layer.color }}
                  className="text-xs tracking-widest uppercase opacity-80"
                >
                  {layer.layer}
                </span>
              </div>
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {layer.tools.map((tool) => (
                  <div key={tool.name} className="space-y-1">
                    <div
                      style={{ fontFamily: 'Syne, sans-serif' }}
                      className="text-sm font-semibold text-white/70"
                    >
                      {tool.name}
                    </div>
                    <div className="text-xs text-white/30">{tool.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Skills cloud */}
        <div className="fade-section" style={{ transitionDelay: '300ms' }}>
          <div
            style={{ fontFamily: 'DM Mono, monospace' }}
            className="text-xs tracking-widest uppercase text-white/20 mb-6"
          >
            Core Competencies
          </div>
          <div className="flex flex-wrap gap-2">
            {coreSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 text-xs font-mono rounded border border-white/[0.07] text-white/40 hover:text-white/70 hover:border-white/[0.15] transition-all cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="fade-section mt-16 card-glass rounded-xl p-6" style={{ transitionDelay: '350ms' }}>
          <div
            style={{ fontFamily: 'DM Mono, monospace' }}
            className="text-xs tracking-widest uppercase text-white/20 mb-4"
          >
            Education
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif' }} className="text-base font-bold text-white/80 mb-1">
                Bachelor of Business Administration
              </div>
              <div className="text-sm text-white/40">
                Beedie School of Business · Simon Fraser University
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Concentration: Management of Information Systems', 'Certificate: Business Technology Management', 'Teaching Assistant: Data & Decisions II'].map(
                  (item) => (
                    <span key={item} className="text-xs text-white/30 font-mono">
                      · {item}
                    </span>
                  )
                )}
              </div>
            </div>
            <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs text-white/20">
              2019 – 2023
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
