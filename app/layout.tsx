import type { Metadata, Viewport } from 'next'
import './globals.css'
import RegisterSW from '@/components/RegisterSW'

export const metadata: Metadata = {
  metadataBase: new URL('https://quironmd.com'),
  title: 'Quirón',
  description: 'Expediente médico electrónico',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Quirón',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: '/apple-touch-icon.png',
    icon: '/icon-192.png',
  },
  openGraph: {
    title: 'Quirón',
    description: 'Expediente médico electrónico',
    url: 'https://quironmd.com',
    siteName: 'Quirón',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'Quirón' }],
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16335c',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col antialiased"><RegisterSW />{children}</body>
    </html>
  )
}
