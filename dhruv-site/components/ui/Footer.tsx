'use client'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/[0.04] px-6 py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div style={{ fontFamily: 'DM Mono, monospace' }} className="text-xs text-white/20 tracking-wider">
          © {year} Dhruv Bhatia · Vancouver, Canada
        </div>
        <div className="flex items-center gap-6">
          <a href="https://www.linkedin.com/in/druvbhatia/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-white/20 hover:text-white/60 transition-colors tracking-wider">LinkedIn</a>
          <a href="mailto:hummardhruv@gmail.com" className="text-xs font-mono text-white/20 hover:text-white/60 transition-colors tracking-wider">Email</a>
        </div>
      </div>
    </footer>
  )
}
