"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

/**
 * DEPRECATED - REDIRECT TO NEW PATH
 * Старая ссылка: /p/[token] -> новая ссылка: /share/[token]
 * Этот редирект обеспечивает обратную совместимость
 */
export default function LegacyPatientPortalRedirect() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string | undefined

  useEffect(() => {
    if (token) {
      // Редирект на новый путь
      router.push(`/share/${token}`)
    }
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    </div>
  )
}
