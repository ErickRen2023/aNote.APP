import { create } from 'zustand'
interface FilterState {
  selectedTags: string[]
  searchQuery: string

  // Actions
  setSelectedTags: (tags: string[]) => void
  toggleTag: (tag: string) => void
  setSearchQuery: (query: string) => void
  clearFilters: () => void
  hasActiveFilters: () => boolean
}

export const useFilterStore = create<FilterState>((set, get) => ({
  selectedTags: [],
  searchQuery: '',

  setSelectedTags: (tags) => set({ selectedTags: tags }),

  toggleTag: (tag) =>
    set((s) => ({
      selectedTags: s.selectedTags.includes(tag)
        ? s.selectedTags.filter((t) => t !== tag)
        : [...s.selectedTags, tag],
    })),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  clearFilters: () => set({ selectedTags: [], searchQuery: '' }),

  hasActiveFilters: () => {
    const { selectedTags, searchQuery } = get()
    return selectedTags.length > 0 || searchQuery !== ''
  },
}))
