'use client'

const DB_NAME = 'pagesprout-v1'
const DB_VERSION = 1
const STORES = ['history', 'content', 'favorites', 'meta'] as const
type StoreName = (typeof STORES)[number]
let databasePromise: Promise<IDBDatabase> | undefined

function openDatabase(): Promise<IDBDatabase> {
  databasePromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      for (const name of STORES) if (!db.objectStoreNames.contains(name)) db.createObjectStore(name)
    }
    request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result) }
    request.onerror = () => { databasePromise = undefined; reject(request.error) }
  })
  return databasePromise
}

export async function idbGet<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  if (typeof indexedDB === 'undefined') return undefined
  try {
    const db = await openDatabase()
    return await new Promise<T | undefined>((resolve, reject) => {
      const request = db.transaction(store, 'readonly').objectStore(store).get(key)
      request.onsuccess = () => resolve(request.result as T | undefined)
      request.onerror = () => reject(request.error)
    })
  } catch { return undefined }
}

export async function idbSet(store: StoreName, key: IDBValidKey, value: unknown): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  try {
    const db = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite')
      tx.objectStore(store).put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch { /* Memory-only mode remains usable. */ }
}

export async function clearAllLocalData(): Promise<void> {
  if (typeof indexedDB !== 'undefined') {
    const database = await databasePromise?.catch(() => undefined)
    database?.close(); databasePromise = undefined
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      request.onblocked = () => reject(new Error('本地数据库仍被其他页面占用，请关闭其他页边窗口后重试。'))
    })
  }
  if ('caches' in globalThis) {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key.startsWith('pagesprout-')).map((key) => caches.delete(key)))
  }
  localStorage.removeItem('pagesprout-ui')
  localStorage.removeItem('pagesprout:last-namespace')
}
