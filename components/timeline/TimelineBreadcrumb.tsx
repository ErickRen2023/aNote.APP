'use client'

import { useTimelineStore } from '@/stores/timelineStore'
import { ChevronRight } from 'lucide-react'
import type { Granularity } from '@/types'

export function TimelineBreadcrumb() {
  const { granularity, currentDate, setGranularity, setCurrentDate } = useTimelineStore()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const day = currentDate.getDate()

  const breadcrumbs: Array<{
    label: string
    granularity: Granularity
    onClick: () => void
  }> = [
    {
      label: `${year}年`,
      granularity: 'year',
      onClick: () => {
        setCurrentDate(new Date(year, 0, 1))
        setGranularity('year')
      },
    },
    {
      label: `${month}月`,
      granularity: 'month',
      onClick: () => {
        setCurrentDate(new Date(year, month - 1, 1))
        setGranularity('month')
      },
    },
  ]

  if (granularity === 'week' || granularity === 'day') {
    breadcrumbs.push({
      label: '第' + getWeekLabel(currentDate) + '周',
      granularity: 'week',
      onClick: () => {
        setGranularity('week')
      },
    })
  }

  if (granularity === 'day') {
    breadcrumbs.push({
      label: `${day}日`,
      granularity: 'day',
      onClick: () => {
        setGranularity('day')
      },
    })
  }

  return (
    <nav className="flex items-center gap-1 text-sm px-4 py-2 overflow-x-auto">
      {breadcrumbs.map((crumb, i) => (
        <span key={crumb.granularity} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          <button
            onClick={crumb.onClick}
            className={
              crumb.granularity === granularity
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground transition-colors'
            }
          >
            {crumb.label}
          </button>
        </span>
      ))}
    </nav>
  )
}

function getWeekLabel(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  const oneWeek = 604800000
  return String(Math.ceil((diff / oneWeek + start.getDay() + 1) / 7))
}
