'use client'

import { useTimelineStore } from '@/stores/timelineStore'
import { cn } from '@/lib/utils'
import { DayView } from './DayView'
import { WeekView } from './WeekView'
import { MonthView } from './MonthView'
import { YearView } from './YearView'

/**
 * TimelineCanvas - Main timeline rendering component.
 * Switches between Day/Week/Month/Year views based on current granularity.
 * For MVP, uses DOM-based rendering (Canvas engine to be implemented progressively).
 */
export function TimelineCanvas() {
  const { granularity, isAnimating } = useTimelineStore()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Viewport with animated transitions */}
      <div
        className={cn(
          'flex-1 overflow-hidden',
          isAnimating && 'opacity-60 transition-opacity duration-200'
        )}
      >
        {granularity === 'day' && <DayView />}
        {granularity === 'week' && <WeekView />}
        {granularity === 'month' && <MonthView />}
        {granularity === 'year' && <YearView />}
      </div>
    </div>
  )
}
