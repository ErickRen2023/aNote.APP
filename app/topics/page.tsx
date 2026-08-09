'use client'

import { Suspense } from 'react'
import { TopicList } from '@/components/topic/TopicList'

function TopicsContent() {
  return (
    <div className="flex flex-col h-full">
      {/* Topic cards grid */}
      <div className="overflow-y-auto">
        <TopicList />
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
