'use client'

import { Suspense } from 'react'
import { TimelineCanvas } from '@/components/timeline/TimelineCanvas'
import { TimelineBreadcrumb } from '@/components/timeline/TimelineBreadcrumb'
import { TimelineDeepLink } from '@/components/timeline/TimelineDeepLink'
import { TagFilter } from '@/components/tag/TagFilter'

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={null}>
        <TimelineDeepLink />
      </Suspense>
      <TimelineBreadcrumb />
      <TagFilter />
      <TimelineCanvas />
    </div>
  )
}
