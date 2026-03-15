'use client'

import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#speaking', label: 'Speaking' },
  { href: '#genie', label: 'Genie' },
  { href: '#ideas', label: 'Ideas' },
  { href: '#stack', label: 'Stack' },
  { href: '#contact', label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[hsl(220,13%,5%)]/90 backdrop-blur-md border-b border-white/[0.04]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-md bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center group-hover:bg-cyan-400/15 transition-colors">
            <span className="text-cyan-400 text-xs font-mono font-medium">D</span>
          </span>
          <span
            style={{ fontFamily: 'Syne, sans-serif' }}
            className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors tracking-wide"
          >
            Dhruv Bhatia
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="px-3 py-1.5 text-sm text-white/40 hover:text-white/80 transition-colors font-mono tracking-wider text-xs uppercase"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA + Theme toggle */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <a
            href="#contact"
            className="px-4 py-1.5 text-xs font-mono tracking-wider uppercase text-cyan-400 border border-cyan-400/30 rounded hover:bg-cyan-400/10 hover:border-cyan-400/60 transition-all"
          >
            Let's Talk
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white/60 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 flex flex-col gap-1">
            <span className={`block h-px bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`block h-px bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[hsl(220,13%,5%)]/95 backdrop-blur-md border-t border-white/[0.04] px-6 py-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-mono text-white/50 hover:text-white transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
