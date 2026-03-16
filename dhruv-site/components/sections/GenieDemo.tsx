'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

const SAMPLE_QUESTIONS = [
  'What were our top 10 SKUs by revenue last week?',
  'How did conversion rate change after the checkout update?',
  'Compare online sales in cities with stores vs without',
]

const RESPONSES: Record<string, string> = {
  default: `Results\n\`\`\`\nCategory     Revenue    WoW Δ\n─────────────────────────\nSeating      $3.1M      +14%\nStorage      $2.2M      +6%\nLighting     $1.4M      -3%\nOutdoor      $980K      +22%\n\`\`\`\nKey insight: Outdoor showing the strongest growth. Seating leads on volume. Want me to drill in?`,
  conversion: `Checkout Conversion: Pre vs Post\n\`\`\`\nVariant       CVR      Lift\n───────────────────────────\nControl       3.21%    —\nTreatment B   3.74%    +16.5% ✓\n\`\`\`\nStatistically significant +16.5% lift. Projected annual impact: $2M+. Recommend full rollout.`,
  stores: `Halo Effect: Online Sales by Market\n\`\`\`\nMarket        Online Rev   YoY Δ\n────────────────────────────────\nStore mkts    $4.1M/wk     +22%\nDigital-only  $2.8M/wk     +14%\n\`\`\`\nStores generate ~+8.3 pts of incremental online lift per market.`,
  marketing: `New Customer Acquisition by Channel\n\`\`\`\nChannel        New Cust   ROAS\n──────────────────────────────\nPaid Social    12,400     4.2×\nOrganic SEO    9,800      ∞\nEmail          6,200      22×\n\`\`\`\nEmail is the highest ROAS channel. Organic is the hidden growth lever.`,
}

function getResp(q: string): string {
  const l = q.toLowerCase()
  if (l.includes('conversion') || l.includes('checkout')) return RESPONSES.conversion
  if (l.includes('store') || l.includes('cities') || l.includes('compare')) return RESPONSES.stores
  if (l.includes('marketing') || l.includes('channel')) return RESPONSES.marketing
  return RESPONSES.default
}

function FormattedMessage({ content }: { content: string }) {
  const parts = content.split(/```[\w]*\n?([\s\S]*?)```/g)
  return (
    <div>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: 'var(--text-body)', overflow: 'auto', whiteSpace: 'pre', margin: '8px 0' }}>{part.trim()}</pre>
        ) : (
          <div key={i} style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {part.split('\n').map((line, j) => <p key={j} style={line.startsWith('**') ? { fontWeight: 600, color: 'var(--text-strong)', marginTop: '6px' } : {}}>{line.replace(/\*\*/g, '')}</p>)}
          </div>
        )
      )}
    </div>
  )
}

export default function GenieDemo() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: "Hi — I'm **Genie**, your AI analytics assistant. Ask me anything about revenue, conversion, stores, or marketing performance." }])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Prevent browser auto-focusing this input and scrolling to it on load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) inputRef.current.blur()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('visible', e.isIntersecting)), { threshold: 0.05 })
    ref.current?.querySelectorAll('.fade-section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const sendMessage = async (q?: string) => {
    const text = q || input.trim()
    if (!text || thinking) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setThinking(true)
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 700))
    setThinking(false)
    setMessages((prev) => [...prev, { role: 'assistant', content: getResp(text) }])
  }

  return (
    <section id="genie" ref={ref} style={{ padding: 'clamp(60px,10vw,120px) clamp(16px,5vw,24px)', borderTop: '1px solid var(--border)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)' }} />
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="fade-section" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>/interactive</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>
        <span style={{ display: 'inline-block', fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '3px', border: '1px solid rgba(0,212,255,0.2)', color: 'var(--cyan)', background: 'rgba(0,212,255,0.05)', marginBottom: '14px' }}>Live Demo</span>
        <h2 className="fade-section" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem,5vw,3rem)', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '10px' }}>Ask Genie</h2>
        <p className="fade-section" style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.95rem,2vw,1.05rem)', maxWidth: '520px', fontWeight: 300, marginBottom: '32px' }}>A simulation of the AI analytics assistant I built on Databricks. Ask a business question — Genie queries the data and responds in plain English.</p>

        <div className="fade-section" style={{ border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--border)' }} />)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px', overflow: 'hidden' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399', flexShrink: 0, animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Genie · Enterprise Analytics · Databricks</span>
            </div>
          </div>
          <div style={{ height: '280px', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '88%', borderRadius: '10px', padding: '10px 14px', ...(m.role === 'user' ? { background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.22)', color: 'var(--cyan)' } : { background: 'var(--surface)', border: '1px solid var(--border)' }) }}>
                  {m.role === 'assistant' ? <FormattedMessage content={m.content} /> : <p style={{ fontSize: '13px' }}>{m.content}</p>}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(0,212,255,0.5)', animation: `bounce 1s ease-in-out ${i*0.15}s infinite` }} />)}
                  </div>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>Querying enterprise data...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px 16px 6px' }}>
            {SAMPLE_QUESTIONS.map((q) => (
              <button key={q} onClick={() => sendMessage(q)} disabled={thinking} style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', padding: '4px 10px', borderRadius: '100px', border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'transparent', cursor: 'pointer', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>{q}</button>
            ))}
          </div>
          <div style={{ padding: '6px 12px 12px' }}>
            <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--surface)' }}>
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Ask a business question..." disabled={thinking}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-body)', fontFamily: 'DM Mono, monospace', minWidth: 0 }} />
              <button onClick={() => sendMessage()} disabled={thinking || !input.trim()} style={{ padding: '4px 12px', fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: '4px', background: 'transparent', cursor: 'pointer', flexShrink: 0 }}>Send</button>
            </div>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-faint)', marginTop: '12px' }}>Simulated demo · Real Genie runs on Databricks with live enterprise data</p>
      </div>
    </section>
  )
}
