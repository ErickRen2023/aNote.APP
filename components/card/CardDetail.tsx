'use client'

import { useUIStore } from '@/stores/uiStore'
import { useCardDetail, useDeleteCard } from '@/hooks/useCards'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  X,
  ExternalLink,
  Pencil,
  Trash2,
  Clock,
  Tag as TagIcon,
} from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'

export function CardDetail() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isCardDetailOpen, detailCardId, closeCardDetail, openCardEditor } = useUIStore()
  const { data: card, isLoading } = useCardDetail(detailCardId)
  const deleteCard = useDeleteCard()
  const returnTo = searchParams.get('returnTo')
  const safeReturnTo = returnTo?.startsWith('/search') ? returnTo : null

  const handleCloseDetail = () => {
    closeCardDetail()
    if (safeReturnTo) {
      const remainingParams = new URLSearchParams(searchParams.toString())
      remainingParams.delete('card')
      remainingParams.delete('returnTo')
      const queryString = remainingParams.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname)
    }
  }

  const handleReturnToSearch = () => {
    if (!safeReturnTo) return
    closeCardDetail()
    router.push(safeReturnTo)
  }

  const handleEdit = () => {
    if (detailCardId) {
      closeCardDetail()
      openCardEditor(detailCardId)
    }
  }

  const handleDelete = async () => {
    if (detailCardId && confirm('确定要删除这张卡片吗？此操作不可撤销。')) {
      try {
        await deleteCard.mutateAsync(detailCardId)
        handleCloseDetail()
      } catch {
        // Error handled by mutation
      }
    }
  }

  return (
    <Dialog.Root open={isCardDetailOpen} onOpenChange={(open) => !open && handleCloseDetail()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-in fade-in" />
        <Dialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-full max-w-lg max-h-[80vh] overflow-y-auto',
            'bg-card border border-border rounded-xl shadow-2xl',
            'animate-in fade-in duration-200'
          )}
        >
          {isLoading ? (
            <div className="p-6 space-y-4">
              <div className="animate-pulse h-6 bg-muted rounded w-3/4" />
              <div className="animate-pulse h-4 bg-muted rounded w-1/2" />
              <div className="animate-pulse h-32 bg-muted rounded" />
            </div>
          ) : card ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="min-w-0 pr-4">
                  {safeReturnTo && (
                    <button
                      type="button"
                      onClick={handleReturnToSearch}
                      className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      返回搜索结果
                    </button>
                  )}
                  <Dialog.Title className="truncate text-lg font-semibold">
                    {card.title || '无标题'}
                  </Dialog.Title>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleEdit}
                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                    title="编辑"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCloseDetail}
                    aria-label="关闭详情"
                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-4">
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(card.timestamp), 'yyyy年M月d日 HH:mm')}
                  </span>
                </div>

                {/* Source URL */}
                {card.source_url && (
                  <a
                    href={card.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {card.source_url}
                  </a>
                )}

                {/* Tags */}
                {card.tags && card.tags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <TagIcon className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1.5">
                      {card.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: (tag.color || '#3B82F6') + '20',
                            color: tag.color || '#3B82F6',
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="border-t border-border pt-4">
                  <div
                    className="card-content"
                    dangerouslySetInnerHTML={{ __html: card.content || '<p class="text-muted-foreground">无内容</p>' }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              卡片不存在或已被删除
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
