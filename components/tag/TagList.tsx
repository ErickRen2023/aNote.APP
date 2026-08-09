'use client'

import { useTags } from '@/hooks/useTagFilter'
import { cn } from '@/lib/utils'
import { ChevronRight, Hash } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'

export function TagList() {
  const { data: tags, isLoading } = useTags()

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">加载标签中...</div>
  }

  if (!tags || tags.length === 0) {
    return (
      <EmptyState
        icon={<Hash className="w-8 h-8" />}
        title="暂无标签"
        description="创建卡片时添加标签，它们会出现在这里"
      />
    )
  }

  return (
    <div className="space-y-1 p-1">
      {tags.map((tag) => (
        <TagTreeNode key={tag.id} tag={tag} level={0} />
      ))}
    </div>
  )
}

function TagTreeNode({ tag, level }: { tag: import('@/types').Tag; level: number }) {
  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer',
          level > 0 && 'ml-4'
        )}
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: tag.color }}
        />
        <span className="text-sm flex-1 truncate">{tag.name}</span>
        <span className="text-xs text-muted-foreground">{tag.card_count}</span>
        {tag.children && tag.children.length > 0 && (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </div>
      {tag.children?.map((child) => (
        <TagTreeNode key={child.id} tag={child} level={level + 1} />
      ))}
    </>
  )
}
