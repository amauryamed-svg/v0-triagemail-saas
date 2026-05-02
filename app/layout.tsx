import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://v0-triagemail-saas.vercel.app'),
  title: 'TriageMail — AI-Powered Mail Triage Agent',
  description:
    'Hola, soy Emily. Me llevo tu inbox los sábados. Tú apruebas. Yo nunca envío sola. Construido para ejecutivos en cooperación internacional, fundaciones ambientales y redes inter-institucionales.',
  generator: 'v0.app',
  applicationName: 'TriageMail',
  keywords: [
    'AI agent', 'mail triage', 'Emily', 'Vercel hackathon', 'Zero to Agent',
    'cooperación internacional', 'fundaciones', 'asistente ejecutiva',
  ],
  openGraph: {
    title: 'TriageMail · Emily — AI-Powered Mail Triage Agent',
    description:
      'Hola, soy Emily. Me llevo tu inbox los sábados. Tú apruebas. Yo nunca envío sola.',
    url: '/',
    siteName: 'TriageMail',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TriageMail · Emily — AI-Powered Mail Triage Agent',
    description:
      'Hola, soy Emily. Me llevo tu inbox los sábados. Tú apruebas. Yo nunca envío sola.',
    creator: '@v0byVercel',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
