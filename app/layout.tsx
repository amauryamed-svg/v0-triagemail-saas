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
  metadataBase: new URL('https://try-emily.vercel.app'),
  title: 'TriageMail — Gestora estratégica de comunicaciones internas',
  description:
    'Buenos días, Miranda. Soy Emily: gestora estratégica de comunicaciones internas y traductora de lenguajes en cada nodo. Para consultores y equipos directivos que coordinan empresas en interinstitucionalidad. Tú apruebas. Yo nunca envío sola.',
  generator: 'v0.app',
  applicationName: 'TriageMail',
  keywords: [
    'AI agent', 'mail triage', 'Emily', 'Vercel hackathon', 'Zero to Agent',
    'comunicaciones internas', 'interinstitucionalidad', 'consultoría organizacional',
    'gestión estratégica', 'traducción cross-nodos', 'asistente ejecutiva',
  ],
  openGraph: {
    title: 'TriageMail · Emily — Gestora estratégica de comunicaciones internas',
    description:
      'Buenos días, Miranda. Soy Emily: gestora estratégica de comunicaciones internas y traductora de lenguajes en cada nodo. Tú apruebas. Yo nunca envío sola.',
    url: '/',
    siteName: 'TriageMail',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TriageMail · Emily — Gestora estratégica de comunicaciones internas',
    description:
      'Buenos días, Miranda. Soy Emily: traductora de lenguajes en cada nodo institucional. Tú apruebas. Yo nunca envío sola.',
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
