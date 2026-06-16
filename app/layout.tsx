import type { Metadata, Viewport } from 'next'
import './globals.css'
import RegisterSW from '@/components/RegisterSW'
import { DOCTOR } from '@/lib/doctor'

export const metadata: Metadata = {
  title: DOCTOR.appName,
  description: `Expedientes clínicos — ${DOCTOR.loginSubtitulo}`,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: DOCTOR.appName,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: '/apple-touch-icon.png',
    icon: '/icon-192.png',
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
