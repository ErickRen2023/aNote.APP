'use client'

import { DragOverlay, type DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { CardItem } from './CardList'
import type { DayCardData } from '@/types'

export function CardDragLayer({ activeCard }: { activeCard: DayCardData | null }) {
  return (
    <DragOverlay dropAnimation={null}>
      {activeCard ? (
        <div className="rotate-2 opacity-90 scale-105 shadow-xl">
          <CardItem card={activeCard} compact />
        </div>
      ) : null}
    </DragOverlay>
  )
}

// Hook to manage drag state
export function useCardDragState() {
  const [activeCard, setActiveCard] = useState<DayCardData | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const cardData = event.active.data.current?.card as DayCardData | undefined
    if (cardData) {
      setActiveCard(cardData)
    }
  }

  const handleDragEnd = () => {
    setActiveCard(null)
  }

  return {
    activeCard,
    handleDragStart,
    handleDragEnd,
  }
}
