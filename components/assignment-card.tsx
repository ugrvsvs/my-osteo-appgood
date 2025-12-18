"use client"

import type { Assignment, Video } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, VideoIcon, Calendar } from "lucide-react"
import { getThumbnailSrcUrl } from "@/lib/utils"

interface AssignmentCardProps {
  assignment: Assignment
  patientName: string
  videos: Video[]
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}

export function AssignmentCard({
  assignment,
  patientName,
  videos,
  onEdit,
  onDelete,
  onToggleActive,
}: AssignmentCardProps) {
  const isExpired = assignment.expiresAt && new Date(assignment.expiresAt) < new Date()

  return (
    <Card className={!assignment.isActive || isExpired ? "opacity-60" : ""}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{assignment.title}</h3>
            {isExpired && <Badge variant="destructive">Истёк</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{patientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Активно</span>
            <Switch checked={assignment.isActive && !isExpired} onCheckedChange={onToggleActive} disabled={isExpired} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignment.description && <p className="text-sm text-muted-foreground">{assignment.description}</p>}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <VideoIcon className="h-4 w-4" />
            <span>{videos.length} видео</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(assignment.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          {assignment.expiresAt && (
            <span>
              до{" "}
              {new Date(assignment.expiresAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>

        {videos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {videos.slice(0, 4).map((video) => (
              <div key={video.id} className="flex-shrink-0 w-24 h-14 rounded overflow-hidden bg-muted">
                <img
                  src={getThumbnailSrcUrl(video.thumbnailUrl) || `https://img.youtube.com/vi/${extractYoutubeId(video.url) || "placeholder"}/default.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {videos.length > 4 && (
              <div className="flex-shrink-0 w-24 h-14 rounded bg-muted flex items-center justify-center">
                <span className="text-sm text-muted-foreground">+{videos.length - 4}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}
