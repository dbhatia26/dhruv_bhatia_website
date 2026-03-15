'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

function DataNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1, pulse: Math.random() * Math.PI * 2,
    }))
    const packets: { from: number; to: number; t: number; speed: number }[] = []
    setInterval(() => {
      if (packets.length < 8) {
        const f = Math.floor(Math.random() * nodes.length)
        const t = Math.floor(Math.random() * nodes.length)
        if (f !== t) packets.push({ from: f, to: t, t: 0, speed: 0.008 + Math.random() * 0.006 })
      }
    }, 600)
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      nodes.forEach((n) => { n.x += n.vx; n.y += n.vy; n.pulse += 0.02; if (n.x < 0 || n.x > canvas.width) n.vx *= -1; if (n.y < 0 || n.y > canvas.height) n.vy *= -1 })
      nodes.forEach((a, i) => nodes.forEach((b, j) => {
        if (j <= i) return
        const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 160) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(0,212,255,${0.04 * (1 - dist / 160)})`; ctx.lineWidth = 0.5; ctx.stroke() }
      }))
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i]; p.t += p.speed
        if (p.t >= 1) { packets.splice(i, 1); continue }
        const a = nodes[p.from], b = nodes[p.to]
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${0.8 * (1 - Math.abs(p.t - 0.5) * 2)})`
        ctx.shadowColor = 'rgba(0,212,255,0.8)'; ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0
      }
      nodes.forEach((n) => {
        const glow = (Math.sin(n.pulse) + 1) * 0.5
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${0.2 + glow * 0.4})`
        ctx.shadowColor = 'rgba(0,212,255,0.5)'; ctx.shadowBlur = 4 + glow * 6; ctx.fill(); ctx.shadowBlur = 0
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.55 }} />
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export default function Hero() {
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  return (
    <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: '60px' }} className="grid-bg">
      <style>{`
        @keyframes ring-spin { to { transform: rotate(360deg); } }
        .headshot-ring { animation: ring-spin 4s linear infinite; }
        @keyframes hero-bounce { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        .hero-bounce { animation: hero-bounce 2s ease-in-out infinite; }
      `}</style>
      <DataNetworkCanvas />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0,212,255,0.07) 0%, transparent 70%)' }} />
      <div className="hero-fade" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', pointerEvents: 'none', background: 'linear-gradient(to top, var(--bg), transparent)' }} />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>

        {/* Headshot */}
        <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 24px' }}>
          <div className="headshot-ring" style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', background: 'conic-gradient(#00d4ff, #818cf8, #7c3aed, #818cf8, #00d4ff)' }} />
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--bg)', boxShadow: '0 0 28px rgba(0,212,255,0.25)' }}>
            <Image src="/headshot.jpg" alt="Dhruv Bhatia" fill style={{ objectFit: 'cover', objectPosition: 'center 15%' }} />
          </div>
        </div>

        {/* Status pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', border: '1px solid var(--border)', background: 'var(--surface)', marginBottom: '32px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-faint)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Vancouver, CA</span>
        </div>

        {/* Name */}
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.8rem,6vw,5rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '20px', whiteSpace: 'nowrap' }}>
          <span style={{ color: 'var(--text-strong)' }}>Dhruv</span>{' '}
          <span className="gradient-text">Bhatia</span>
        </h1>

        {/* Role */}
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '24px' }}>
          Lead Business Analyst · Data Operations
        </p>

        {/* Statement */}
        <p style={{ fontSize: 'clamp(1.1rem,2vw,1.35rem)', color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.65, fontWeight: 300 }}>
          Building AI-powered analytics systems that help organizations{' '}
          <span style={{ color: 'var(--text-strong)', fontWeight: 400 }}>make better decisions.</span>
        </p>

        {/* Metrics */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '36px', justifyContent: 'center', marginBottom: '44px' }}>
          {[{ value: '100+', label: 'AI queries / week' }, { value: '20+', label: 'Dashboards replaced' }, { value: '3×', label: 'Team multiplier' }].map((m) => (
            <div key={m.label} style={{ textAlign: 'center' }}>
              <div className="gradient-text-static" style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 700, lineHeight: 1, marginBottom: '4px' }}>{m.value}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '56px' }}>
          <button onClick={() => scrollToSection('work')} style={{ padding: '12px 24px', background: 'rgba(0,212,255,0.09)', border: '1px solid rgba(0,212,255,0.32)', color: 'var(--cyan)', fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: '5px', cursor: 'pointer', transition: 'all 0.2s' }}>
            View Work
          </button>
          <button onClick={() => scrollToSection('genie')} style={{ padding: '12px 24px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: '5px', cursor: 'pointer', transition: 'all 0.2s' }}>
            Try Genie Demo ↓
          </button>
        </div>

        {/* Scroll hint */}
        <div className="hero-bounce" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.4 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>scroll</span>
          <div style={{ width: '1px', height: '36px', background: 'linear-gradient(to bottom, var(--text-muted), transparent)' }} />
        </div>
      </div>
    </section>
  )
}
