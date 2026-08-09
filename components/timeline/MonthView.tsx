'use client'

import { useTimeline } from '@/hooks/useTimeline'
import { cn } from '@/lib/utils'
import { getMonthDates } from '@/lib/timeline-engine'
import { TimelineSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { CardItem } from '@/components/card/CardList'
import { FileText, TrendingUp } from 'lucide-react'
import type { MonthTimelineData, TagDistribution } from '@/types'

/**
 * MonthView - Calendar heatmap (GitHub-style) + highlight cards.
 * Each day cell shows count with color intensity (0-4 levels).
 */
export function MonthView() {
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

  const monthData = data as MonthTimelineData | undefined

  if (!monthData || monthData.total === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-8 h-8" />}
        title="暂无卡片"
        description="这个月还没有记录"
      />
    )
  }

  const [yearStr, monthStr] = monthData.month.split('-')
  const year = parseInt(yearStr)
  const month = parseInt(monthStr) - 1 // 0-indexed

  const monthDates = getMonthDates(year, month)

  // Build heatmap lookup
  const heatmapMap = new Map(
    monthData.heatmap.map((h) => [h.date, { count: h.count, level: h.level }])
  )

  // Calculate day-of-week offset for the first day
  const firstDayOfWeek = monthDates[0]?.getDay() || 0 // 0=Sunday

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Heatmap */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            活动热力图
          </h3>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
              <div key={d} className="text-[10px] text-muted-foreground text-center">
                {d}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {monthDates.map((date) => {
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
              const cell = heatmapMap.get(dateStr)
              const level = cell?.level || 0
              const count = cell?.count || 0

              return (
                <div
                  key={dateStr}
                  className={cn(
                    'aspect-square rounded-sm flex items-center justify-center text-[10px] font-medium cursor-default transition-colors',
                    level === 0 && 'bg-muted',
                    level === 1 && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
                    level === 2 && 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
                    level === 3 && 'bg-emerald-300 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-200',
                    level === 4 && 'bg-emerald-400 text-emerald-950 dark:bg-emerald-700 dark:text-emerald-100'
                  )}
                  title={`${dateStr}: ${count} 张卡片`}
                >
                  {date.getDate()}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-2 justify-end">
            <span className="text-[10px] text-muted-foreground">少</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  'w-3 h-3 rounded-sm',
                  level === 0 && 'bg-muted',
                  level === 1 && 'bg-emerald-100 dark:bg-emerald-950',
                  level === 2 && 'bg-emerald-200 dark:bg-emerald-900',
                  level === 3 && 'bg-emerald-300 dark:bg-emerald-800',
                  level === 4 && 'bg-emerald-400 dark:bg-emerald-700'
                )}
              />
            ))}
            <span className="text-[10px] text-muted-foreground">多</span>
          </div>
        </div>

        {/* Right: Highlights + Tag distribution */}
        <div className="space-y-6">
          {/* Highlights */}
          {monthData.highlights && monthData.highlights.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">本月高光</h3>
              <div className="space-y-2">
                {monthData.highlights.map((card) => (
                  <CardItem key={card.id} card={card} compact />
                ))}
              </div>
            </div>
          )}

          {/* Tag distribution */}
          {monthData.tag_distribution && monthData.tag_distribution.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">标签分布</h3>
              <div className="space-y-2">
                {monthData.tag_distribution.map((dist) => (
                  <TagDistBar key={dist.name} dist={dist} max={monthData.tag_distribution[0]?.count || 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TagDistBar({ dist, max }: { dist: TagDistribution; max: number }) {
  const percentage = (dist.count / max) * 100

  return (
    <div className="flex items-center gap-2">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: dist.color }}
      />
      <span className="text-xs text-foreground w-16 truncate">{dist.name}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: dist.color,
          }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{dist.count}</span>
    </div>
  )
}
