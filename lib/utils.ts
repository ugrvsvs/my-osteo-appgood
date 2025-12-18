import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getThumbnailSrcUrl(thumbnailUrl: string | undefined): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  const placeholder = `${basePath}/placeholder.svg?height=180&width=320&query=thumbnail`
  
  if (!thumbnailUrl) return placeholder
  
  // Если это уже полный URL, вернуть как есть
  if (thumbnailUrl.startsWith('http')) return thumbnailUrl
  
  // Если это путь от API (/api/uploads/...), заменить на /uploads/...
  if (thumbnailUrl.startsWith('/api/uploads')) {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${thumbnailUrl.replace('/api/uploads', '/uploads')}`
  }
  
  // Если это просто /uploads/..., добавить базовый URL
  if (thumbnailUrl.startsWith('/uploads')) {
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${thumbnailUrl}`
  }
  
  return placeholder
}
