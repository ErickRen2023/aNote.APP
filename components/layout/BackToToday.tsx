'use client'

import { useEffect, useState } from 'react'
import { useTimelineStore } from '@/stores/timelineStore'
import { isToday } from '@/lib/timeline-engine'
import { ArrowDownToLine } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BackToToday() {
  const { currentDate, goToToday, granularity } = useTimelineStore()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show button if not viewing today
    setVisible(!isToday(currentDate) || granularity !== 'day')
  }, [currentDate, granularity])

  if (!visible) return null

  return (
    <button
      onClick={goToToday}
      className={cn(
        'fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90',
        'transition-all duration-200 animate-in fade-in slide-in-from-bottom-4'
      )}
    >
      <ArrowDownToLine className="w-4 h-4" />
      <span className="text-sm font-medium">回到今天</span>
    </button>
  )
}
