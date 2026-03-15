import { getAllPosts } from '@/lib/posts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ideas — Dhruv Bhatia',
  description: 'Thoughts on AI analytics, decision intelligence, and the future of BI.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ marginBottom: '60px' }}>
          <p
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
              marginBottom: '16px',
            }}
          >
            /ideas
          </p>
          <h1
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.88)',
              marginBottom: '12px',
            }}
          >
            Thinking Out Loud
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: 300 }}>
            Notes on AI analytics, decision systems, and the future of BI.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {posts.map((post) => (
            <article
              key={post.slug}
              style={{
                padding: '24px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.75)',
                      marginBottom: '8px',
                      lineHeight: 1.4,
                    }}
                  >
                    {post.title}
                  </h2>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.38)',
                      lineHeight: 1.6,
                      marginBottom: '12px',
                    }}
                  >
                    {post.excerpt}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: 'DM Mono, monospace',
                          fontSize: '10px',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          border: '1px solid rgba(0,212,255,0.2)',
                          color: 'rgba(0,212,255,0.7)',
                          background: 'rgba(0,212,255,0.05)',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.2)',
                    whiteSpace: 'nowrap',
                    paddingTop: '2px',
                  }}
                >
                  {new Date(post.date).toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
