import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import './globals.css'

import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import Script from 'next/script'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Trellix Next 15',
  description: 'Trellix',
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <Script
        defer
        id="plausible"
        data-domain="trellix-next.vercel.app"
        src="https://plausible.wouter.cloud/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js"
      />
      <Script
        id="inline-plausible"
        dangerouslySetInnerHTML={{
          __html: `window.plausible = window.plausible || function() {(window.plausible.q = window.plausible.q || []).push(arguments)}`,
        }}
      />
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} relative min-h-screen bg-[#ececed] font-sans dark:bg-zinc-950 dark:text-white`}
      >
        <div className="absolute inset-0 -z-10 bg-[url(/dot.svg)] bg-repeat opacity-5"></div>
        <Toaster theme="system" richColors />
        {children}
      </body>
    </html>
  )
}
