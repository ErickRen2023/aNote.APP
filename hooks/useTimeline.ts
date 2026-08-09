'use client'

import { useQuery } from '@tanstack/react-query'
import { timelineApi } from '@/lib/api'
import { getTimelineCache, setTimelineCache } from '@/lib/cache'
import { useTimelineStore } from '@/stores/timelineStore'
import { useFilterStore } from '@/stores/filterStore'
import { formatDateForApi, getTimelineCacheKey } from '@/lib/timeline-engine'
import type { TimelineData } from '@/types'

export function useTimeline() {
  const { granularity, currentDate, setAnimating } = useTimelineStore()
  const { selectedTags } = useFilterStore()

  const date = formatDateForApi(currentDate, granularity)
  const cacheKey = getTimelineCacheKey(granularity, date)
  const tagsParam = selectedTags.length > 0 ? selectedTags.join(',') : undefined

  const query = useQuery<TimelineData>({
    queryKey: ['timeline', granularity, date, selectedTags],
    queryFn: async () => {
      const cached = await getTimelineCache(cacheKey)
      try {
        // Always revalidate so invalidated React Query entries cannot be
        // repopulated forever by stale IndexedDB data after a mutation.
        const response = await timelineApi.get({
          granularity,
          date,
          tags: tagsParam,
        })
        await setTimelineCache(cacheKey, response.data)
        return response.data
      } catch (error) {
        if (cached) return cached
        throw error
      } finally {
        setTimeout(() => setAnimating(false), 300)
      }
    },
    staleTime: 30 * 1000, // 30s React Query cache
    placeholderData: (prev) => prev, // Keep previous data while loading
  })

  return query
}
