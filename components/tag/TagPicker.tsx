'use client'

import { useState, useRef, useEffect } from 'react'
import { useCreateTag, useTags, flattenTags } from '@/hooks/useTagFilter'
import { cn } from '@/lib/utils'
import { LoaderCircle, Plus, Search, X } from 'lucide-react'
import type { TagInfo } from '@/types'

const TAG_COLORS = ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED']

interface TagPickerProps {
  selectedTags: TagInfo[]
  onTagsChange: (tags: TagInfo[]) => void
}

export function TagPicker({ selectedTags, onTagsChange }: TagPickerProps) {
  const { data: allTags } = useTags()
  const createTag = useCreateTag()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [createColor, setCreateColor] = useState(TAG_COLORS[0])
  const [createError, setCreateError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const flatTags = allTags ? flattenTags(allTags) : []
  const newTagName = search.trim()
  const exactMatch = flatTags.some(
    (tag) => tag.name.toLocaleLowerCase() === newTagName.toLocaleLowerCase()
  )
  const filtered = flatTags.filter(
    (t) => search === '' || t.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!newTagName || exactMatch || createTag.isPending) return
    setCreateError(null)

    try {
      const tag = await createTag.mutateAsync({
        name: newTagName,
        color: createColor,
      })
      if (!selectedTags.some((selected) => selected.id === tag.id)) {
        onTagsChange([
          ...selectedTags,
          { id: tag.id, name: tag.name, color: tag.color },
        ])
      }
      setSearch('')
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : '创建标签失败')
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: (tag.color || '#3B82F6') + '20',
              color: tag.color || '#3B82F6',
            }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => onTagsChange(selectedTags.filter((t) => t.id !== tag.id))}
              className="hover:opacity-70"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen)
            setCreateError(null)
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          + 标签
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 w-64 z-30 bg-card border border-border rounded-lg shadow-xl">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCreateError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && newTagName && !exactMatch) {
                  event.preventDefault()
                  void handleCreate()
                }
              }}
              placeholder="搜索或创建标签..."
              maxLength={100}
              className="flex-1 bg-transparent text-sm focus:outline-none"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.map((tag) => {
              const isSelected = selectedTags.some((t) => t.id === tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onTagsChange(selectedTags.filter((t) => t.id !== tag.id))
                    } else {
                      onTagsChange([
                        ...selectedTags,
                        { id: tag.id, name: tag.name, color: tag.color },
                      ])
                    }
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
                    isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-foreground'
                  )}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="truncate">{tag.name}</span>
                  {isSelected && (
                    <X className="w-3.5 h-3.5 ml-auto text-primary" />
                  )}
                </button>
              )
            })}
            {filtered.length === 0 && !newTagName && (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                输入名称即可创建标签
              </p>
            )}
          </div>

          {newTagName && !exactMatch && (
            <div className="border-t border-border p-2">
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={createTag.isPending}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createTag.isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span className="min-w-0 flex-1 truncate">
                  创建并选中“{newTagName}”
                </span>
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: createColor }}
                />
              </button>

              <div className="mt-1 flex items-center gap-1 px-2.5 pb-1" aria-label="选择标签颜色">
                <span className="mr-1 text-[11px] text-muted-foreground">颜色</span>
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`标签颜色 ${color}`}
                    onClick={() => setCreateColor(color)}
                    className={cn(
                      'h-4 w-4 rounded-full border-2 transition-transform hover:scale-110',
                      createColor === color ? 'border-foreground' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {createError && (
            <p className="border-t border-border px-3 py-2 text-xs text-destructive">
              {createError}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
