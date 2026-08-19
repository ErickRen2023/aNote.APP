'use client'

import { useMemo, useState } from 'react'
import { Check, LoaderCircle, Pencil, Plus, Tag as TagIcon, Trash2, X } from 'lucide-react'
import { flattenTags, useCreateTag, useDeleteTag, useTags, useUpdateTag } from '@/hooks/useTagFilter'
import { useFilterStore } from '@/stores/filterStore'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types'

const TAG_COLORS = ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED']

export function TagManager() {
  const { data, isLoading } = useTags()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()
  const { selectedTags, setSelectedTags } = useFilterStore()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(TAG_COLORS[0])
  const [editing, setEditing] = useState<Tag | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState(TAG_COLORS[0])
  const [deleting, setDeleting] = useState<Tag | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tags = useMemo(() => (data ? flattenTags(data) : []), [data])

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name || createTag.isPending) return
    setError(null)
    try {
      await createTag.mutateAsync({ name, color: newColor })
      setNewName('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '创建标签失败')
    }
  }

  const startEdit = (tag: Tag) => {
    setEditing(tag)
    setEditName(tag.name)
    setEditColor(tag.color)
    setDeleting(null)
    setError(null)
  }

  const handleUpdate = async () => {
    const name = editName.trim()
    if (!editing || !name || updateTag.isPending) return
    setError(null)
    try {
      await updateTag.mutateAsync({ tag_id: editing.id, name, color: editColor })
      if (selectedTags.includes(editing.name)) {
        setSelectedTags(selectedTags.map((tagName) => tagName === editing.name ? name : tagName))
      }
      setEditing(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '更新标签失败')
    }
  }

  const handleDelete = async () => {
    if (!deleting || deleteTag.isPending) return
    setError(null)
    try {
      await deleteTag.mutateAsync({ tag_id: deleting.id })
      setSelectedTags(selectedTags.filter((tagName) => tagName !== deleting.name))
      setDeleting(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '删除标签失败')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> 加载标签中...
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-muted/20">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-7">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">Organize</p>
          <h1 className="text-2xl font-semibold tracking-tight">标签管理</h1>
          <p className="mt-2 text-sm text-muted-foreground">整理标签名称和颜色，让时间线与标签视图更容易浏览。</p>
        </div>

        <section className="mb-6 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">新建标签</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={newName}
              onChange={(event) => { setNewName(event.target.value); setError(null) }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void handleCreate()
                }
              }}
              maxLength={100}
              placeholder="输入标签名称"
              className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <ColorPicker value={newColor} onChange={setNewColor} />
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={!newName.trim() || createTag.isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createTag.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              创建
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <TagIcon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">全部标签</h2>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{tags.length} 个</span>
          </div>

          {tags.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <TagIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">还没有标签</p>
              <p className="mt-1 text-xs text-muted-foreground">在上方创建第一个标签吧</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tags.map((tag) => (
                <div key={tag.id} className="px-5 py-4">
                  {editing?.id === tag.id ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && void handleUpdate()}
                        maxLength={100}
                        autoFocus
                        aria-label="编辑标签名称"
                        className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                      <ColorPicker value={editColor} onChange={setEditColor} compact />
                      <div className="flex gap-1">
                        <button type="button" onClick={() => void handleUpdate()} disabled={!editName.trim() || updateTag.isPending} aria-label="保存标签" className="rounded-md p-2 text-primary hover:bg-primary/10 disabled:opacity-50">
                          {updateTag.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </button>
                        <button type="button" onClick={() => setEditing(null)} aria-label="取消编辑" className="rounded-md p-2 text-muted-foreground hover:bg-accent"><X className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 shrink-0 rounded-full ring-4 ring-current/10" style={{ backgroundColor: tag.color, color: tag.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{tag.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{tag.card_count} 张卡片</p>
                      </div>
                      <button type="button" onClick={() => startEdit(tag)} aria-label={`编辑标签 ${tag.name}`} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => { setDeleting(tag); setEditing(null); setError(null) }} aria-label={`删除标签 ${tag.name}`} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}

                  {deleting?.id === tag.id && (
                    <div className="mt-3 flex flex-col gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 sm:flex-row sm:items-center">
                      <p className="flex-1 text-xs text-foreground">
                        确定删除“{tag.name}”？标签会从 {tag.card_count} 张卡片中移除，卡片本身不会被删除。
                      </p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setDeleting(null)} className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-background">取消</button>
                        <button type="button" onClick={() => void handleDelete()} disabled={deleteTag.isPending} className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">
                          {deleteTag.isPending && <LoaderCircle className="h-3 w-3 animate-spin" />} 删除标签
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ColorPicker({ value, onChange, compact = false }: { value: string; onChange: (color: string) => void; compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-1.5', !compact && 'rounded-lg border border-border px-2.5 py-2')} aria-label="选择标签颜色">
      {TAG_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`标签颜色 ${color}`}
          onClick={() => onChange(color)}
          className={cn('h-5 w-5 rounded-full border-2 transition-transform hover:scale-110', value === color ? 'border-foreground scale-110' : 'border-transparent')}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}
