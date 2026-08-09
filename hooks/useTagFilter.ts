'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tagApi } from '@/lib/api'
import { useFilterStore } from '@/stores/filterStore'
import type { CreateTagRequest, DeleteTagRequest, Tag, UpdateTagRequest } from '@/types'

function invalidateTagQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['tags'] })
  queryClient.invalidateQueries({ queryKey: ['topics'] })
  queryClient.invalidateQueries({ queryKey: ['timeline'] })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await tagApi.list(false)
      return response.data.tags
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTagRequest) => {
      const response = await tagApi.create(data)
      return response.data
    },
    onSuccess: () => invalidateTagQueries(queryClient),
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateTagRequest) => {
      const response = await tagApi.update(data)
      return response.data
    },
    onSuccess: () => invalidateTagQueries(queryClient),
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: DeleteTagRequest) => {
      await tagApi.delete(data)
      return data.tag_id
    },
    onSuccess: () => invalidateTagQueries(queryClient),
  })
}

export function useTagFilter() {
  const { selectedTags, toggleTag, setSelectedTags } = useFilterStore()
  const { data: tags } = useTags()

  const isSelected = (tagName: string) => selectedTags.includes(tagName)
  const clearSelection = () => setSelectedTags([])

  return {
    tags: tags || [],
    selectedTags,
    toggleTag,
    isSelected,
    clearSelection,
    hasFilters: selectedTags.length > 0,
  }
}

/**
 * Flatten a tag tree into a single array for picker use.
 */
export function flattenTags(tags: Tag[]): Tag[] {
  const result: Tag[] = []
  function walk(list: Tag[]) {
    for (const tag of list) {
      result.push(tag)
      if (tag.children && tag.children.length > 0) {
        walk(tag.children)
      }
    }
  }
  walk(tags)
  return result
}
