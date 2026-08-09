'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useUIStore } from '@/stores/uiStore'
import { useCreateCard, useUpdateCard, useCardDetail } from '@/hooks/useCards'
import { useLinkParser } from '@/hooks/useLinkParser'
import { TagPicker } from '@/components/tag/TagPicker'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  X,
  Link as LinkIcon,
  Bold,
  Italic,
  Heading,
  Code,
  Quote,
  List,
  ListOrdered,
} from 'lucide-react'
import type { TagInfo } from '@/types'
import * as Dialog from '@radix-ui/react-dialog'

// Toolbar button component
function ToolbarBtn({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded text-sm transition-colors',
        active ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

export function CardEditor() {
  const { isCardEditorOpen, editorCardId, closeCardEditor } = useUIStore()
  const { data: existingCard } = useCardDetail(editorCardId)
  const createCard = useCreateCard()
  const updateCard = useUpdateCard()
  const { parseLink, isParsing: isParsingLink } = useLinkParser()

  const [title, setTitle] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [timestamp, setTimestamp] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  )
  const [selectedTags, setSelectedTags] = useState<TagInfo[]>([])
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!editorCardId

  // Initialize TipTap editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      LinkExtension.configure({
        openOnClick: true,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
      }),
      Placeholder.configure({
        placeholder: '输入 Markdown 格式的评论内容...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[180px] p-3',
      },
    },
  })

  // Load existing card data when editing
  useEffect(() => {
    if (existingCard && isEditing) {
      setTitle(existingCard.title || '')
      setSourceUrl(existingCard.source_url || '')
      setTimestamp(format(new Date(existingCard.timestamp), "yyyy-MM-dd'T'HH:mm"))
      setSelectedTags(existingCard.tags)
      editor?.commands.setContent(existingCard.content || '')
    } else if (!isEditing) {
      // Reset for new card
      setTitle('')
      setSourceUrl('')
      setTimestamp(format(new Date(), "yyyy-MM-dd'T'HH:mm"))
      setSelectedTags([])
      editor?.commands.setContent('')
    }
  }, [existingCard, isEditing, editor])

  // Handle paste URL - auto parse title
  const handlePasteUrl = useCallback(async () => {
    if (!sourceUrl || title.trim()) return
    const parsedTitle = await parseLink(sourceUrl)
    if (parsedTitle) {
      setTitle(parsedTitle)
    }
  }, [sourceUrl, title, parseLink])

  useEffect(() => {
    // Auto-parse when URL is pasted and title is empty
    const timer = setTimeout(() => {
      handlePasteUrl()
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceUrl])

  // Save card
  const handleSave = async () => {
    setError(null)
    const content = editor?.getHTML() || ''

    // Keep the user's wall-clock time. Converting to UTC here can move a card to
    // the previous/next day and makes Python 3.9 reject the trailing `Z`.
    const isoDate = timestamp

    try {
      if (isEditing && editorCardId) {
        await updateCard.mutateAsync({
          card_id: editorCardId,
          title,
          content,
          source_url: sourceUrl || undefined,
          timestamp: isoDate,
          tags: selectedTags.map((t) => t.name),
        })
      } else {
        await createCard.mutateAsync({
          title,
          content,
          card_type: 'original',
          source_url: sourceUrl || undefined,
          timestamp: isoDate,
          tags: selectedTags.map((t) => t.name),
        })
      }
      closeCardEditor()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    }
  }

  const isSaving = createCard.isPending || updateCard.isPending

  return (
    <Dialog.Root open={isCardEditorOpen} onOpenChange={(open) => !open && closeCardEditor()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
        <Dialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'w-full max-w-2xl max-h-[85vh] overflow-y-auto',
            'bg-card border border-border rounded-xl shadow-2xl',
            'animate-in fade-in duration-200'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <Dialog.Title className="text-lg font-semibold">
              {isEditing ? '编辑卡片' : '创建卡片'}
            </Dialog.Title>
            <button
              onClick={closeCardEditor}
              className="p-1 rounded-md hover:bg-accent text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="卡片标题（可选，粘贴链接后自动解析）"
                className="w-full px-3 py-2 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Source URL */}
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                onBlur={handlePasteUrl}
                placeholder="知识来源链接（粘贴后自动解析标题）"
                className="flex-1 px-3 py-2 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              {isParsingLink && (
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              )}
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground shrink-0">卡片时间：</label>
              <input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="flex-1 px-3 py-2 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {/* Tags */}
            <div>
              <TagPicker selectedTags={selectedTags} onTagsChange={setSelectedTags} />
            </div>

            {/* TipTap Editor */}
            <div className="border border-border rounded-lg overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30">
                <ToolbarBtn
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  active={editor?.isActive('bold')}
                  title="加粗"
                >
                  <Bold className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  active={editor?.isActive('italic')}
                  title="斜体"
                >
                  <Italic className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  active={editor?.isActive('heading', { level: 2 })}
                  title="标题"
                >
                  <Heading className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  active={editor?.isActive('blockquote')}
                  title="引用"
                >
                  <Quote className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                  active={editor?.isActive('codeBlock')}
                  title="代码块"
                >
                  <Code className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  active={editor?.isActive('bulletList')}
                  title="无序列表"
                >
                  <List className="w-4 h-4" />
                </ToolbarBtn>
                <ToolbarBtn
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  active={editor?.isActive('orderedList')}
                  title="有序列表"
                >
                  <ListOrdered className="w-4 h-4" />
                </ToolbarBtn>
              </div>
              <EditorContent editor={editor} />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
            <button
              onClick={closeCardEditor}
              className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'px-6 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium',
                isSaving && 'opacity-60 cursor-not-allowed'
              )}
            >
              {isSaving ? '保存中...' : isEditing ? '更新' : '创建'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
