export interface Tag {
  id: number
  name: string
  color: string
  parent_id: number | null
  card_count: number
  last_used_at: string | null
  created_at?: string
  children: Tag[]
}

export interface CreateTagRequest {
  name: string
  color?: string
  parent_id?: number | null
}

export interface UpdateTagRequest {
  tag_id: number
  name?: string
  color?: string
  parent_id?: number | null
}

export interface DeleteTagRequest {
  tag_id: number
}

export interface TagListResponse {
  tags: Tag[]
}
