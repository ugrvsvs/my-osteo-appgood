"use client"

import { useState } from "react"
import type { Video } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

interface VideoPlayerProps {
  video: Video
  onComplete: () => void
  isCompleted: boolean
}

function extractEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  return null
}

export function VideoPlayer({ video, onComplete, isCompleted }: VideoPlayerProps) {
  const [markedComplete, setMarkedComplete] = useState(isCompleted)
  const embedUrl = extractEmbedUrl(video.url)

  const handleMarkComplete = () => {
    setMarkedComplete(true)
    onComplete()
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="underline">
              Открыть видео в новой вкладке
            </a>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{video.title}</h2>
              {video.description && <p className="text-muted-foreground mt-1">{video.description}</p>}
            </div>
            {markedComplete ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Выполнено</span>
              </div>
            ) : (
              <Button onClick={handleMarkComplete}>Отметить как выполненное</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
