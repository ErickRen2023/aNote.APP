import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Providers } from './providers'
import { AuthGate } from '@/components/auth/AuthGate'
import { SideDrawer } from '@/components/layout/SideDrawer'
import { TopNav } from '@/components/layout/TopNav'
import { BackToToday } from '@/components/layout/BackToToday'
import { CardEditor } from '@/components/card/CardEditor'
import { CardDetail } from '@/components/card/CardDetail'
import './globals.css'

export const metadata: Metadata = {
  title: 'myNOTE - 知识卡片时间线',
  description: '创建知识卡片，在时间线上浏览，链接自动解析为标题',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="h-screen overflow-hidden bg-background text-foreground antialiased">
        <Providers>
          <Suspense fallback={null}>
          <AuthGate publicChildren={children}>
          <div className="flex h-full">
            {/* Left Drawer */}
            <SideDrawer />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              <TopNav />
              <main className="flex-1 overflow-hidden">
                {children}
              </main>
            </div>
          </div>

          {/* Floating button */}
          <BackToToday />

          {/* Modals */}
          <CardEditor />
          <Suspense fallback={null}>
            <CardDetail />
          </Suspense>
          </AuthGate>
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
