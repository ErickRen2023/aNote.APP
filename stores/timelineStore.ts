import { create } from 'zustand'
import type { Granularity } from '@/types'

interface TimelineState {
  granularity: Granularity
  currentDate: Date
  isAnimating: boolean

  // Actions
  setGranularity: (g: Granularity) => void
  setCurrentDate: (d: Date) => void
  navigate: (direction: 'prev' | 'next') => void
  goToToday: () => void
  setAnimating: (v: boolean) => void
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  granularity: 'day',
  currentDate: new Date(),
  isAnimating: false,

  setGranularity: (granularity) => set({ granularity, isAnimating: true }),

  setCurrentDate: (currentDate) => set({ currentDate }),

  navigate: (direction) => {
    const { currentDate, granularity } = get()
    const d = new Date(currentDate)
    d.setHours(0, 0, 0, 0)

    switch (granularity) {
      case 'year':
        d.setFullYear(d.getFullYear() + (direction === 'next' ? 1 : -1))
        break
      case 'month':
        d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        d.setDate(d.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'day':
        d.setDate(d.getDate() + (direction === 'next' ? 1 : -1))
        break
    }
    set({ currentDate: d })
  },

  goToToday: () => set({ currentDate: new Date(), granularity: 'day' }),

  setAnimating: (isAnimating) => set({ isAnimating }),
}))
