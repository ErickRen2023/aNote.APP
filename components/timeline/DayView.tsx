'use client'

import { useMemo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { ExternalLink, FileText, NotebookPen } from 'lucide-react'
import { useTimeline } from '@/hooks/useTimeline'
import { useTimelineStore } from '@/stores/timelineStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import { TimelineSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import type { DayCardData, DayTimelineData } from '@/types'

const NODE_COLORS = ['#15966f', '#12b8d8', '#f5b515', '#8b5cf6', '#f97316']

export function DayView() {
  const { data, isLoading, error } = useTimeline()
  const { currentDate } = useTimelineStore()

  if (isLoading) return <TimelineSkeleton />

  if (error) {
    return (
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title="加载失败"
        description="请检查网络连接后重试"
      />
    )
  }

  const dayData = data as DayTimelineData | undefined

  if (!dayData || dayData.total === 0) {
    return (
      <div className="h-full overflow-y-auto bg-slate-50/70 dark:bg-slate-950/20">
        <DayHeading date={currentDate} total={0} />
        <EmptyState
          icon={<NotebookPen className="h-8 w-8" />}
          title="这一天还没有故事"
          description="点击「新建卡片」，在时间线上留下第一条记录"
        />
      </div>
    )
  }

  const cards = [...dayData.am, ...dayData.pm].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  return (
    <div className="h-full overflow-y-auto bg-slate-50/70 dark:bg-slate-950/20">
      <DayHeading date={currentDate} total={dayData.total} />

      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="day-journey relative">
          <div className="day-journey-line" aria-hidden="true" />

          <div className="space-y-10 md:space-y-14">
            {cards.map((card, index) => (
              <JourneyEntry key={card.id} card={card} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DayHeading({ date, total }: { date: Date; total: number }) {
  const dateTitle = date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
  })
  const weekday = date.toLocaleDateString('zh-CN', { weekday: 'long' })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-7 text-center sm:px-6 lg:px-8">
      <h2 className="text-2xl font-light tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        {dateTitle}
      </h2>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
        {weekday} · {total > 0 ? `${total} 条时间记录` : '等待第一条记录'}
      </p>
      <div className="mt-5 h-px bg-slate-200 dark:bg-slate-800" />
    </div>
  )
}

function JourneyEntry({ card, index }: { card: DayCardData; index: number }) {
  const openCardDetail = useUIStore((state) => state.openCardDetail)
  const side = index % 2 === 0 ? 'left' : 'right'
  const nodeColor = card.tags?.[0]?.color || NODE_COLORS[index % NODE_COLORS.length]
  const content = useMemo(() => plainText(card.content_summary), [card.content_summary])
  const timestamp = new Date(card.timestamp)
  const time = timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${card.id}`,
    data: { card },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <article
      className={cn(
        'day-journey-entry',
        side === 'left' ? 'day-journey-entry--left' : 'day-journey-entry--right'
      )}
    >
      <span
        className="day-journey-node"
        style={{ backgroundColor: nodeColor, boxShadow: `0 0 0 7px ${nodeColor}18` }}
        aria-hidden="true"
      />

      <button
        ref={setNodeRef}
        type="button"
        style={style}
        {...listeners}
        {...attributes}
        onClick={() => openCardDetail(card.id)}
        className={cn(
          'day-journey-card group text-left',
          side === 'left' ? 'day-journey-card--left' : 'day-journey-card--right',
          isDragging && 'z-50 opacity-60 shadow-xl'
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-700/70">
          <div className="min-w-0">
            <p className="text-2xl font-light tabular-nums text-slate-800 dark:text-slate-100">
              {time}
            </p>
          </div>

          {card.tags?.length > 0 && (
            <div className="flex max-w-[55%] flex-wrap justify-end gap-1.5">
              {card.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ color: tag.color, backgroundColor: `${tag.color}14` }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <h3 className="mt-3 text-base font-semibold leading-6 text-slate-900 transition-colors group-hover:text-primary dark:text-slate-50">
          {card.title || '无标题'}
        </h3>

        {content && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {content}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>查看详情</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </button>
    </article>
  )
}

function plainText(value: string | undefined): string {
  if (!value) return ''

  const entities: Record<string, string> = {
    nbsp: ' ',
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    '#39': "'",
  }
  let decoded = value

  // The API summary can contain HTML entities (and occasionally entities that
  // were escaped twice). Decode first, then remove both complete and truncated
  // HTML tags so strings such as `&lt;/ul` cannot leak into the card preview.
  for (let pass = 0; pass < 2; pass += 1) {
    decoded = decoded.replace(
      /&(nbsp|amp|lt|gt|quot|#39);/gi,
      (entity) => entities[entity.slice(1, -1).toLowerCase()] || entity
    )
  }

  return decoded
    .replace(/<[^>]*(?:>|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
