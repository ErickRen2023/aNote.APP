import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function plainText(value: string | undefined): string {
  if (!value) return ''

  const entities: Record<string, string> = {
    nbsp: ' ',
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    '#39': "'",
  }
  let decoded = value

  // Summaries may contain encoded (or double-encoded) editor HTML. Decode
  // common entities first, then remove complete and truncated HTML tags.
  for (let pass = 0; pass < 2; pass += 1) {
    decoded = decoded.replace(
      /&(nbsp|amp|lt|gt|quot|#39);/gi,
      (entity) => entities[entity.slice(1, -1).toLowerCase()] || entity
    )
  }

  return decoded
    .replace(/<[^>]*(?:>|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
