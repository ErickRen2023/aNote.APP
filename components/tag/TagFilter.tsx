'use client'

import { useTagFilter } from '@/hooks/useTagFilter'
import { X } from 'lucide-react'

export function TagFilter() {
  const { selectedTags, toggleTag, clearSelection, hasFilters } = useTagFilter()

  if (!hasFilters) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-border bg-muted/30">
      <span className="text-xs text-muted-foreground mr-1">筛选：</span>
      {selectedTags.map((tagName) => (
        <span
          key={tagName}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
        >
          {tagName}
          <button
            onClick={() => toggleTag(tagName)}
            className="hover:opacity-70"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={clearSelection}
        className="text-xs text-muted-foreground hover:text-foreground underline ml-1"
      >
        清除全部
      </button>
    </div>
  )
}
