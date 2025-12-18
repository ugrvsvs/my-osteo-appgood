"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useData } from "@/lib/data-context"
import type { Assignment, Patient, Video, Template } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GripVertical, X, Search } from "lucide-react"

interface AssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: Assignment | null
  patients: Patient[]
  videos: Video[]
  templates: Template[]
}

export function AssignmentDialog({
  open,
  onOpenChange,
  assignment,
  patients,
  videos,
  templates,
}: AssignmentDialogProps) {
  const { addAssignment, updateAssignment, data, getBodyZoneName } = useData()
  const bodyZones = [...data.bodyZones].sort((a, b) => a.order - b.order)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [patientId, setPatientId] = useState("")
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [expiresAt, setExpiresAt] = useState("")
  const [videoSearch, setVideoSearch] = useState("")
  const [selectedZones, setSelectedZones] = useState<string[]>([])

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title)
      setDescription(assignment.description || "")
      setPatientId(assignment.patientId)
      setSelectedVideos(assignment.videoOrder)
      setExpiresAt(assignment.expiresAt ? assignment.expiresAt.split("T")[0] : "")
    } else {
      setTitle("")
      setDescription("")
      setPatientId("")
      setSelectedVideos([])
      setExpiresAt("")
    }
    setVideoSearch("")
    setSelectedZones([])
  }, [assignment, open])

  const toggleVideo = (videoId: string) => {
    if (selectedVideos.includes(videoId)) {
      setSelectedVideos(selectedVideos.filter((id) => id !== videoId))
    } else {
      setSelectedVideos([...selectedVideos, videoId])
    }
  }

  const removeVideo = (videoId: string) => {
    setSelectedVideos(selectedVideos.filter((id) => id !== videoId))
  }

  const moveVideo = (fromIndex: number, toIndex: number) => {
    const newOrder = [...selectedVideos]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)
    setSelectedVideos(newOrder)
  }

  const applyTemplate = (template: Template) => {
    setTitle(template.name)
    setDescription(template.description || "")
    setSelectedVideos(template.videoIds.filter((id) => videos.some((v) => v.id === id)))
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      videoSearch === "" ||
      video.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
      video.description?.toLowerCase().includes(videoSearch.toLowerCase())

    const matchesZones = selectedZones.length === 0 || selectedZones.some((zoneId) => video.bodyZones.includes(zoneId))

    return matchesSearch && matchesZones
  })

  const toggleZone = (zoneId: string) => {
    if (selectedZones.includes(zoneId)) {
      setSelectedZones(selectedZones.filter((z) => z !== zoneId))
    } else {
      setSelectedZones([...selectedZones, zoneId])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !patientId || selectedVideos.length === 0) return

    const assignmentData = {
      title: title.trim(),
      description: description.trim() || undefined,
      patientId,
      videoIds: selectedVideos,
      videoOrder: selectedVideos,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      isActive: true,
    }

    if (assignment) {
      updateAssignment(assignment.id, assignmentData)
    } else {
      addAssignment(assignmentData)
    }

    onOpenChange(false)
  }

  const selectedVideoObjects = selectedVideos
    .map((id) => videos.find((v) => v.id === id))
    .filter((v): v is Video => v !== undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{assignment ? "Редактировать назначение" : "Создать назначение"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Основное</TabsTrigger>
              <TabsTrigger value="videos">Видео ({selectedVideos.length})</TabsTrigger>
              <TabsTrigger value="order">Порядок</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-auto space-y-4 mt-4">
              {templates.length > 0 && !assignment && (
                <div className="space-y-2">
                  <Label>Использовать шаблон</Label>
                  <Select
                    onValueChange={(id) => {
                      const template = templates.find((t) => t.id === id)
                      if (template) applyTemplate(template)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите шаблон..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.videoIds.length} видео)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="patient">Пациент *</Label>
                <Select value={patientId} onValueChange={setPatientId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите пациента..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Название комплекса *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Упражнения для шеи"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание / Инструкции</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Выполнять ежедневно утром..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Срок действия (необязательно)</Label>
                <Input id="expiresAt" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
            </TabsContent>

            <TabsContent value="videos" className="flex-1 overflow-hidden flex flex-col mt-4">
              <div className="space-y-4 mb-4">
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

              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-4">
                  {filteredVideos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedVideos.includes(video.id)}
                        onCheckedChange={() => toggleVideo(video.id)}
                      />
                      <div className="w-20 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={video.thumbnailUrl || `/placeholder.svg?height=48&width=80&query=${video.title}`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{video.title}</p>
                        <div className="flex gap-1 mt-1">
                          {video.bodyZones.slice(0, 2).map((zoneId) => (
                            <Badge key={zoneId} variant="secondary" className="text-xs">
                              {getBodyZoneName(zoneId)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="order" className="flex-1 overflow-hidden flex flex-col mt-4">
              {selectedVideoObjects.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Выберите видео на вкладке "Видео"
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-4">
                    {selectedVideoObjects.map((video, index) => (
                      <div key={video.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === 0}
                            onClick={() => moveVideo(index, index - 1)}
                          >
                            <GripVertical className="h-4 w-4 rotate-90" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === selectedVideoObjects.length - 1}
                            onClick={() => moveVideo(index, index + 1)}
                          >
                            <GripVertical className="h-4 w-4 -rotate-90" />
                          </Button>
                        </div>
                        <span className="w-6 text-center text-sm text-muted-foreground">{index + 1}</span>
                        <div className="w-20 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={video.thumbnailUrl || `/placeholder.svg?height=48&width=80&query=${video.title}`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{video.title}</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeVideo(video.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!title.trim() || !patientId || selectedVideos.length === 0}>
              {assignment ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
