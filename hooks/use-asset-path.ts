/**
 * Утилита для правильной работы с путями при использовании basePath
 * На локальной машине: /placeholder.svg
 * На сервере с basePath=/osteo: /osteo/placeholder.svg
 */

export function useAssetPath() {
  /**
   * Конвертирует относительный путь в абсолютный с учётом basePath
   * @param path - путь начинающийся с /
   * @returns полный путь с basePath если он установлен
   */
  const assetPath = (path: string): string => {
    if (typeof window === "undefined") {
      // На сервере используем переменную окружения
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
      return basePath + path
    }

    // На клиенте используем next/router basePath
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
    if (basePath && !path.startsWith(basePath)) {
      return basePath + path
    }
    return path
  }

  return { assetPath }
}
