'use client'

import { Suspense } from 'react'
import { SearchBar } from '@/components/search/SearchBar'
import { SearchResults } from '@/components/search/SearchResults'
import { Loader2 } from 'lucide-react'

function SearchContent() {
  return (
    <div className="flex flex-col h-full">
      {/* Search bar at top */}
      <div className="p-4 border-b border-border">
        <SearchBar />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <SearchResults />
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="flex flex-col h-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </div>
  )
}
