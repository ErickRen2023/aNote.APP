'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getAuthToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/auth/sso/callback']

export function AuthGate({ children, publicChildren }: { children: React.ReactNode; publicChildren: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path)

  useEffect(() => {
    const token = getAuthToken()
    if (isPublicPath) {
      if (pathname === '/login' && token) router.replace('/')
      setChecked(true)
      return
    }

    if (!token) {
      const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      router.replace(`/login?next=${encodeURIComponent(current)}`)
      return
    }
    setChecked(true)
  }, [isPublicPath, pathname, router, searchParams])

  if (!isPublicPath && !checked) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">正在检查登录状态…</div>
  }

  return isPublicPath ? <>{publicChildren}</> : <>{children}</>
}
