'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

export default function Speaking() {
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
    <section id="speaking" ref={ref} className="py-32 px-6 relative border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="fade-section mb-6 flex items-center gap-3">
          <span style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs tracking-widest uppercase opacity-20">/speaking</span>
          <div className="flex-1 h-px bg-white/[0.05]" />
        </div>
        <div className="fade-section mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/[0.08] border border-cyan-400/25 text-[10px] font-mono tracking-widest uppercase text-cyan-400/85 mb-4">
            ● Live Event
          </span>
          <h2 style={{ fontFamily: 'Syne, sans-serif' }} className="text-4xl sm:text-5xl font-bold text-white/90 mb-3">Databricks AI Day</h2>
          <p className="text-white/40 text-lg max-w-2xl font-light leading-relaxed">
            Presented <em>"Beyond the BI Ticket: From Reports to Conversations"</em> to a packed audience of 250+ data leaders — making the case for AI-native analytics and conversational data access over static dashboards.
          </p>
        </div>
        <div className="fade-section grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { src: '/talk1.png', caption: 'Beyond the BI Ticket: From Reports to Conversations · Databricks AI Day' },
            { src: '/talk2.png', caption: 'Full room · 250+ attendees · Databricks AI Day Vancouver, March 2026' },
          ].map((photo) => (
            <div key={photo.src} className="relative rounded-xl overflow-hidden border border-white/[0.06] aspect-[4/3] group">
              <Image src={photo.src} alt={photo.caption} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <p style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs text-white/80 leading-relaxed">{photo.caption}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="fade-section grid grid-cols-3 border border-white/[0.06] rounded-xl overflow-hidden">
          {[
            { val: '250+', label: 'Attendees' },
            { val: 'Databricks', label: 'Event Host' },
            { val: 'Mar 12, 2026', label: 'AI Day Vancouver' },
          ].map((stat, i) => (
            <div key={stat.label} className={`px-6 py-5 text-center ${i < 2 ? 'border-r border-white/[0.06]' : ''}`}>
              <div style={{ fontFamily: 'Syne, sans-serif' }} className="text-xl font-bold gradient-text-static mb-1">{stat.val}</div>
              <div style={{ fontFamily: 'DM Mono, monospace' }} className="text-[10px] tracking-widest uppercase text-white/25">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
