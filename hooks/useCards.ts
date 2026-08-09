'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cardApi } from '@/lib/api'
import type { Card, CreateCardRequest, UpdateCardRequest, BatchUpdateRequest } from '@/types'

export function useCardList(params: {
  start_time?: string
  end_time?: string
  tags?: string
  card_type?: string
  page?: number
  page_size?: number
  sort?: string
}) {
  return useQuery({
    queryKey: ['cards', params],
    queryFn: async () => {
      const response = await cardApi.list(params)
      return response.data
    },
    staleTime: 30 * 1000,
  })
}

export function useCardDetail(cardId: number | null) {
  return useQuery({
    queryKey: ['card', cardId],
    queryFn: async () => {
      if (!cardId) return null
      const response = await cardApi.detail(cardId)
      return response.data
    },
    enabled: cardId !== null,
    staleTime: 30 * 1000,
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCardRequest) => {
      const response = await cardApi.create(data)
      return response.data
    },
    onSuccess: () => {
      // Invalidate timeline and card list queries
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['topics'] })
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateCardRequest) => {
      const response = await cardApi.update(data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['card', variables.card_id] })
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cardId: number) => {
      const response = await cardApi.delete({ card_id: cardId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['topics'] })
    },
  })
}

export function useBatchUpdateCards() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BatchUpdateRequest) => {
      const response = await cardApi.batchUpdate(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['topics'] })
    },
  })
}
