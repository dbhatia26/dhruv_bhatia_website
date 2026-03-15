'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Speaking() {
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
    <section id="speaking" ref={ref} style={{ padding: '120px 24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="fade-section" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>/speaking</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <div className="fade-section" style={{ marginBottom: '14px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '100px',
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)',
            fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '16px',
          }}>● Live Event</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '12px' }}>Databricks AI Day</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', fontWeight: 300, lineHeight: 1.65 }}>
            Presented <em>&ldquo;Beyond the BI Ticket: From Reports to Conversations&rdquo;</em> to a packed audience of 250+ data leaders — making the case for AI-native analytics and conversational data access over static dashboards.
          </p>
        </div>

        <div className="fade-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {[
            { src: '/talk1.png', caption: 'Beyond the BI Ticket: From Reports to Conversations · Databricks AI Day' },
            { src: '/talk2.png', caption: 'Full room · 250+ attendees · Databricks AI Day Vancouver, March 2026' },
          ].map((photo) => (
            <div key={photo.src} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative', aspectRatio: '4/3' }}>
              <Image src={photo.src} alt={photo.caption} fill style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px', background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{photo.caption}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="fade-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {[
            { val: '250+', label: 'Attendees' },
            { val: 'Databricks', label: 'Event Host' },
            { val: 'Mar 12, 2026', label: 'AI Day Vancouver' },
          ].map((stat, i) => (
            <div key={stat.label} style={{ padding: '18px 20px', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div className="gradient-text-static" style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>{stat.val}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
