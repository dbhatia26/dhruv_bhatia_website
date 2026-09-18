'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#ideas', label: 'Ideas' },
  { href: '#speaking', label: 'Speaking' },
  { href: '#genie', label: 'Genie' },
  { href: '#stack', label: 'Stack' },
  { href: '/tools', label: 'Tools' },
]

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const onHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false)

    // Real routes such as /tools navigate normally.
    if (!href.startsWith('#')) return

    e.preventDefault()

    // Section links only have something to scroll to on the home page.
    if (!onHome) {
      router.push('/' + href)
      return
    }
    scrollTo(href.replace('#', ''))
  }

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setMenuOpen(false)
    if (!onHome) {
      router.push('/')
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isActive = (href: string) => !href.startsWith('#') && pathname.startsWith(href)

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled || menuOpen ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <a href="/" onClick={handleLogoClick}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--cyan)', fontWeight: 500 }}>D</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)', letterSpacing: '0.04em' }}>Dhruv Bhatia</span>
          </a>

          {/* Desktop links */}
          <ul style={{ display: 'flex', gap: '2px', listStyle: 'none', margin: 0, padding: 0 }} className="desktop-nav">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <li key={link.href}>
                  <a href={link.href} onClick={(e) => handleClick(e, link.href)}
                    aria-current={active ? 'page' : undefined}
                    style={{ padding: '6px 10px', fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: active ? 'var(--cyan)' : 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', display: 'block' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-strong)')}
                    onMouseLeave={e => (e.currentTarget.style.color = active ? 'var(--cyan)' : 'var(--text-muted)')}>
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeToggle />
            <a href="#contact" onClick={(e) => handleClick(e, '#contact')}
              style={{ padding: '6px 14px', fontFamily: 'DM Mono, monospace', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.35)', borderRadius: '4px', textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,255,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              Let&apos;s Talk
            </a>
            {/* Hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'none', flexDirection: 'column', gap: '5px' }}>
              <span style={{ display: 'block', width: '22px', height: '2px', background: 'currentColor', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: 'currentColor', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: 'currentColor', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px 20px' }} className="mobile-menu">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => handleClick(e, link.href)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                style={{ display: 'block', padding: '10px 0', fontFamily: 'DM Mono, monospace', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: isActive(link.href) ? 'var(--cyan)' : 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
                {link.label}
              </a>
            ))}
          </div>
        )}
      </nav>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
