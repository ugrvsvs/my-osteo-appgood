"use client"

import type React from "react"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import type { BodyZone } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Upload, Trash2, AlertTriangle, Plus, Pencil, GripVertical, X, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { data, exportData, importData, refresh, addBodyZone, updateBodyZone, deleteBodyZone } = useData()
  const { toast } = useToast()
  const [importing, setImporting] = useState(false)

  const [newZoneName, setNewZoneName] = useState("")
  const [editingZone, setEditingZone] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const bodyZones = [...data.bodyZones].sort((a, b) => a.order - b.order)

  const handleAddZone = () => {
    const name = newZoneName.trim()
    if (!name) return

    const maxOrder = bodyZones.length > 0 ? Math.max(...bodyZones.map((z) => z.order)) : 0
    addBodyZone({ name, order: maxOrder + 1 })
    setNewZoneName("")
    toast({
      title: "Зона добавлена",
      description: `Зона "${name}" успешно добавлена`,
    })
  }

  const handleUpdateZone = (id: string) => {
    const name = editingName.trim()
    if (!name) return

    updateBodyZone(id, { name })
    setEditingZone(null)
    setEditingName("")
    toast({
      title: "Зона обновлена",
      description: "Название зоны успешно изменено",
    })
  }

  const handleDeleteZone = (zone: BodyZone) => {
    // Проверяем, используется ли зона в видео
    const usedInVideos = data.videos.filter((v) => v.bodyZones.includes(zone.id)).length

    const confirmMessage =
      usedInVideos > 0
        ? `Зона "${zone.name}" используется в ${usedInVideos} видео. При удалении она будет удалена из всех видео. Продолжить?`
        : `Удалить зону "${zone.name}"?`

    if (confirm(confirmMessage)) {
      deleteBodyZone(zone.id)
      toast({
        title: "Зона удалена",
        description: `Зона "${zone.name}" успешно удалена`,
      })
    }
  }

  const startEditing = (zone: BodyZone) => {
    setEditingZone(zone.id)
    setEditingName(zone.name)
  }

  const cancelEditing = () => {
    setEditingZone(null)
    setEditingName("")
  }

  const handleExport = () => {
    const jsonData = exportData()
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `osteo-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Экспорт завершён",
      description: "Данные сохранены в файл",
    })
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const success = importData(content)
        if (success) {
          toast({
            title: "Импорт завершён",
            description: "Данные успешно загружены",
          })
        } else {
          toast({
            title: "Ошибка импорта",
            description: "Неверный формат файла",
            variant: "destructive",
          })
        }
      } catch {
        toast({
          title: "Ошибка импорта",
          description: "Не удалось прочитать файл",
          variant: "destructive",
        })
      }
      setImporting(false)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleClearData = () => {
    if (
      confirm(
        "Вы уверены, что хотите удалить ВСЕ данные? Это действие необратимо. Рекомендуем сначала сделать резервную копию.",
      )
    ) {
      localStorage.removeItem("osteo-app-data")
      refresh()
      toast({
        title: "Данные удалены",
        description: "Все данные приложения были очищены",
      })
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground mt-1">Управление данными приложения</p>
      </div>

      {/* Статистика данных */}
      <Card>
        <CardHeader>
          <CardTitle>Текущие данные</CardTitle>
          <CardDescription>Сводка по хранимым данным</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{data.videos.length}</div>
              <div className="text-sm text-muted-foreground">Видео</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{data.patients.length}</div>
              <div className="text-sm text-muted-foreground">Пациентов</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{data.assignments.length}</div>
              <div className="text-sm text-muted-foreground">Назначений</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{data.templates.length}</div>
              <div className="text-sm text-muted-foreground">Шаблонов</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{data.bodyZones.length}</div>
              <div className="text-sm text-muted-foreground">Зон тела</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Зоны тела</CardTitle>
          <CardDescription>Управление списком зон тела для классификации видео</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Добавление новой зоны */}
          <div className="flex gap-2">
            <Input
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="Название новой зоны..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddZone()
                }
              }}
            />
            <Button onClick={handleAddZone} disabled={!newZoneName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          </div>

          {/* Список зон */}
          <div className="space-y-2">
            {bodyZones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />

                {editingZone === zone.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleUpdateZone(zone.id)
                        } else if (e.key === "Escape") {
                          cancelEditing()
                        }
                      }}
                    />
                    <Button size="sm" variant="ghost" onClick={() => handleUpdateZone(zone.id)}>
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{zone.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {data.videos.filter((v) => v.bodyZones.includes(zone.id)).length} видео
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => startEditing(zone)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteZone(zone)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            ))}

            {bodyZones.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Нет зон тела. Добавьте первую зону выше.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Экспорт */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Экспорт данных
          </CardTitle>
          <CardDescription>Скачайте резервную копию всех данных в формате JSON</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Скачать резервную копию
          </Button>
        </CardContent>
      </Card>

      {/* Импорт */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Импорт данных
          </CardTitle>
          <CardDescription>Загрузите данные из резервной копии. Текущие данные будут заменены.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="import-file" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                  <Upload className="h-4 w-4" />
                  {importing ? "Загрузка..." : "Выбрать файл"}
                </div>
              </Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                disabled={importing}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Поддерживается только формат JSON из экспорта этого приложения
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Очистка */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Опасная зона
          </CardTitle>
          <CardDescription>Эти действия необратимы</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleClearData}>
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить все данные
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
