import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/lib/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ZTS Music - Live Music Gig Marketplace',
    template: '%s | ZTS Music',
  },
  description:
    'Connect with talented artists for your events. Post gigs, receive competitive bids, and book amazing live music performances.',
  keywords: ['music', 'live music', 'gigs', 'artists', 'events', 'booking', 'marketplace'],
  authors: [{ name: 'ZTS Music' }],
  creator: 'ZTS Music',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ztsmusic.com',
    siteName: 'ZTS Music',
    title: 'ZTS Music - Live Music Gig Marketplace',
    description: 'Connect with talented artists for your events.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZTS Music - Live Music Gig Marketplace',
    description: 'Connect with talented artists for your events.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} min-h-screen bg-background antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
