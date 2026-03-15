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
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.02
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
      })
      nodes.forEach((a, i) => nodes.forEach((b, j) => {
        if (j <= i) return
        const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 160) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(0,212,255,${0.04 * (1 - dist / 160)})`
          ctx.lineWidth = 0.5; ctx.stroke()
        }
      }))
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i]; p.t += p.speed
        if (p.t >= 1) { packets.splice(i, 1); continue }
        const a = nodes[p.from], b = nodes[p.to]
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t
        const alpha = 0.8 * (1 - Math.abs(p.t - 0.5) * 2)
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${alpha})`
        ctx.shadowColor = 'rgba(0,212,255,0.8)'; ctx.shadowBlur = 6
        ctx.fill(); ctx.shadowBlur = 0
      }
      nodes.forEach((n) => {
        const glow = (Math.sin(n.pulse) + 1) * 0.5
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${0.2 + glow * 0.4})`
        ctx.shadowColor = 'rgba(0,212,255,0.5)'; ctx.shadowBlur = 4 + glow * 6
        ctx.fill(); ctx.shadowBlur = 0
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" style={{ pointerEvents: 'none' }} />
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export default function Hero() {
  useEffect(() => {
    // Immediately force scroll to top on mount — overrides any hash/session restore
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
  }, [])

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg">
      <style>{`
        @keyframes ring-spin { to { transform: rotate(360deg); } }
        .headshot-ring { animation: ring-spin 4s linear infinite; }
        html.light .hero-fade { background: linear-gradient(to top, #faf8f5, transparent) !important; }
      `}</style>
      <DataNetworkCanvas />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0,212,255,0.07) 0%, transparent 70%)' }} />
      <div className="hero-fade absolute bottom-0 left-0 right-0 h-64 pointer-events-none" style={{ background: 'linear-gradient(to top, #0d0f13, transparent)' }} />
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Headshot */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="headshot-ring absolute inset-[-3px] rounded-full" style={{ background: 'conic-gradient(#00d4ff, #818cf8, #7c3aed, #818cf8, #00d4ff)' }} />
          <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_0_28px_rgba(0,212,255,0.3)]" style={{ border: '3px solid #0d0f13' }}>
            <Image src="/headshot.jpg" alt="Dhruv Bhatia" fill className="object-cover object-top" />
          </div>
        </div>
        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-10" style={{ fontFamily: 'DM Mono, monospace' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/40 tracking-widest uppercase">Vancouver, CA</span>
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif' }} className="text-6xl sm:text-8xl font-bold tracking-tight mb-6 leading-none">
          <span className="text-white/90">Dhruv</span> <span className="gradient-text">Bhatia</span>
        </h1>
        <p style={{ fontFamily: 'DM Mono, monospace' }} className="text-sm tracking-[0.25em] uppercase text-white/30 mb-8">
          Lead Business Analyst · Data Operations
        </p>
        <p className="text-xl sm:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12 font-light">
          Building AI-powered analytics systems that help organizations{' '}
          <span className="text-white/90">make better decisions.</span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 mb-14">
          {[
            { value: '100+', label: 'AI queries / week' },
            { value: '20+', label: 'Dashboards replaced' },
            { value: '3×', label: 'Team multiplier' },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <div style={{ fontFamily: 'Syne, sans-serif' }} className="text-3xl font-bold gradient-text-static">{m.value}</div>
              <div style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs text-white/30 tracking-widest uppercase mt-1">{m.label}</div>
            </div>
          ))}
        </div>
        {/* Buttons — using onClick instead of href hash to prevent auto-scroll on load */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => scrollToSection('work')}
            className="px-6 py-3 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-sm font-mono tracking-wider uppercase hover:bg-cyan-400/15 hover:border-cyan-400/60 transition-all rounded cursor-pointer"
          >
            View Work
          </button>
          <button
            onClick={() => scrollToSection('genie')}
            className="px-6 py-3 bg-white/[0.03] border border-white/[0.08] text-white/60 text-sm font-mono tracking-wider uppercase hover:bg-white/[0.06] hover:text-white/80 transition-all rounded cursor-pointer"
          >
            Try Genie Demo ↓
          </button>
        </div>
        <div className="mt-20 flex flex-col items-center gap-2 animate-bounce">
          <div style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs text-white/20 tracking-widest uppercase">scroll</div>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>
    </section>
  )
}
