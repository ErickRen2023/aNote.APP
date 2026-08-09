'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setAuth } from '@/lib/auth'

export default function SsoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (searchParams.get('error')) {
      router.replace('/login?error=sso_login_failed')
      return
    }

    fetch('/api/auth/sso/result', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('SSO result unavailable')
        return response.json()
      })
      .then((response) => {
        const result = response.data
        if (result?.status !== 'authenticated' || !result.token || !result.user_id) {
          throw new Error('Invalid SSO callback payload')
        }
        setAuth(result.token, { username: result.username, avatar: result.avatar })
        const next = window.sessionStorage.getItem('mynote_login_next') || '/'
        window.sessionStorage.removeItem('mynote_login_next')
        router.replace(next.startsWith('/') ? next : '/')
      })
      .catch(() => router.replace('/login?error=sso_callback_failed'))
  }, [router, searchParams])

  return <main className="flex h-full items-center justify-center text-sm text-muted-foreground">正在完成 aSSO 登录…</main>
}
