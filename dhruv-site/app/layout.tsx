import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="noise">
        {children}
      </body>
    </html>
  )
}
