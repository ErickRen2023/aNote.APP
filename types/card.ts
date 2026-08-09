// ==================== Card Types ====================

export type CardType = 'original' | 'inspiration'

export interface TagInfo {
  id: number
  name: string
  color: string
}

export interface Card {
  id: number
  title: string
  content: string
  card_type: CardType
  source_url: string | null
  timestamp: string
  tags: TagInfo[]
  created_at: string
  updated_at: string
}

export interface CardSummary {
  id: number
  title: string
  content_summary?: string
  card_type: CardType
  source_url: string | null
  timestamp: string
  tags: TagInfo[]
  created_at: string
  updated_at: string
}

// Request types
export interface CreateCardRequest {
  title?: string
  content?: string
  card_type: CardType
  source_url?: string
  timestamp: string
  tags?: string[]
}

export interface UpdateCardRequest {
  card_id: number
  title?: string
  content?: string
  source_url?: string
  timestamp?: string
  tags?: string[]
}

export interface DeleteCardRequest {
  card_id: number
}

export interface BatchUpdateRequest {
  action: 'add_tags' | 'remove_tags' | 'delete'
  card_ids: number[]
  tags?: string[]
}

// Response types
export interface CardListResponse {
  items: CardSummary[]
  total: number
  page: number
  page_size: number
}

export interface BatchUpdateResponse {
  success_count: number
  failed_count: number
  failed_ids: Array<{ id: number; reason: string }>
}

// API wrapper
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
