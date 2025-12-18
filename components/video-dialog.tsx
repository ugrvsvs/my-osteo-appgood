"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useData } from "@/lib/data-context"
import type { Video } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Upload, ImageIcon } from "lucide-react"

interface VideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  video: Video | null
  allTags: string[]
}

export function VideoDialog({ open, onOpenChange, video, allTags }: VideoDialogProps) {
  const { addVideo, updateVideo, data } = useData()
  const bodyZones = [...data.bodyZones].sort((a, b) => a.order - b.order)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [description, setDescription] = useState("")
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (video) {
      setTitle(video.title)
      setUrl(video.url)
      setThumbnailUrl(video.thumbnailUrl || "")
      setDescription(video.description || "")
      setSelectedZones(video.bodyZones)
      setTags(video.tags)
    } else {
      setTitle("")
      setUrl("")
      setThumbnailUrl("")
      setDescription("")
      setSelectedZones([])
      setTags([])
    }
  }, [video, open])

  const toggleZone = (zoneId: string) => {
    if (selectedZones.includes(zoneId)) {
      setSelectedZones(selectedZones.filter((z) => z !== zoneId))
    } else {
      setSelectedZones([...selectedZones, zoneId])
    }
  }

  const addTag = () => {
    const tag = newTag.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверяем размер (макс 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Файл слишком большой. Максимум 2MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setThumbnailUrl(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !url.trim()) return

    const videoData = {
      title: title.trim(),
      url: url.trim(),
      thumbnailUrl: thumbnailUrl || undefined,
      description: description.trim() || undefined,
      bodyZones: selectedZones,
      tags,
    }

    if (video) {
      updateVideo(video.id, videoData)
    } else {
      addVideo(videoData)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{video ? "Редактировать видео" : "Добавить видео"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Растяжка шеи"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Ссылка на видео *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://любой-видео-хостинг.com/video/123"
              required
            />
            <p className="text-xs text-muted-foreground">Любая ссылка на видео</p>
          </div>

          <div className="space-y-2">
            <Label>Превью картинка</Label>
            <div className="flex gap-4 items-start">
              {thumbnailUrl ? (
                <div className="relative w-40 h-24 rounded-md overflow-hidden border bg-muted">
                  <img src={thumbnailUrl || `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/placeholder.svg`} alt="Превью" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => setThumbnailUrl("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-40 h-24 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Загрузить картинку
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground">JPG, PNG до 2MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание упражнения и рекомендации..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Зоны тела</Label>
            <div className="flex flex-wrap gap-2">
              {bodyZones.map((zone) => (
                <Badge
                  key={zone.id}
                  variant={selectedZones.includes(zone.id) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleZone(zone.id)}
                >
                  {zone.name}
                </Badge>
              ))}
            </div>
            {bodyZones.length === 0 && (
              <p className="text-sm text-muted-foreground">Нет доступных зон тела. Добавьте их в настройках.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Теги</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Новый тег..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                Добавить
              </Button>
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs text-muted-foreground mr-1">Существующие:</span>
                {allTags
                  .filter((t) => !tags.includes(t))
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer text-xs"
                      onClick={() => setTags([...tags, tag])}
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">{video ? "Сохранить" : "Добавить"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
