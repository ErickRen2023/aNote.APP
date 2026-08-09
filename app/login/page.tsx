'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <main className="flex h-full items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">n</div>
        <h1 className="text-xl font-semibold tracking-tight">登录 myNOTE</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">使用 aSSO 账号继续管理你的知识卡片。</p>
        {error && <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">aSSO 登录失败，请重试。</p>}
        <Link
          href="/api/auth/sso/login"
          onClick={() => {
            const next = searchParams.get('next')
            if (next) window.sessionStorage.setItem('mynote_login_next', next)
          }}
          className="mt-6 flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          使用 aSSO 登录
        </Link>
      </section>
    </main>
  )
}
