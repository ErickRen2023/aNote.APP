import { openDB, type IDBPDatabase } from 'idb'
import type { TimelineData } from '@/types'

const DB_NAME = 'mynote-cache'
const DB_VERSION = 1

let dbInstance: IDBPDatabase | null = null

async function getDb(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Timeline data store
      if (!db.objectStoreNames.contains('timeline')) {
        db.createObjectStore('timeline', { keyPath: 'cacheKey' })
      }
      // Tags store
      if (!db.objectStoreNames.contains('tags')) {
        db.createObjectStore('tags', { keyPath: 'id' })
      }
      // Link cache store
      if (!db.objectStoreNames.contains('linkCache')) {
        db.createObjectStore('linkCache', { keyPath: 'url' })
      }
    },
  })

  return dbInstance
}

// ==================== Timeline Cache ====================

export async function getTimelineCache(key: string): Promise<TimelineData | null> {
  try {
    const db = await getDb()
    const cached = await db.get('timeline', key)
    if (cached) {
      return cached.data as TimelineData
    }
    return null
  } catch {
    return null
  }
}

export async function setTimelineCache(key: string, data: TimelineData): Promise<void> {
  try {
    const db = await getDb()
    await db.put('timeline', {
      cacheKey: key,
      data,
      updatedAt: Date.now(),
    })
  } catch {
    // Silently fail cache writes
  }
}

// ==================== Link Cache ====================

export async function getLinkCache(url: string): Promise<string | null> {
  try {
    const db = await getDb()
    const cached = await db.get('linkCache', url)
    if (cached) {
      return cached.title as string
    }
    return null
  } catch {
    return null
  }
}

export async function setLinkCache(url: string, title: string): Promise<void> {
  try {
    const db = await getDb()
    await db.put('linkCache', {
      url,
      title,
      cachedAt: Date.now(),
    })
  } catch {
    // Silently fail
  }
}

// ==================== Tags Cache ====================

export async function getTagsCache(): Promise<unknown[] | null> {
  try {
    const db = await getDb()
    const all = await db.getAll('tags')
    return all.length > 0 ? all : null
  } catch {
    return null
  }
}

export async function setTagsCache(tags: unknown[]): Promise<void> {
  try {
    const db = await getDb()
    const tx = db.transaction('tags', 'readwrite')
    await tx.store.clear()
    for (const tag of tags) {
      await tx.store.put(tag)
    }
    await tx.done
  } catch {
    // Silently fail
  }
}

// ==================== Cleanup ====================

export async function clearCache(): Promise<void> {
  try {
    const db = await getDb()
    const tx = db.transaction(['timeline', 'linkCache'], 'readwrite')
    await tx.objectStore('timeline').clear()
    await tx.objectStore('linkCache').clear()
    await tx.done
  } catch {
    // Silently fail
  }
}
