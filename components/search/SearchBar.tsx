'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useFilterStore } from '@/stores/filterStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  className?: string
  onSearch?: (query: string) => void
}

export function SearchBar({ className, onSearch }: SearchBarProps) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const { setSearchQuery, selectedTags } = useFilterStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  const handleSearch = useCallback(() => {
    setSearchQuery(query)
    onSearch?.(query)

    // Navigate to search page if not already there
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','))
    router.push(`/search?${params.toString()}`)
  }, [query, selectedTags, setSearchQuery, onSearch, router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
    if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索卡片标题、内容..."
            className="w-full pl-10 pr-8 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          搜索
        </button>
      </div>
    </div>
  )
}
