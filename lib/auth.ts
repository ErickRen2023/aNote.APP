const TOKEN_KEY = 'mynote_token'
const PROFILE_KEY = 'mynote_sso_profile'

export interface SsoProfile {
  username?: string
  avatar?: string
}

export function getAuthToken(): string | null {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY)
}

export function setAuth(token: string, profile?: SsoProfile): void {
  window.localStorage.setItem(TOKEN_KEY, token)
  if (profile && (profile.username || profile.avatar)) {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } else {
    window.localStorage.removeItem(PROFILE_KEY)
  }
}

export function clearAuth(): void {
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(PROFILE_KEY)
}

export function getSsoProfile(): SsoProfile | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as SsoProfile
  } catch {
    window.localStorage.removeItem(PROFILE_KEY)
    return null
  }
}
