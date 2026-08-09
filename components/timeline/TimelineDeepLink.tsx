'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTimelineStore } from '@/stores/timelineStore'
import { useUIStore } from '@/stores/uiStore'

export function TimelineDeepLink() {
  const searchParams = useSearchParams()
  const handledTarget = useRef<string | null>(null)

  useEffect(() => {
    const date = searchParams.get('date')
    const cardParam = searchParams.get('card')
    const cardId = cardParam ? Number(cardParam) : null
    if (!date) return

    const targetKey = `${date}:${cardId ?? ''}`
    if (handledTarget.current === targetKey) return

    const targetDate = new Date(`${date}T00:00:00`)
    if (Number.isNaN(targetDate.getTime())) return

    handledTarget.current = targetKey
    useTimelineStore.getState().setCurrentDate(targetDate)
    useTimelineStore.getState().setGranularity('day')
    if (cardId !== null && Number.isInteger(cardId) && cardId > 0) {
      useUIStore.getState().openCardDetail(cardId)
    }
  }, [searchParams])

  return null
}
