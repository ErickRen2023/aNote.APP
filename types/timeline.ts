import type { CardType, TagInfo } from './card'

export type Granularity = 'year' | 'month' | 'week' | 'day'

// Day view
export interface DayCardData {
  id: number
  title: string
  card_type: CardType
  timestamp: string
  tags: TagInfo[]
  content_summary: string
}

export interface DayTimelineData {
  granularity: 'day'
  date: string
  total: number
  am: DayCardData[]
  pm: DayCardData[]
  now_marker: string
}

// Week view
export interface WeekDayData {
  date: string
  weekday: number
  count: number
  cards: DayCardData[]
}

export interface WeekTimelineData {
  granularity: 'week'
  week_start: string
  week_end: string
  total: number
  days: WeekDayData[]
}

// Month view
export interface HeatmapCell {
  date: string
  count: number
  level: number // 0-4
}

export interface TagDistribution {
  name: string
  count: number
  color: string
}

export interface MonthTimelineData {
  granularity: 'month'
  month: string
  total: number
  heatmap: HeatmapCell[]
  highlights: DayCardData[]
  tag_distribution: TagDistribution[]
}

// Year view
export interface YearMonthData {
  month: string
  count: number
  highlights: DayCardData[]
}

export interface YearTimelineData {
  granularity: 'year'
  year: string
  total: number
  months: YearMonthData[]
  tag_distribution: TagDistribution[]
  top_tags: TagDistribution[]
}

export type TimelineData =
  | DayTimelineData
  | WeekTimelineData
  | MonthTimelineData
  | YearTimelineData

// Topic types
export interface TopicInfo {
  tag_id: number
  name: string
  color: string
  card_count: number
  last_used_at: string | null
  children?: TopicInfo[]
}

export interface TopicListResponse {
  topics: TopicInfo[]
}
