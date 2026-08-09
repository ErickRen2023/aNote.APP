import { create } from 'zustand'

interface UIState {
  isDrawerOpen: boolean
  isCardEditorOpen: boolean
  editorCardId: number | null
  isCardDetailOpen: boolean
  detailCardId: number | null

  // Actions
  toggleDrawer: () => void
  setDrawerOpen: (v: boolean) => void
  openCardEditor: (cardId?: number | null) => void
  closeCardEditor: () => void
  openCardDetail: (cardId: number) => void
  closeCardDetail: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isDrawerOpen: true,
  isCardEditorOpen: false,
  editorCardId: null,
  isCardDetailOpen: false,
  detailCardId: null,

  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
  openCardEditor: (cardId = null) => set({ isCardEditorOpen: true, editorCardId: cardId }),
  closeCardEditor: () => set({ isCardEditorOpen: false, editorCardId: null }),
  openCardDetail: (cardId) => set({ isCardDetailOpen: true, detailCardId: cardId }),
  closeCardDetail: () => set({ isCardDetailOpen: false, detailCardId: null }),
}))
