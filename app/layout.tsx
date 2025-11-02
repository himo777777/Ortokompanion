import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { IntegratedProvider } from '@/context/IntegratedContext'
import { ToastProvider } from '@/components/ui/ToastContainer'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <IntegratedProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </IntegratedProvider>
      </body>
    </html>
  )
}
