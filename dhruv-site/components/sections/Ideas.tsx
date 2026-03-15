'use client'

import { useEffect, useRef } from 'react'

const ideas = [
  {
    id: '001', date: 'Mar 2025',
    title: 'The Dashboard is Dead. Long Live the Conversation.',
    excerpts: ['Static dashboards are artifacts of a world where data was hard to access. In a world with LLMs, the interface is a question. The answer is a query. The dashboard is just the fallback.'],
    tags: ['AI Analytics', 'Future of BI'],
  },
  {
    id: '002', date: 'Feb 2025',
    title: 'Why Most Analytics Teams Are Building the Wrong Things',
    excerpts: ['Teams obsess over beautiful visualizations and miss the point. Analytics value is in the decision it enables, not the dashboard it produces. Build for action, not for insight theater.'],
    tags: ['Decision Intelligence', 'Strategy'],
  },
  {
    id: '003', date: 'Jan 2025',
    title: 'Prompt Engineering is Analytics Engineering',
    excerpts: ['The skills that make a great data analyst — understanding data semantics, knowing what question is actually being asked — are exactly the skills that make a great prompt engineer.'],
    tags: ['AI', 'Analytics Engineering'],
  },
  {
    id: '004', date: 'Dec 2024',
    title: 'On Building Trusted Datasets',
    excerpts: ["You can build the most sophisticated AI assistant in the world. If the underlying data isn't trusted, your AI is just a confident liar. Data trust is the foundation everything else sits on."],
    tags: ['Data Quality', 'Data Modeling'],
  },
  {
    id: '005', date: 'Mar 2026',
    title: 'Intellectual Tourism Is No Longer a Waste of Time',
    excerpts: [
      'In experimentation, we always fought to keep teams focused on one primary metric. Everything else — the curiosity clicks, the tangential signals — we called intellectual tourism. Curiosity without commitment.',
      'But intellectual tourism was never the real problem. Analyst bandwidth was.',
      'Conversational AI changes that entirely. When anyone can ask any question instantly, curiosity becomes cheap. The tourism is finally free — and we should be designing systems that enable it, not policing it.',
    ],
    tags: ['Experimentation', 'AI Analytics', 'Self-Serve'],
  },
  {
    id: '006', date: 'Mar 2026',
    title: 'The Age of Vibe Analytics',
    excerpts: [
      'Vibe coding let developers ship by feel — prompt, iterate, trust the model. Analytics is next.',
      'But there\'s a catch nobody is saying loudly enough. Bad code breaks visibly. A wrong analytics answer looks identical to a right one — confident, formatted, fast.',
      'The floor of vibe analytics isn\'t the AI model. It\'s governance. Semantic layers, certified datasets, curated contexts. The teams that win won\'t have the best models — they\'ll have the most trustworthy foundations underneath them.',
    ],
    tags: ['AI Analytics', 'Governance', 'Future of BI'],
  },
]

export default function Ideas() {
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
    <section id="ideas" ref={ref} className="py-32 px-6 relative border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="fade-section mb-6 flex items-center gap-3">
          <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs tracking-widest uppercase opacity-20">/ideas</span>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="fade-section text-4xl sm:text-5xl font-bold text-white/90 mb-3">Thinking Out Loud</h2>
        <p className="fade-section text-white/40 text-lg mb-16 max-w-xl font-light">Short thoughts on the future of analytics, AI, and decision systems.</p>
        <div className="fade-section grid grid-cols-1 md:grid-cols-2 gap-4" style={{ alignItems: 'start' }}>
          {ideas.map((idea) => (
            <article key={idea.id} className="group card-glass rounded-xl p-7 cursor-pointer flex flex-col" style={{ minHeight: '220px' }}>
              <div className="flex items-start justify-between mb-5 flex-shrink-0">
                <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-white/15 text-lg font-light">{idea.id}</span>
                <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs text-white/20">{idea.date}</span>
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif' }} className="text-base font-bold text-white/80 group-hover:text-white transition-colors mb-3 leading-snug flex-shrink-0">{idea.title}</h3>
              {/* Excerpts — clamped, expand on hover */}
              <div className="overflow-hidden flex-1" style={{ WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical' as const }}>
                {idea.excerpts.map((p, i) => (
                  <p key={i} className="text-sm text-white/40 leading-relaxed mb-2 last:mb-0">{p}</p>
                ))}
              </div>
              {/* Read more hint — hidden on hover via group */}
              <p style={{ fontFamily: 'DM Mono, monospace' }} className="text-[10px] tracking-widest uppercase text-cyan-400/50 mt-3 flex-shrink-0 group-hover:opacity-0 group-hover:h-0 group-hover:mt-0 transition-all overflow-hidden">
                Hover to read more ↓
              </p>
              <div className="flex flex-wrap gap-2 mt-3 flex-shrink-0">
                {idea.tags.map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
