'use client'

import { useQuery } from '@tanstack/react-query'
import { topicApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Layers, TrendingUp, Clock } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import type { TopicInfo } from '@/types'

export function TopicList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const response = await topicApi.list({ sort_by: 'last_used_at', sort_order: 'desc' })
      return response.data.topics
    },
    staleTime: 60 * 1000,
  })

  const router = useRouter()

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">加载标签中...</div>
  }

  if (error) {
    return (
      <EmptyState
        icon={<Layers className="w-8 h-8" />}
        title="加载失败"
        description="请检查网络连接后重试"
      />
    )
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Layers className="w-8 h-8" />}
        title="暂无标签"
        description="创建卡片时添加标签，它们会出现在这里"
      />
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-primary" />
        标签视图
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {data.map((topic) => (
          <TopicCard
            key={topic.tag_id}
            topic={topic}
            onNavigate={() => {
              router.push(`/topics?tag_ids=${topic.tag_id}`)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function TopicCard({ topic, onNavigate }: { topic: TopicInfo; onNavigate: () => void }) {
  return (
    <div
      onClick={onNavigate}
      className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: topic.color }}
          />
          <h3 className="font-medium text-sm truncate">{topic.name}</h3>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {topic.card_count} 张卡片
        </span>
        {topic.last_used_at && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(topic.last_used_at).toLocaleDateString('zh-CN')}
          </span>
        )}
      </div>

      {/* Child topics */}
      {topic.children && topic.children.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {topic.children.slice(0, 5).map((child) => (
            <span
              key={child.tag_id}
              className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground"
            >
              {child.name} ({child.card_count})
            </span>
          ))}
          {topic.children.length > 5 && (
            <span className="text-[10px] text-muted-foreground">
              +{topic.children.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
