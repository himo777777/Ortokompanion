import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { IntegratedProvider } from '@/context/IntegratedContext'
import { ToastProvider } from '@/components/ui/ToastContainer'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

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
  // Check if we have real Clerk credentials (not placeholder)
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const hasRealClerkKey = clerkPublishableKey &&
    !clerkPublishableKey.includes('placeholder') &&
    clerkPublishableKey.length > 30

  const content = (
    <html lang="sv">
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            <IntegratedProvider>
              {children}
            </IntegratedProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )

  // Only use ClerkProvider if we have real credentials
  if (hasRealClerkKey) {
    return <ClerkProvider>{content}</ClerkProvider>
  }

  return content
}
