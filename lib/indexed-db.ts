/**
 * Хранилище данных с использованием IndexedDB
 * Более надежно чем localStorage, сохраняется при очистке истории браузера
 * Поддерживает большие объемы данных
 */

import type { AppData, Video, Patient, Assignment, VideoView, Template, BodyZone } from "./types"
import { DEFAULT_BODY_ZONES } from "./types"

const DB_NAME = "osteo-app"
const DB_VERSION = 1
const STORE_NAME = "app-data"

let db: IDBDatabase | null = null

// Инициализация базы данных
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME)
      }
    }
  })
}

// Получить БД
async function getDB(): Promise<IDBDatabase> {
  if (!db) {
    db = await initDB()
  }
  return db
}

// Получить данные из IndexedDB
export async function getDataFromIndexedDB(): Promise<AppData | null> {
  if (typeof window === "undefined") return null

  try {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get("app-data")

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  } catch (error) {
    console.error("IndexedDB read error:", error)
    return null
  }
}

// Сохранить данные в IndexedDB
export async function saveDataToIndexedDB(data: AppData): Promise<void> {
  if (typeof window === "undefined") return

  try {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(data, "app-data")

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.error("IndexedDB write error:", error)
  }
}

// Очистить БД
export async function clearDataFromIndexedDB(): Promise<void> {
  if (typeof window === "undefined") return

  try {
    const database = await getDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  } catch (error) {
    console.error("IndexedDB clear error:", error)
  }
}
