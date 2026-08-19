'use client'

import { Suspense } from 'react'
import { TopicList } from '@/components/topic/TopicList'
import { TopicTimeline } from '@/components/topic/TopicTimeline'
import { useSearchParams } from 'next/navigation'

function TopicsContent() {
  const searchParams = useSearchParams()
  const hasSelectedTags = Boolean(searchParams.get('tag_ids'))

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto">
        {hasSelectedTags ? <TopicTimeline /> : <TopicList />}
      </div>
    </div>
  )
}

export default function TopicsPage() {
  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">加载中...</div>}>
        <TopicsContent />
      </Suspense>
    </div>
  )
}
