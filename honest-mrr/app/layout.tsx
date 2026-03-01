import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Honest MRR - Cryptographically Verified Revenue Screenshots',
  description: 'Stop the fake MRR culture. Generate verified revenue screenshots from Stripe with cryptographic proof.',
  keywords: ['MRR', 'Stripe', 'revenue', 'verification', 'indie hackers', 'SaaS'],
  authors: [{ name: 'Honest MRR' }],
  openGraph: {
    title: 'Honest MRR - Verified Revenue Screenshots',
    description: 'Stop the fake MRR culture. Cryptographically verified revenue screenshots from Stripe.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Honest MRR - Verified Revenue Screenshots',
    description: 'Stop the fake MRR culture. Cryptographically verified revenue screenshots from Stripe.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
