import type { Metadata } from 'next'
import './globals.css'
import ScrollToTop from '@/components/ui/ScrollToTop'

export const metadata: Metadata = {
  title: 'Dhruv Bhatia — Analytics & AI Systems',
  description: 'Lead Business Analyst building AI-powered analytics systems, decision intelligence, and conversational data products. Vancouver, Canada.',
  keywords: ['analytics engineering', 'AI analytics', 'data products', 'business intelligence', 'Databricks', 'decision intelligence', 'Vancouver'],
  authors: [{ name: 'Dhruv Bhatia' }],
  openGraph: {
    title: 'Dhruv Bhatia — Analytics & AI Systems',
    description: 'Building AI-powered analytics systems that help organizations make better decisions.',
    type: 'website',
    locale: 'en_CA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dhruv Bhatia — Analytics & AI Systems',
    description: 'Building AI-powered analytics systems that help organizations make better decisions.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="noise">
        <ScrollToTop />
        {children}
      </body>
    </html>
  )
}
