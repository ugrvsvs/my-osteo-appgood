"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Grid, List } from "lucide-react"
import { VideoCard } from "@/components/video-card"
import { VideoDialog } from "@/components/video-dialog"
import { VideoFilters } from "@/components/video-filters"
import type { Video, BodyZone } from "@/lib/types"

export default function VideosPage() {
  const { data, isLoading, deleteVideo } = useData()
  const [search, setSearch] = useState("")
  const [selectedZones, setSelectedZones] = useState<BodyZone[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  // Собираем все уникальные теги
  const allTags = Array.from(new Set(data.videos.flatMap((v) => v.tags)))

  // Фильтрация видео
  const filteredVideos = data.videos.filter((video) => {
    const matchesSearch =
      search === "" ||
      video.title.toLowerCase().includes(search.toLowerCase()) ||
      video.description?.toLowerCase().includes(search.toLowerCase())

    const matchesZones = selectedZones.length === 0 || selectedZones.some((zone) => video.bodyZones.includes(zone))

    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => video.tags.includes(tag))

    return matchesSearch && matchesZones && matchesTags
  })

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setDialogOpen(true)
  }

  const handleDelete = (video: Video) => {
    if (confirm(`Удалить видео "${video.title}"?`)) {
      deleteVideo(video.id)
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingVideo(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Видео-библиотека</h1>
          <p className="text-muted-foreground mt-1">{data.videos.length} видео в библиотеке</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить видео
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или описанию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <VideoFilters
        allTags={allTags}
        selectedZones={selectedZones}
        selectedTags={selectedTags}
        onZonesChange={setSelectedZones}
        onTagsChange={setSelectedTags}
      />

      {filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {data.videos.length === 0 ? "Библиотека пуста" : "Ничего не найдено"}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {data.videos.length === 0
              ? "Добавьте первое видео-упражнение, нажав кнопку выше."
              : "Попробуйте изменить параметры поиска или фильтрации."}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-3"
          }
        >
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              viewMode={viewMode}
              onEdit={() => handleEdit(video)}
              onDelete={() => handleDelete(video)}
            />
          ))}
        </div>
      )}

      <VideoDialog open={dialogOpen} onOpenChange={handleDialogClose} video={editingVideo} allTags={allTags} />
    </div>
  )
}
