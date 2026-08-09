'use client'

import { useTimelineStore } from '@/stores/timelineStore'
import { useUIStore } from '@/stores/uiStore'
import { formatDateLabel } from '@/lib/timeline-engine'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  LayoutGrid,
  List,
} from 'lucide-react'
import type { Granularity } from '@/types'

const GRANULARITY_OPTIONS: { value: Granularity; label: string; icon: React.ReactNode }[] = [
  { value: 'day', label: '日', icon: <List className="w-3.5 h-3.5" /> },
  { value: 'week', label: '周', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { value: 'month', label: '月', icon: <Calendar className="w-3.5 h-3.5" /> },
  { value: 'year', label: '年', icon: <BarChart3 className="w-3.5 h-3.5" /> },
]

export function TopNav() {
  const { granularity, currentDate, navigate, setGranularity, goToToday } = useTimelineStore()
  const { isDrawerOpen } = useUIStore()

  return (
    <header
      className={cn(
        'h-12 border-b border-border bg-card flex items-center justify-between px-4 transition-all',
        isDrawerOpen ? 'ml-64' : 'ml-14'
      )}
    >
      {/* Left: Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('prev')}
          className="p-1 rounded hover:bg-accent text-muted-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h1 className="text-sm font-medium min-w-[120px] text-center select-none">
          {formatDateLabel(currentDate, granularity)}
        </h1>

        <button
          onClick={() => navigate('next')}
          className="p-1 rounded hover:bg-accent text-muted-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={goToToday}
          className="ml-2 px-2 py-0.5 text-xs rounded border border-border text-muted-foreground hover:bg-accent transition-colors"
        >
          今天
        </button>
      </div>

      {/* Center: Granularity selector */}
      <div className="flex items-center bg-muted rounded-lg p-0.5">
        {GRANULARITY_OPTIONS.map(({ value, label, icon }) => (
          <button
            key={value}
            onClick={() => setGranularity(value)}
            className={cn(
              'flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors',
              granularity === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => useUIStore.getState().openCardEditor()}
          className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          新建卡片
        </button>
      </div>
    </header>
  )
}
