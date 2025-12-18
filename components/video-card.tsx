"use client"

import type { Video } from "@/lib/types"
import { useData } from "@/lib/data-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoCardProps {
  video: Video
  viewMode: "grid" | "list"
  onEdit: () => void
  onDelete: () => void
  selectable?: boolean
  selected?: boolean
  onSelect?: () => void
}

function getThumbnailUrl(video: Video): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  if (video.thumbnailUrl) return video.thumbnailUrl
  return `${basePath}/placeholder.svg?height=180&width=320&query=video ${video.title}`
}

export function VideoCard({ video, viewMode, onEdit, onDelete, selectable, selected, onSelect }: VideoCardProps) {
  const { getBodyZoneName } = useData()
  const thumbnail = getThumbnailUrl(video)

  if (viewMode === "list") {
    return (
      <Card
        className={cn(
          "transition-all",
          selectable && "cursor-pointer hover:border-primary",
          selected && "border-primary bg-primary/5",
        )}
        onClick={selectable ? onSelect : undefined}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative h-20 w-36 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            <img src={thumbnail || `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/placeholder.svg`} alt={video.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{video.title}</h3>
            {video.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{video.description}</p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {video.bodyZones.slice(0, 3).map((zoneId) => (
                <Badge key={zoneId} variant="secondary" className="text-xs">
                  {getBodyZoneName(zoneId)}
                </Badge>
              ))}
              {video.bodyZones.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{video.bodyZones.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {!selectable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
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
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        selectable && "cursor-pointer hover:border-primary",
        selected && "border-primary bg-primary/5",
      )}
      onClick={selectable ? onSelect : undefined}
    >
      <div className="relative aspect-video bg-muted">
        <img src={thumbnail || `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/placeholder.svg`} alt={video.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
          <Play className="h-12 w-12 text-white" />
        </div>
        {!selectable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="absolute top-2 right-2 h-8 w-8">
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
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-1">{video.title}</h3>
        {video.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{video.description}</p>}
        <div className="flex flex-wrap gap-1 mt-3">
          {video.bodyZones.slice(0, 2).map((zoneId) => (
            <Badge key={zoneId} variant="secondary" className="text-xs">
              {getBodyZoneName(zoneId)}
            </Badge>
          ))}
          {video.bodyZones.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{video.bodyZones.length - 2}
            </Badge>
          )}
        </div>
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {video.tags.slice(0, 2).map((tag) => (
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
