import { PropsWithChildren } from 'react'
import type { Metadata } from 'next'
import './globals.css'

import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'

export const metadata: Metadata = {
  title: 'Trellix Next 15',
  description: 'Trellix',
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>{children}</body>
    </html>
  )
}
