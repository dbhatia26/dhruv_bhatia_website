'use client'

import { useEffect, useRef } from 'react'

export default function Contact() {
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
    <section id="contact" ref={ref} className="py-40 px-6 relative">
      {/* Gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(0,212,255,0.06) 0%, transparent 70%)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.04]" />

      <div className="max-w-3xl mx-auto text-center">
        {/* Label */}
        <div
          className="fade-section inline-flex items-center gap-2 mb-10"
          style={{ transitionDelay: '0ms' }}
        >
          <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs tracking-widest uppercase text-white/20">
            /contact
          </span>
        </div>

        <h2
          className="fade-section text-4xl sm:text-6xl font-bold text-white/90 leading-tight mb-8"
          style={{ fontFamily: 'Syne, sans-serif', transitionDelay: '100ms' }}
        >
          Let's Build Something{' '}
          <span className="gradient-text">Together.</span>
        </h2>

        <p
          className="fade-section text-white/40 text-lg max-w-lg mx-auto mb-12 font-light leading-relaxed"
          style={{ transitionDelay: '150ms' }}
        >
          Interested in AI-driven analytics systems, conversational data products,
          or building decision infrastructure? I'd love to connect.
        </p>

        {/* CTA buttons */}
        <div
          className="fade-section flex flex-wrap items-center justify-center gap-4 mb-16"
          style={{ transitionDelay: '200ms' }}
        >
          <a
            href="mailto:hummardhruv@gmail.com"
            className="px-8 py-3.5 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 font-mono text-sm tracking-wider uppercase hover:bg-cyan-400/15 hover:border-cyan-400/60 transition-all rounded"
          >
            Send a Message
          </a>
          <a
            href="https://www.linkedin.com/in/druvbhatia/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 bg-white/[0.03] border border-white/[0.08] text-white/50 font-mono text-sm tracking-wider uppercase hover:text-white/80 hover:border-white/[0.15] transition-all rounded"
          >
            LinkedIn
          </a>
        </div>

        {/* Details */}
        <div
          className="fade-section flex flex-wrap items-center justify-center gap-8"
          style={{ transitionDelay: '250ms' }}
        >
          {[
            { label: 'Location', value: 'Vancouver, Canada' },
            { label: 'Role', value: 'Lead Business Analyst' },
            { label: 'Focus', value: 'AI × Analytics' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div
                style={{ fontFamily: 'DM Mono, monospace' }}
                className="text-xs tracking-widest uppercase text-white/20 mb-1"
              >
                {item.label}
              </div>
              <div className="text-sm text-white/50">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
