'use client'

import { useQuery } from '@tanstack/react-query'
import { topicApi } from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import { CardItem } from '@/components/card/CardList'
import { EmptyState } from '@/components/common/EmptyState'
import { Layers } from 'lucide-react'

export function TopicTimeline() {
  const searchParams = useSearchParams()
  const tagIds = searchParams.get('tag_ids') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['topic-cards', tagIds],
    queryFn: async () => {
      if (!tagIds) return null
      const response = await topicApi.cards({
        tag_ids: tagIds,
        page: 1,
        page_size: 50,
        sort: 'desc',
      })
      return response.data
    },
    enabled: !!tagIds,
    staleTime: 30 * 1000,
  })

  if (!tagIds) {
    return (
      <EmptyState
        icon={<Layers className="w-8 h-8" />}
        title="选择标签"
        description="请从标签视图中选择一个标签查看"
      />
    )
  }

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">加载中...</div>
  }

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        icon={<Layers className="w-8 h-8" />}
        title="该标签下暂无卡片"
        description="试试为卡片添加这个标签"
      />
    )
  }

  return (
    <div className="p-4">
      {/* Topic info */}
      {data.topic_info?.tags && (
        <div className="flex items-center gap-2 mb-4">
          {data.topic_info.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: (tag.color || '#3B82F6') + '20',
                color: tag.color || '#3B82F6',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </span>
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            {data.total} 张卡片
          </span>
        </div>
      )}

      {/* Card list */}
      <div className="space-y-2">
        {data.items.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}
