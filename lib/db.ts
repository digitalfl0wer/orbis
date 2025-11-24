import type { DBSchema, IDBPDatabase } from 'idb'
import { openDB } from 'idb'

export type ProblemRecord = {
  id: string
  title: string
  prompt: string
  constraints?: string
  examples?: string
  tags?: string[]
  source?: string
  createdAt: number
}

export type ScheduleRecord = {
  problemId: string
  nextDueAt: number
  lastRating: number
  ratingHistory: number[]
  leechCount: number
  snoozedUntil?: number
  createdAt: number
  updatedAt: number
}

export type FavoriteRecord = {
  problemId: string
  reasonTags: string[]
  isArchived?: boolean
  activeUntil?: number
  createdAt: number
  updatedAt: number
}

export type ErrorBankRecord = {
  id: string
  problemId: string
  date: number
  assistanceLevel?: string
  categories: string[]
  failingEvidence?: string
  rootCause?: string
  fixInsight?: string
}

export type ChatMessageRecord = {
  id: string // `${problemId}-${timestamp}-${role}`
  problemId: string
  date: number
  role: 'user' | 'assistant'
  content: string
}

export interface OrbisSchema extends DBSchema {
  problems: {
    key: string
    value: ProblemRecord
    indexes: {
      by_createdAt: number
    }
  }
  schedules: {
    key: string
    value: ScheduleRecord
    indexes: {
      by_nextDueAt: number
    }
  }
  favorites: {
    key: string
    value: FavoriteRecord
    indexes: {
      by_createdAt: number
    }
  }
  errorBank: {
    key: string
    value: ErrorBankRecord
    indexes: {
      by_problemId: string
      by_date: number
    }
  }
  chat: {
    key: string
    value: ChatMessageRecord
    indexes: {
      by_problemId: string
      by_date: number
    }
  }
}

export type OrbisDB = IDBPDatabase<OrbisSchema>

let dbPromise: Promise<OrbisDB> | null = null

export async function getDB(): Promise<OrbisDB> {
  if (!dbPromise) {
    dbPromise = openDB<OrbisSchema>('orbis-db', 4, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('problems')) {
          const problems = db.createObjectStore('problems', { keyPath: 'id' })
          problems.createIndex('by_createdAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains('schedules')) {
          const schedules = db.createObjectStore('schedules', { keyPath: 'problemId' })
          schedules.createIndex('by_nextDueAt', 'nextDueAt')
        }
        if (!db.objectStoreNames.contains('favorites')) {
          const favorites = db.createObjectStore('favorites', { keyPath: 'problemId' })
          favorites.createIndex('by_createdAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains('errorBank')) {
          const eb = db.createObjectStore('errorBank', { keyPath: 'id' })
          eb.createIndex('by_problemId', 'problemId')
          eb.createIndex('by_date', 'date')
        }
        if (!db.objectStoreNames.contains('chat')) {
          const chat = db.createObjectStore('chat', { keyPath: 'id' })
          chat.createIndex('by_problemId', 'problemId')
          chat.createIndex('by_date', 'date')
        }
      },
    })
  }
  return dbPromise
}

// Problems CRUD
export async function putProblems(records: ProblemRecord[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('problems', 'readwrite')
  const store = tx.objectStore('problems')
  for (const rec of records) {
    await store.put(rec)
  }
  await tx.done
}

export async function getAllProblems(): Promise<ProblemRecord[]> {
  const db = await getDB()
  return db.getAll('problems')
}

export async function getProblemById(id: string): Promise<ProblemRecord | undefined> {
  const db = await getDB()
  return db.get('problems', id)
}

// Schedules CRUD
export async function upsertSchedule(record: ScheduleRecord): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('schedules', 'readwrite')
  await tx.objectStore('schedules').put(record)
  await tx.done
}

export async function getAllSchedules(): Promise<ScheduleRecord[]> {
  const db = await getDB()
  return db.getAll('schedules')
}

export async function getScheduleByProblemId(problemId: string): Promise<ScheduleRecord | undefined> {
  const db = await getDB()
  return db.get('schedules', problemId)
}

// Favorites CRUD
export async function getFavoriteByProblemId(problemId: string): Promise<FavoriteRecord | undefined> {
  const db = await getDB()
  return db.get('favorites', problemId)
}

export async function putFavorite(record: FavoriteRecord): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('favorites', 'readwrite')
  await tx.objectStore('favorites').put(record)
  await tx.done
}

export async function deleteFavorite(problemId: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('favorites', 'readwrite')
  await tx.objectStore('favorites').delete(problemId)
  await tx.done
}

export async function getAllFavorites(): Promise<FavoriteRecord[]> {
  const db = await getDB()
  return db.getAll('favorites')
}

// Error Bank CRUD
export async function addErrorEntry(rec: ErrorBankRecord): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('errorBank', 'readwrite')
  await tx.objectStore('errorBank').put(rec)
  await tx.done
}

export async function updateErrorEntry(rec: ErrorBankRecord): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('errorBank', 'readwrite')
  await tx.objectStore('errorBank').put(rec)
  await tx.done
}

export async function getAllErrorEntries(): Promise<ErrorBankRecord[]> {
  const db = await getDB()
  return db.getAll('errorBank')
}

export async function getLatestErrorEntryByProblemId(problemId: string): Promise<ErrorBankRecord | undefined> {
  const db = await getDB()
  const index = db.transaction('errorBank').store.index('by_problemId')
  const range = IDBKeyRange.only(problemId)
  const cursor = await index.openCursor(range, 'prev')
  return cursor?.value
}

// Chat CRUD
export async function addChatMessage(rec: ChatMessageRecord): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('chat', 'readwrite')
  await tx.objectStore('chat').put(rec)
  await tx.done
}

export interface PaginationOptions {
  limit?: number
  offset?: number
}

export async function getChatMessagesByProblemId(
  problemId: string,
  opts: PaginationOptions = {}
): Promise<ChatMessageRecord[]> {
  const db = await getDB()
  const index = db.transaction('chat').store.index('by_problemId')
  const range = IDBKeyRange.only(problemId)
  const all = await index.getAll(range)
  const sorted = all.sort((a, b) => a.date - b.date)
  const { offset = 0, limit } = opts
  return limit ? sorted.slice(offset, offset + limit) : sorted.slice(offset)
}
