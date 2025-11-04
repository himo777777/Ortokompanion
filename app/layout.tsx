import type { Metadata } from 'next'
import './globals.css'
import { IntegratedProvider } from '@/context/IntegratedContext'

export const metadata: Metadata = {
  title: 'Ortokompanion - AI Utbildningssystem för Ortopedi',
  description: 'Interaktivt AI-drivet utbildningssystem för ortopedläkare på alla nivåer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body className="font-sans antialiased">
        <IntegratedProvider>
          {children}
        </IntegratedProvider>
      </body>
    </html>
  )
}
