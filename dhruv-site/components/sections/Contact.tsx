'use client'

import { useEffect, useRef } from 'react'

export default function Contact() {
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
    <section id="contact" ref={ref} style={{ padding: '140px 24px', textAlign: 'center', borderTop: '1px solid var(--border)', position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '400px', pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 50% at 50% 100%, var(--shadow-glow) 0%, transparent 70%)' }} />
      <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 className="fade-section" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.1, marginBottom: '24px' }}>
          Let&apos;s Build Something <span className="gradient-text-static">Together.</span>
        </h2>
        <p className="fade-section" style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 44px', lineHeight: 1.65, fontWeight: 300 }}>
          Interested in AI-driven analytics systems, conversational data products, or building decision infrastructure? I&apos;d love to connect.
        </p>
        <div className="fade-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '48px' }}>
          <a href="mailto:hummardhruv@gmail.com" style={{
            padding: '12px 24px', background: 'rgba(0,212,255,0.09)', border: '1px solid rgba(0,212,255,0.32)',
            color: 'var(--cyan)', fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.14em',
            textTransform: 'uppercase', borderRadius: '5px', textDecoration: 'none', transition: 'all 0.2s',
          }}>Send a Message</a>
          <a href="https://www.linkedin.com/in/druvbhatia/" target="_blank" rel="noopener noreferrer" style={{
            padding: '12px 24px', background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.14em',
            textTransform: 'uppercase', borderRadius: '5px', textDecoration: 'none', transition: 'all 0.2s',
          }}>LinkedIn</a>
        </div>
        <div className="fade-section" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '36px' }}>
          {[{ label: 'Location', value: 'Vancouver, Canada' }, { label: 'Role', value: 'Lead Business Analyst' }, { label: 'Focus', value: 'AI × Analytics' }].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
