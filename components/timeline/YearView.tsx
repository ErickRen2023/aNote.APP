'use client'

import { useTimeline } from '@/hooks/useTimeline'
import { TimelineSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { useUIStore } from '@/stores/uiStore'
import { Calendar } from 'lucide-react'
import type { YearTimelineData, TagDistribution } from '@/types'

const MONTH_LABELS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
]

/**
 * YearView - 12-column grid, each column = 1 month.
 * Shows card count per month + top highlights + tag distribution.
 */
export function YearView() {
  const { data, isLoading, error } = useTimeline()

  if (isLoading) return <TimelineSkeleton />

  if (error) {
    return (
      <EmptyState
        icon={<Calendar className="w-8 h-8" />}
        title="加载失败"
        description="请检查网络连接后重试"
      />
    )
  }

  const yearData = data as YearTimelineData | undefined

  if (!yearData || yearData.total === 0) {
    return (
      <EmptyState
        icon={<Calendar className="w-8 h-8" />}
        title="暂无卡片"
        description={`${yearData?.year || ''}年还没有记录`}
      />
    )
  }

  const maxCount = Math.max(...yearData.months.map((m) => m.count), 1)

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Month grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {yearData.months.map((monthData) => {
          const monthNum = parseInt(monthData.month.split('-')[1]) - 1
          const heightPercentage = (monthData.count / maxCount) * 100

          return (
            <div
              key={monthData.month}
              className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{MONTH_LABELS[monthNum]}</span>
                <span className="text-2xl font-bold text-primary tabular-nums">
                  {monthData.count}
                </span>
              </div>

              {/* Bar chart */}
              <div className="h-16 flex items-end">
                <div
                  className="w-full bg-primary/20 rounded-md transition-all duration-500"
                  style={{ height: `${Math.max(heightPercentage, 4)}%` }}
                />
              </div>

              {/* Minis highlights */}
              {monthData.highlights && monthData.highlights.length > 0 && (
                <div className="mt-3 space-y-1">
                  {monthData.highlights.map((card) => (
                    <p
                      key={card.id}
                      className="text-xs text-muted-foreground truncate cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => useUIStore.getState().openCardDetail(card.id)}
                    >
                      {card.title || '无标题'}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tag distribution + Top tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {yearData.tag_distribution && yearData.tag_distribution.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">标签分布</h3>
            <div className="space-y-2">
              {yearData.tag_distribution.map((dist) => (
                <YearTagBar
                  key={dist.name}
                  dist={dist}
                  max={yearData.tag_distribution[0]?.count || 1}
                />
              ))}
            </div>
          </div>
        )}

        {yearData.top_tags && yearData.top_tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">年度 Top 标签</h3>
            <div className="grid grid-cols-2 gap-2">
              {yearData.top_tags.map((tag, i) => (
                <div
                  key={tag.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-lg font-bold text-muted-foreground/40 tabular-nums w-6">
                    {i + 1}
                  </span>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm truncate">{tag.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{tag.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function YearTagBar({ dist, max }: { dist: TagDistribution; max: number }) {
  const percentage = (dist.count / max) * 100

  return (
    <div className="flex items-center gap-2">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: dist.color }}
      />
      <span className="text-xs text-foreground w-20 truncate">{dist.name}</span>
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
