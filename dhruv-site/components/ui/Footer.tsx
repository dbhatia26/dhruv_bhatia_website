'use client'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '24px clamp(16px,5vw,24px)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-faint)', letterSpacing: '0.05em' }}>
          © {year} Dhruv Bhatia · Vancouver, Canada
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="https://www.linkedin.com/in/druvbhatia/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-faint)', textDecoration: 'none', transition: 'color 0.2s' }}>LinkedIn</a>
          <a href="mailto:hummardhruv@gmail.com" style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-faint)', textDecoration: 'none', transition: 'color 0.2s' }}>Email</a>
        </div>
      </div>
    </footer>
  )
}
