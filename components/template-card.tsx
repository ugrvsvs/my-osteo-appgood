"use client"

import type { Template, Video } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, VideoIcon } from "lucide-react"
import { getThumbnailSrcUrl } from "@/lib/utils"

interface TemplateCardProps {
  template: Template
  videos: (Video | undefined)[]
  onEdit: () => void
  onDelete: () => void
}

export function TemplateCard({ template, videos, onEdit, onDelete }: TemplateCardProps) {
  const validVideos = videos.filter((v): v is Video => v !== undefined)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{template.name}</h3>
          {template.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{template.description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <VideoIcon className="h-4 w-4" />
          <span>{validVideos.length} видео</span>
        </div>

        {validVideos.length > 0 && (
          <div className="flex gap-1 overflow-x-auto pb-1">
            {validVideos.slice(0, 4).map((video) => (
              <div key={video.id} className="flex-shrink-0 w-16 h-10 rounded overflow-hidden bg-muted">
                <img
                  src={getThumbnailSrcUrl(video.thumbnailUrl)}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {validVideos.length > 4 && (
              <div className="flex-shrink-0 w-16 h-10 rounded bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{validVideos.length - 4}</span>
              </div>
            )}
          </div>
        )}

        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
