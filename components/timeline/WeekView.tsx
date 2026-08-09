'use client'

import { useTimeline } from '@/hooks/useTimeline'
import { cn } from '@/lib/utils'
import { TimelineSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { CardItem } from '@/components/card/CardList'
import { FileText } from 'lucide-react'
import type { WeekTimelineData } from '@/types'

const WEEKDAY_LABELS = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

/**
 * WeekView - 7-column horizontal timeline.
 * Weekends are visually collapsed/dimmed.
 */
export function WeekView() {
  const { data, isLoading, error } = useTimeline()

  if (isLoading) return <TimelineSkeleton />

  if (error) {
    return (
      <EmptyState
        icon={<FileText className="w-8 h-8" />}
        title="加载失败"
        description="请检查网络连接后重试"
      />
    )
  }

  const weekData = data as WeekTimelineData | undefined

  if (!weekData || weekData.total === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-8 h-8" />}
        title="暂无卡片"
        description="这一周还没有记录"
      />
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Week header */}
      <div className="grid grid-cols-7 border-b border-border sticky top-0 bg-background z-10">
        {weekData.days.map((day) => (
          <div
            key={day.date}
            className={cn(
              'px-3 py-2 text-center border-r border-border last:border-r-0',
              day.weekday >= 6 && 'bg-muted/30' // Weekend dimming
            )}
          >
            <div className="text-xs text-muted-foreground">
              {WEEKDAY_LABELS[day.weekday]}
            </div>
            <div className="text-lg font-semibold mt-0.5">
              {new Date(day.date).getDate()}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {day.count} 张卡片
            </div>
          </div>
        ))}
      </div>

      {/* Cards per day */}
      <div className="grid grid-cols-7">
        {weekData.days.map((day) => (
          <div
            key={day.date}
            className={cn(
              'p-2 border-r border-border last:border-r-0 min-h-[200px]',
              day.weekday >= 6 && 'bg-muted/30'
            )}
          >
            <div className="space-y-2">
              {day.cards.map((card) => (
                <CardItem key={card.id} card={card} compact />
              ))}
              {day.count > day.cards.length && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  +{day.count - day.cards.length} 更多...
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
