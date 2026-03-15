'use client'

import { useEffect } from 'react'

export default function ScrollToTop() {
  useEffect(() => {
    // Force scroll to top on every fresh page load
    // regardless of hash, browser history, or session restore
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual'
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      // Remove any hash from URL without triggering a scroll
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [])
  return null
}
