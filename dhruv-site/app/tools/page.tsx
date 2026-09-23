import type { Metadata } from 'next'
import Nav from '@/components/ui/Nav'
import Footer from '@/components/ui/Footer'

export const metadata: Metadata = {
  title: 'Tools — Dhruv Bhatia',
  description:
    'Free, single-purpose tools for things software companies charge a monthly subscription for. Everything runs in your browser.',
}

type Tool = {
  name: string
  href: string
  accent: string
  category: string
  summary: string
  replaces: string
  tags: string[]
  live: boolean
}

const tools: Tool[] = [
  {
    name: 'Signing Desk',
    href: '/tools/pdf-signer/index.html',
    accent: '#00d4ff',
    category: 'Documents',
    summary:
      'Draw or type a signature, place it anywhere on a PDF, add text boxes, and save. The document is opened and written inside your browser, so it is never uploaded and the tool works with the network off.',
    replaces: 'Acrobat Pro',
    tags: ['PDF', 'Works offline', 'No account'],
    live: true,
  },
  {
    name: 'Running Tab',
    href: '/tools/running-tab',
    accent: '#ff8b7b',
    category: 'Travel',
    summary:
      'Split expenses with friends on a trip. Equal, exact, percent or shares splits, multi-currency with live exchange rates, balances that simplify into the fewest payments. A shared link is the whole login, no account to make.',
    replaces: 'Splitwise',
    tags: ['No account', 'Multi-currency'],
    live: true,
  },
]

export default function ToolsPage() {
  return (
    <main id="top">
      <Nav />

      <section
        style={{
          padding: 'clamp(120px,14vw,180px) clamp(16px,5vw,24px) clamp(60px,10vw,120px)',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
                whiteSpace: 'nowrap',
              }}
            >
              /tools
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <h1
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(1.8rem,5vw,3rem)',
              fontWeight: 700,
              color: 'var(--text-strong)',
              lineHeight: 1.15,
              marginBottom: '10px',
              maxWidth: '18ch',
            }}
          >
            Basic things should not cost a subscription.
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.05rem',
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: '62ch',
              marginBottom: '14px',
            }}
          >
            Signing a document. Cropping an image. Converting a file. These are solved
            problems that somewhere along the way turned into monthly bills.
          </p>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.05rem',
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: '62ch',
              marginBottom: '40px',
            }}
          >
            Each tool here does one of them, free, with no account and no upload. Your
            files stay on your machine, which for anything sensitive is the part that
            actually matters.
          </p>

          {/* Tool list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tools.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                className="tool-card"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  background: 'var(--surface)',
                  padding: 'clamp(20px,4vw,28px)',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    border: `1px solid ${tool.accent}35`,
                    color: tool.accent,
                    background: `${tool.accent}08`,
                    marginBottom: '14px',
                  }}
                >
                  {tool.category}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <h2
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontSize: 'clamp(16px,3vw,20px)',
                      fontWeight: 700,
                      color: 'var(--text-strong)',
                      lineHeight: 1.3,
                      margin: 0,
                    }}
                  >
                    {tool.name}
                  </h2>
                  <span
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: '10px',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: tool.live ? tool.accent : 'var(--text-faint)',
                      opacity: 0.85,
                    }}
                  >
                    {tool.live ? 'Live' : 'In progress'}
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.7,
                    maxWidth: '70ch',
                    marginBottom: '18px',
                  }}
                >
                  {tool.summary}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'DM Mono, monospace',
                      padding: '3px 8px',
                      borderRadius: '3px',
                      border: `1px solid ${tool.accent}25`,
                      color: tool.accent,
                      opacity: 0.8,
                    }}
                  >
                    Replaces {tool.replaces}
                  </span>
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '11px',
                        fontFamily: 'DM Mono, monospace',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              maxWidth: '62ch',
              marginTop: '40px',
              paddingTop: '24px',
              borderTop: '1px solid var(--border)',
            }}
          >
            More coming. If you pay monthly for something that should not need a
            subscription, tell me and it might end up here.
          </p>
        </div>
      </section>

      <Footer />

      <style>{`
        .tool-card:hover {
          background: var(--card-hover-bg) !important;
          border-color: rgba(0,212,255,0.3) !important;
        }
      `}</style>
    </main>
  )
}
