'use client'

'use client'

import { useTimelineStore } from '@/stores/timelineStore'

export function TimelineControls() {
  const { granularity } = useTimelineStore()

  return (
    <div className="flex items-center gap-1 px-4 py-1">
      <span className="text-xs text-muted-foreground">
        当前视图：{granularity === 'day' ? '日' : granularity === 'week' ? '周' : granularity === 'month' ? '月' : '年'}
      </span>
    </div>
  )
}
