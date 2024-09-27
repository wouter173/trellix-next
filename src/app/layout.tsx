import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'
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
      <body className={`${GeistSans.variable} ${GeistMono.variable} relative min-h-screen bg-[#ececed] font-sans`}>
        <div className="absolute inset-0 -z-10 bg-[url(/dot.svg)] bg-repeat opacity-50"></div>
        {children}
      </body>
    </html>
  )
}
