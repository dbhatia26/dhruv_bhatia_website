'use client'

import { useEffect, useRef, useState } from 'react'

const ideas = [
  { id: '001', date: 'Mar 2025', title: 'The Dashboard is Dead. Long Live the Conversation.', excerpts: ['Static dashboards are artifacts of a world where data was hard to access. In a world with LLMs, the interface is a question. The answer is a query. The dashboard is just the fallback.'], tags: ['AI Analytics', 'Future of BI'] },
  { id: '002', date: 'Feb 2025', title: 'Why Most Analytics Teams Are Building the Wrong Things', excerpts: ['Teams obsess over beautiful visualizations and miss the point. Analytics value is in the decision it enables, not the dashboard it produces. Build for action, not for insight theater.'], tags: ['Decision Intelligence', 'Strategy'] },
  { id: '003', date: 'Jan 2025', title: 'Prompt Engineering is Analytics Engineering', excerpts: ['The skills that make a great data analyst — understanding data semantics, knowing what question is actually being asked — are exactly the skills that make a great prompt engineer.'], tags: ['AI', 'Analytics Engineering'] },
  { id: '004', date: 'Dec 2024', title: 'On Building Trusted Datasets', excerpts: ["You can build the most sophisticated AI assistant in the world. If the underlying data isn't trusted, your AI is just a confident liar. Data trust is the foundation everything else sits on."], tags: ['Data Quality', 'Data Modeling'] },
  { id: '005', date: 'Mar 2026', title: 'Intellectual Tourism Is No Longer a Waste of Time', excerpts: ['In experimentation, we always fought to keep teams focused on one primary metric. Everything else — the curiosity clicks, the tangential signals — we called intellectual tourism. Curiosity without commitment.', 'But intellectual tourism was never the real problem. Analyst bandwidth was.', 'Conversational AI changes that entirely. When anyone can ask any question instantly, curiosity becomes cheap. The tourism is finally free — and we should be designing systems that enable it, not policing it.'], tags: ['Experimentation', 'AI Analytics', 'Self-Serve'] },
  { id: '006', date: 'Mar 2026', title: 'The Age of Vibe Analytics', excerpts: ['Vibe coding let developers ship by feel — prompt, iterate, trust the model. Analytics is next.', "But there's a catch nobody is saying loudly enough. Bad code breaks visibly. A wrong analytics answer looks identical to a right one — confident, formatted, fast.", "The floor of vibe analytics isn't the AI model. It's governance. Semantic layers, certified datasets, curated contexts. The teams that win won't have the best models — they'll have the most trustworthy foundations underneath them."], tags: ['AI Analytics', 'Governance', 'Future of BI'] },
]

function IdeaCard({ idea, isExpanded, onToggle }: { idea: typeof ideas[0], isExpanded: boolean, onToggle: () => void }) {
  return (
    <article
      onClick={onToggle}
      style={{ background: 'var(--surface)', border: `1px solid ${isExpanded ? 'rgba(0,212,255,0.22)' : 'var(--border)'}`, borderRadius: '12px', padding: 'clamp(16px,3vw,24px)', cursor: 'pointer', transition: 'all 0.35s ease', display: 'flex', flexDirection: 'column', minHeight: '200px', transform: isExpanded ? 'translateY(-3px)' : 'none', boxShadow: isExpanded ? '0 12px 32px rgba(0,0,0,0.15)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '16px', color: 'var(--text-faint)' }}>{idea.id}</span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-faint)' }}>{idea.date}</span>
      </div>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: isExpanded ? 'var(--text-strong)' : 'var(--text-body)', lineHeight: 1.4, marginBottom: '10px', flexShrink: 0, transition: 'color 0.2s' }}>{idea.title}</h3>
      <div style={{ flex: 1, overflow: isExpanded ? 'visible' : 'hidden', display: isExpanded ? 'block' : '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 3, WebkitBoxOrient: 'vertical' as const }}>
        {idea.excerpts.map((p, i) => <p key={i} style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: i < idea.excerpts.length - 1 ? '8px' : '0' }}>{p}</p>)}
      </div>
      {!isExpanded && <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(0,212,255,0.5)', marginTop: '10px', flexShrink: 0 }}>Tap to read more ↓</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px', flexShrink: 0 }}>
        {idea.tags.map((t) => <span key={t} className="tag">{t}</span>)}
      </div>
    </article>
  )
}

export default function Ideas() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('visible', e.isIntersecting)), { threshold: 0.05 })
    ref.current?.querySelectorAll('.fade-section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleToggle = (id: string) => {
    setActiveId(prev => prev === id ? null : id)
  }
  return (
    <section id="ideas" ref={ref} style={{ padding: 'clamp(60px,10vw,120px) clamp(16px,5vw,24px)', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="fade-section" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>/ideas</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>
        <h2 className="fade-section" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '10px' }}>Thinking Out Loud</h2>
        <p className="fade-section" style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 300, marginBottom: '36px' }}>Short thoughts on the future of analytics, AI, and decision systems.</p>
        <style>{`.ideas-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;align-items:start}@media(max-width:640px){.ideas-grid{grid-template-columns:1fr}}`}</style>
        <div className="fade-section ideas-grid">
          {ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} isExpanded={activeId === idea.id} onToggle={() => handleToggle(idea.id)} />)}
        </div>
      </div>
    </section>
  )
}
