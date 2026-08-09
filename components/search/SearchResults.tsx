'use client'

import { useQuery } from '@tanstack/react-query'
import { searchApi } from '@/lib/api'
import { useRouter, useSearchParams } from 'next/navigation'
import { EmptyState } from '@/components/common/EmptyState'
import { ArrowRight, Search, Loader2, MapPin } from 'lucide-react'
import type { CardType } from '@/types'

export function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const tags = searchParams.get('tags') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', q, tags, page],
    queryFn: async () => {
      const response = await searchApi.search({
        q: q || undefined,
        tags: tags || undefined,
        page,
        page_size: 20,
      })
      return response.data
    },
    staleTime: 30 * 1000,
  })

  if (!q && !tags) {
    return (
      <EmptyState
        icon={<Search className="w-8 h-8" />}
        title="搜索卡片"
        description="输入关键词、按标签或卡片类型筛选"
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={<Search className="w-8 h-8" />}
        title="搜索失败"
        description="请检查网络连接后重试"
      />
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        icon={<Search className="w-8 h-8" />}
        title="未找到匹配的卡片"
        description={`共 0 条结果，请尝试其他关键词或筛选项`}
      />
    )
  }

  return (
    <div className="p-4">
      {/* Result count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          找到 <span className="font-medium text-foreground">{data.total}</span> 条结果
        </p>
        {/* Query info */}
        {data.query && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {data.query.q != null && String(data.query.q) && (
              <span className="px-2 py-0.5 bg-muted rounded-full">
                关键词：{String(data.query.q)}
              </span>
            )}
            {data.query.tags != null && String(data.query.tags) && (
              <span className="px-2 py-0.5 bg-muted rounded-full">
                标签：{String(data.query.tags)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results with highlighted content */}
      <div className="space-y-3">
        {data.items.map((item) => (
          <SearchResultCard
            key={item.id}
            card={item}
            keyword={q}
            onOpen={() => {
              const returnTo = `/search?${searchParams.toString()}`
              const target = new URLSearchParams({
                date: item.timestamp.slice(0, 10),
                card: String(item.id),
                returnTo,
              })
              router.push(`/?${target.toString()}`)
            }}
          />
        ))}
      </div>

      {/* Pagination placeholder */}
      {data.total > 20 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          显示第 {page * 20 - 19} - {Math.min(page * 20, data.total)} 条，共 {data.total} 条
        </p>
      )}
    </div>
  )
}

function SearchResultCard({
  card,
  onOpen,
}: {
  card: {
    id: number
    title: string
    content_snippet: string
    card_type: CardType
    timestamp: string
    tags: Array<{ id: number; name: string; color: string }>
    relevance_score: number
  }
  keyword: string
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`在时间线中查看 ${card.title || '无标题'}`}
      className="group block w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-foreground">
          {card.title || '无标题'}
        </h4>
        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          相关度: {(card.relevance_score * 100).toFixed(0)}%
        </span>
      </div>

      {/* Highlighted snippet */}
      {card.content_snippet && (
        <p
          className="text-xs text-muted-foreground mb-2 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: card.content_snippet }}
        />
      )}

      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <span>{card.timestamp}</span>
          {card.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: tag.color + '20',
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary opacity-75 transition-opacity group-hover:opacity-100">
          <MapPin className="h-3.5 w-3.5" />
          在时间线中查看
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  )
}
