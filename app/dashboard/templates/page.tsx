"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { TemplateCard } from "@/components/template-card"
import { TemplateDialog } from "@/components/template-dialog"
import type { Template } from "@/lib/types"

export default function TemplatesPage() {
  const { data, isLoading, deleteTemplate } = useData()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  const filteredTemplates = data.templates.filter((template) => {
    return (
      search === "" ||
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
    )
  })

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setDialogOpen(true)
  }

  const handleDelete = (template: Template) => {
    if (confirm(`Удалить шаблон "${template.name}"?`)) {
      deleteTemplate(template.id)
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingTemplate(null)
  }

  const getVideosForTemplate = (template: Template) => {
    return template.videoIds.map((id) => data.videos.find((v) => v.id === id)).filter(Boolean)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Шаблоны</h1>
          <p className="text-muted-foreground mt-1">
            {data.templates.length} шаблонов для быстрого создания назначений
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} disabled={data.videos.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Создать шаблон
        </Button>
      </div>

      {data.videos.length === 0 && (
        <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
          Добавьте видео в библиотеку, чтобы создавать шаблоны
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию или тегам..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {data.templates.length === 0 ? "Нет шаблонов" : "Ничего не найдено"}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {data.templates.length === 0
              ? "Создайте первый шаблон для типовых комплексов упражнений."
              : "Попробуйте изменить параметры поиска."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              videos={getVideosForTemplate(template)}
              onEdit={() => handleEdit(template)}
              onDelete={() => handleDelete(template)}
            />
          ))}
        </div>
      )}

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        template={editingTemplate}
        videos={data.videos}
      />
    </div>
  )
}
