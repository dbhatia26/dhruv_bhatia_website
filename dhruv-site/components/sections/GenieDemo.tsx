'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'assistant'
  content: string
  thinking?: boolean
}

const SAMPLE_QUESTIONS = [
  'What were our top 10 SKUs by revenue last week?',
  'How did conversion rate change after the checkout update?',
  'Compare online sales in cities with stores vs without',
  'Show me the return rate trend by product category',
  'Which marketing channel drove the most new customers?',
]

const CANNED_RESPONSES: Record<string, string> = {
  default: `I've queried the enterprise dataset and found the following:\n\n**Results**\n\`\`\`\nCategory         Revenue    WoW Δ\n───────────────────────────────\nSeating          $3.1M      +14%\nDenim            $1.8M      +3%\nFootwear         $1.2M      -5%\nAccessories      $890K      +18%\n\`\`\`\n\nKey insight: Accessories is showing the strongest growth this week. Knitwear continues to outperform — likely seasonal. Footwear decline may warrant investigation into inventory depth.\n\nWant me to drill into any category?`,
  conversion: `Analyzing checkout conversion data across the experiment window...\n\n**Checkout Conversion: Pre vs Post**\n\`\`\`\nVariant         CVR      Lift     Significance\n───────────────────────────────────────────\nControl         3.21%    —        —\nTreatment B     3.74%    +16.5%   p < 0.01 ✓\n\`\`\`\n\nThe redesigned checkout flow shows a statistically significant +16.5% lift in conversion. Projected annual revenue impact: **$2M+** at current traffic volumes.\n\nThis experiment has reached 95% confidence. Recommend full rollout.`,
  stores: `Running geo-level analysis comparing markets with and without physical presence...\n\n**Halo Effect: Online Sales by Market Type**\n\`\`\`\nMarket Type     Online Rev   YoY Δ    vs Baseline\n──────────────────────────────────────────────────\nStore markets   $4.1M/wk     +22%     +8.3 pts\nDigital-only    $2.8M/wk     +14%     baseline\n\`\`\`\n\nStores are generating a measurable halo effect on local digital sales — approximately **+8.3 percentage points** of incremental online lift per market. This supports continued physical expansion as an omnichannel growth lever.`,
  return: `Pulling return rate data from the returns data model...\n\n**Return Rate by Category (Last 90 Days)**\n\`\`\`\nCategory         Return %   Trend\n─────────────────────────────────\nDenim            18.2%      ↑ +2.1pts\nFootwear         14.7%      → flat\nKnitwear         9.3%       ↓ -0.8pts\nAccessories      6.1%       ↓ -1.2pts\n\`\`\`\n\nDenim return rate is trending up — this often correlates with sizing issues or photography inaccuracies. Recommend a content audit on denim PDPs and a fit guide review.`,
  marketing: `Analyzing attribution data across all acquisition channels...\n\n**New Customer Acquisition by Channel (Last 30 Days)**\n\`\`\`\nChannel          New Cust   CAC     ROAS\n────────────────────────────────────────\nPaid Social      12,400     $31     4.2×\nSEO / Organic    9,800      $0      ∞\nEmail            6,200      $4      22×\nPaid Search      4,100      $48     2.9×\nDirect           3,300      $0      ∞\n\`\`\`\n\nEmail remains the highest ROAS channel. Paid Social drives volume but CAC is rising — worth monitoring. Organic search is the hidden growth lever; content investment would compound well.`,
}

function getResponse(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('conversion') || q.includes('checkout')) return CANNED_RESPONSES.conversion
  if (q.includes('store') || q.includes('cities') || q.includes('halo')) return CANNED_RESPONSES.stores
  if (q.includes('return')) return CANNED_RESPONSES.return
  if (q.includes('marketing') || q.includes('channel') || q.includes('acquisition')) return CANNED_RESPONSES.marketing
  return CANNED_RESPONSES.default
}

function FormattedMessage({ content }: { content: string }) {
  const parts = content.split(/```[\w]*\n?([\s\S]*?)```/g)
  return (
    <div className="space-y-3">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 text-xs font-mono text-white/70 overflow-x-auto whitespace-pre"
          >
            {part.trim()}
          </pre>
        ) : (
          <div key={i} className="text-sm text-white/60 leading-relaxed">
            {part.split('\n').map((line, j) => (
              <p key={j} className={line.startsWith('**') ? 'font-semibold text-white/80 mt-2' : ''}>
                {line.replace(/\*\*/g, '')}
              </p>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export default function GenieDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi — I'm **Genie**, your AI analytics assistant. Ask me anything about revenue, conversion, stores, or marketing performance. I'll query the enterprise data and respond in seconds.",
    },
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    )
    ref.current?.querySelectorAll('.fade-section').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const sendMessage = async (text?: string) => {
    const q = text || input.trim()
    if (!q || isThinking) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    setIsThinking(true)

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800))

    setIsThinking(false)
    setMessages((prev) => [...prev, { role: 'assistant', content: getResponse(q) }])
  }

  return (
    <section id="genie" ref={ref} className="py-32 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <div className="fade-section mb-6 flex items-center gap-3" style={{ transitionDelay: '0ms' }}>
          <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs tracking-widest uppercase text-white/20">
            /interactive
          </span>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>

        <div className="fade-section mb-4" style={{ transitionDelay: '100ms' }}>
          <div className="tag mb-4">Live Demo</div>
          <h2
            style={{ fontFamily: 'Syne, sans-serif' }}
            className="text-4xl sm:text-5xl font-bold text-white/90 mb-3"
          >
            Ask Genie
          </h2>
          <p className="text-white/40 text-lg max-w-xl font-light">
            This is a simulation of the AI analytics assistant I built on Databricks.
            Ask a business question — Genie queries the data and responds in plain English.
          </p>
        </div>

        {/* Chat window */}
        <div
          className="fade-section card-glass rounded-2xl overflow-hidden"
          style={{ transitionDelay: '200ms' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.05]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
            </div>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs text-white/40">
                Genie · Enterprise Analytics Assistant · Databricks
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    m.role === 'user' ? 'chat-user' : 'chat-ai'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <FormattedMessage content={m.content} />
                  ) : (
                    <p className="text-sm text-cyan-100/80">{m.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="chat-ai rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs text-white/30">
                      Querying enterprise data...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          <div className="px-6 pb-3 flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={isThinking}
                className="text-xs font-mono px-3 py-1.5 rounded-full border border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/[0.12] transition-all disabled:opacity-40 truncate max-w-[200px]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 pb-4">
            <div className="flex gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 focus-within:border-cyan-400/30 transition-colors">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask a business question..."
                disabled={isThinking}
                className="flex-1 bg-transparent text-sm text-white/70 placeholder:text-white/20 outline-none font-mono"
              />
              <button
                onClick={() => sendMessage()}
                disabled={isThinking || !input.trim()}
                className="px-3 py-1 text-xs font-mono tracking-wider uppercase text-cyan-400 border border-cyan-400/30 rounded hover:bg-cyan-400/10 transition-all disabled:opacity-30"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Context note */}
        <p
          className="fade-section text-center text-xs text-white/20 font-mono mt-6"
          style={{ transitionDelay: '300ms' }}
        >
          Simulated demo · Real Genie runs on Databricks with live enterprise data
        </p>
      </div>
    </section>
  )
}
