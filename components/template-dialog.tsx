"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useData } from "@/lib/data-context"
import type { Template, Video } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Search } from "lucide-react"

interface TemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: Template | null
  videos: Video[]
}

export function TemplateDialog({ open, onOpenChange, template, videos }: TemplateDialogProps) {
  const { addTemplate, updateTemplate, data } = useData()
  const bodyZones = [...data.bodyZones].sort((a, b) => a.order - b.order)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [videoSearch, setVideoSearch] = useState("")
  const [selectedZones, setSelectedZones] = useState<string[]>([])

  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description || "")
      setSelectedVideos(template.videoIds)
      setTags(template.tags || [])
    } else {
      setName("")
      setDescription("")
      setSelectedVideos([])
      setTags([])
    }
    setVideoSearch("")
    setSelectedZones([])
    setNewTag("")
  }, [template, open])

  const toggleVideo = (videoId: string) => {
    if (selectedVideos.includes(videoId)) {
      setSelectedVideos(selectedVideos.filter((id) => id !== videoId))
    } else {
      setSelectedVideos([...selectedVideos, videoId])
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

  const toggleZone = (zoneId: string) => {
    if (selectedZones.includes(zoneId)) {
      setSelectedZones(selectedZones.filter((z) => z !== zoneId))
    } else {
      setSelectedZones([...selectedZones, zoneId])
    }
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      videoSearch === "" ||
      video.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
      video.description?.toLowerCase().includes(videoSearch.toLowerCase())

    const matchesZones = selectedZones.length === 0 || selectedZones.some((zoneId) => video.bodyZones.includes(zoneId))

    return matchesSearch && matchesZones
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || selectedVideos.length === 0) return

    const templateData = {
      name: name.trim(),
      description: description.trim() || undefined,
      videoIds: selectedVideos,
      tags,
    }

    if (template) {
      updateTemplate(template.id, templateData)
    } else {
      addTemplate(templateData)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{template ? "Редактировать шаблон" : "Создать шаблон"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col gap-4 px-6" id="template-form">
          <div className="space-y-2">
            <Label htmlFor="name">Название шаблона *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Комплекс для шейного отдела"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание шаблона..."
              rows={2}
            />
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

          <div className="space-y-2">
            <Label>Видео ({selectedVideos.length} выбрано)</Label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск видео..."
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {bodyZones.slice(0, 6).map((zone) => (
                  <Badge
                    key={zone.id}
                    variant={selectedZones.includes(zone.id) ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleZone(zone.id)}
                  >
                    {zone.name}
                  </Badge>
                ))}
              </div>
            </div>

            <ScrollArea className="h-48 border rounded-lg">
              <div className="space-y-1 p-2">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedVideos.includes(video.id)}
                      onCheckedChange={() => toggleVideo(video.id)}
                    />
                    <div className="w-16 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={video.thumbnailUrl || `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/placeholder.svg?height=40&width=64&query=${video.title}`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm truncate">{video.title}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </form>

        <div className="flex justify-end gap-2 pt-2 px-6 pb-6 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button type="submit" form="template-form" disabled={!name.trim() || selectedVideos.length === 0}>
            {template ? "Сохранить" : "Создать"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
