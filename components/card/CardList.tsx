'use client'

import { useDraggable } from '@dnd-kit/core'
import { cn, plainText } from '@/lib/utils'
import { formatTime } from '@/lib/timeline-engine'
import { useUIStore } from '@/stores/uiStore'
import type { DayCardData } from '@/types'

interface CardItemProps {
  card: DayCardData
  compact?: boolean
}

export function CardItem({ card, compact = false }: CardItemProps) {
  const openCardDetail = useUIStore((s) => s.openCardDetail)
  const contentSummary = plainText(card.content_summary)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${card.id}`,
    data: { card },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => openCardDetail(card.id)}
      className={cn(
        'rounded-lg border border-border bg-card p-3 cursor-pointer',
        'hover:border-primary/50 hover:shadow-sm transition-all duration-200',
        'select-none',
        isDragging && 'opacity-50 shadow-lg z-50',
        compact && 'p-2 text-xs'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              'font-medium text-foreground truncate',
              compact ? 'text-xs' : 'text-sm'
            )}
          >
            {card.title || '无标题'}
          </h4>

          {!compact && contentSummary && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {contentSummary}
            </p>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {card.tags.slice(0, compact ? 2 : 4).map((tag) => (
                <span
                  key={tag.id}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
                  style={{
                    backgroundColor: (tag.color || '#3B82F6') + '15',
                    color: tag.color || '#3B82F6',
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {card.tags.length > (compact ? 2 : 4) && (
                <span className="text-[10px] text-muted-foreground">
                  +{card.tags.length - (compact ? 2 : 4)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Time */}
        <span
          className={cn(
            'text-muted-foreground shrink-0',
            compact ? 'text-[10px]' : 'text-xs'
          )}
        >
          {formatTime(card.timestamp)}
        </span>
      </div>
    </div>
  )
}
