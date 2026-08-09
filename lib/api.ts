import type {
  ApiResponse,
  Card,
  CardListResponse,
  CreateCardRequest,
  UpdateCardRequest,
  DeleteCardRequest,
  BatchUpdateRequest,
  BatchUpdateResponse,
  TagListResponse,
  Tag,
  CreateTagRequest,
  UpdateTagRequest,
  DeleteTagRequest,
  TimelineData,
  TopicListResponse,
  DayCardData,
  Granularity,
} from '@/types'
import { clearAuth, getAuthToken } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/v1'

async function request<T>(
  method: string,
  path: string,
  params?: Record<string, string | number | undefined>,
  body?: unknown
): Promise<ApiResponse<T>> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }

  const response = await fetch(url.toString(), options)
  if (response.status === 401 && typeof window !== 'undefined') {
    clearAuth()
    if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/auth/sso')) {
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
    }
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json()
}

function get<T>(path: string, params?: Record<string, string | number | undefined>) {
  return request<T>('GET', path, params)
}

function post<T>(path: string, body?: unknown) {
  return request<T>('POST', path, undefined, body)
}

// ==================== Card APIs ====================

export const cardApi = {
  create: (data: CreateCardRequest) =>
    post<Card>('/cards/create', data),

  update: (data: UpdateCardRequest) =>
    post<Card>('/cards/update', data),

  delete: (data: DeleteCardRequest) =>
    post<null>('/cards/delete', data),

  list: (params: {
    start_time?: string
    end_time?: string
    tags?: string
    card_type?: string
    page?: number
    page_size?: number
    sort?: string
  }) => get<CardListResponse>('/cards/list', params),

  detail: (cardId: number) =>
    get<Card>('/cards/detail', { card_id: cardId }),

  batchUpdate: (data: BatchUpdateRequest) =>
    post<BatchUpdateResponse>('/cards/batch-update', data),
}

// ==================== Timeline API ====================

export const timelineApi = {
  get: (params: {
    granularity: Granularity
    date: string
    tags?: string
  }) => get<TimelineData>('/timeline', params),
}

// ==================== Tag APIs ====================

export const tagApi = {
  list: (flat = false) =>
    get<TagListResponse>('/tags/list', { flat: String(flat) }),

  create: (data: CreateTagRequest) =>
    post<Tag>('/tags/create', data),

  update: (data: UpdateTagRequest) =>
    post<Tag>('/tags/update', data),

  delete: (data: DeleteTagRequest) =>
    post<null>('/tags/delete', data),
}

// ==================== Topic APIs ====================

export const topicApi = {
  list: (params?: {
    sort_by?: string
    sort_order?: string
  }) => get<TopicListResponse>('/topics/list', params),

  cards: (params: {
    tag_ids: string
    page?: number
    page_size?: number
    sort?: string
  }) => get<{ topic_info: { tags: Array<{ id: number; name: string; color: string }> }; items: DayCardData[]; total: number; page: number; page_size: number }>('/topics/cards', params),
}

// ==================== Search API ====================

export const searchApi = {
  search: (params: {
    q?: string
    tags?: string
    start_time?: string
    end_time?: string
    card_type?: string
    page?: number
    page_size?: number
  }) => get<{
    query: Record<string, unknown>
    items: Array<DayCardData & { content_snippet: string; relevance_score: number }>
    total: number
    page: number
    page_size: number
  }>('/search', params),
}

// ==================== Link Parser API ====================

export const linkParserApi = {
  parse: (url: string) =>
    post<{
      url: string
      title: string | null
      from_cache: boolean
      error?: string
    }>('/link-parser', { url }),
}
