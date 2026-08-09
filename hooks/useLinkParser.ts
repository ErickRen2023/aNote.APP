'use client'

import { useState, useCallback } from 'react'
import { linkParserApi } from '@/lib/api'
import { getLinkCache, setLinkCache } from '@/lib/cache'

export function useLinkParser() {
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseLink = useCallback(async (url: string): Promise<string | null> => {
    if (!url || !url.match(/^https?:\/\/.+/)) {
      return null
    }

    // Check local cache first
    const cached = await getLinkCache(url)
    if (cached) {
      return cached
    }

    setIsParsing(true)
    setError(null)

    try {
      const response = await linkParserApi.parse(url)
      if (response.data.title) {
        // Cache locally
        await setLinkCache(url, response.data.title)
        return response.data.title
      }
      return null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse link'
      setError(message)
      return null
    } finally {
      setIsParsing(false)
    }
  }, [])

  return {
    parseLink,
    isParsing,
    error,
  }
}
