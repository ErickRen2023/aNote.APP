import type { Granularity } from '@/types'

/**
 * Generate a cache key for timeline data based on granularity and date.
 */
export function getTimelineCacheKey(granularity: Granularity, date: string): string {
  return `timeline:${granularity}:${date}`
}

/**
 * Format date for the API based on granularity.
 */
export function formatDateForApi(date: Date, granularity: Granularity): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  switch (granularity) {
    case 'year':
      return String(year)
    case 'month':
      return `${year}-${month}`
    case 'week':
      return `${year}-${month}-${day}`
    case 'day':
      return `${year}-${month}-${day}`
  }
}

/**
 * Get the week start (Monday) for a given date.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Convert Sunday (0) to 7 for Monday-based week
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the week end (Sunday) for a given date.
 */
export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Calculate heatmap level (0-4) based on count vs max.
 */
export function getHeatmapLevel(count: number, max: number): number {
  if (count === 0) return 0
  if (max === 0) return 0
  const ratio = count / max
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

/**
 * Generate a formatted date label based on granularity.
 */
export function formatDateLabel(date: Date, granularity: Granularity): string {
  switch (granularity) {
    case 'year':
      return `${date.getFullYear()}`
    case 'month':
      return `${date.getFullYear()}年${date.getMonth() + 1}月`
    case 'week':
      return `第${getWeekNumber(date)}周`
    case 'day':
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
}

function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  const oneWeek = 604800000
  return Math.ceil((diff / oneWeek + start.getDay() + 1) / 7)
}

/**
 * Navigate through time for each granularity.
 */
export function navigateDate(
  currentDate: Date,
  granularity: Granularity,
  direction: 'prev' | 'next'
): Date {
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
  return d
}

/**
 * Get all dates in a month for heatmap rendering.
 */
export function getMonthDates(year: number, month: number): Date[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dates: Date[] = []
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i))
  }
  return dates
}

/**
 * Format a timestamp string to a short time string (e.g., "14:30").
 */
export function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * Check if two dates are the same day.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Check if a date is today.
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}
