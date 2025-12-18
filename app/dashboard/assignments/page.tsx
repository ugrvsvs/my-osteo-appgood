"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { AssignmentCard } from "@/components/assignment-card"
import { AssignmentDialog } from "@/components/assignment-dialog"
import type { Assignment } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AssignmentsPage() {
  const { data, isLoading, deleteAssignment, updateAssignment } = useData()
  const [search, setSearch] = useState("")
  const [patientFilter, setPatientFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  const filteredAssignments = data.assignments.filter((assignment) => {
    const patient = data.patients.find((p) => p.id === assignment.patientId)
    const matchesSearch =
      search === "" ||
      assignment.title.toLowerCase().includes(search.toLowerCase()) ||
      patient?.name.toLowerCase().includes(search.toLowerCase())

    const matchesPatient = patientFilter === "all" || assignment.patientId === patientFilter

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && assignment.isActive) ||
      (statusFilter === "inactive" && !assignment.isActive)

    return matchesSearch && matchesPatient && matchesStatus
  })

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setDialogOpen(true)
  }

  const handleDelete = (assignment: Assignment) => {
    if (confirm(`Удалить назначение "${assignment.title}"?`)) {
      deleteAssignment(assignment.id)
    }
  }

  const handleToggleActive = (assignment: Assignment) => {
    updateAssignment(assignment.id, { isActive: !assignment.isActive })
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingAssignment(null)
  }

  const getPatientName = (patientId: string) => {
    return data.patients.find((p) => p.id === patientId)?.name || "Неизвестный"
  }

  const getVideosForAssignment = (assignment: Assignment) => {
    return assignment.videoOrder
      .map((id) => data.videos.find((v) => v.id === id))
      .filter((v): v is NonNullable<typeof v> => v !== undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Назначения</h1>
          <p className="text-muted-foreground mt-1">
            {data.assignments.filter((a) => a.isActive).length} активных из {data.assignments.length}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} disabled={data.patients.length === 0 || data.videos.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Создать назначение
        </Button>
      </div>

      {(data.patients.length === 0 || data.videos.length === 0) && (
        <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
          {data.patients.length === 0 && data.videos.length === 0
            ? "Добавьте пациентов и видео, чтобы создавать назначения"
            : data.patients.length === 0
              ? "Добавьте пациентов, чтобы создавать назначения"
              : "Добавьте видео, чтобы создавать назначения"}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или пациенту..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={patientFilter} onValueChange={setPatientFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Все пациенты" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все пациенты</SelectItem>
            {data.patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="inactive">Неактивные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {data.assignments.length === 0 ? "Нет назначений" : "Ничего не найдено"}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {data.assignments.length === 0
              ? "Создайте первое назначение для пациента."
              : "Попробуйте изменить параметры поиска или фильтрации."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              patientName={getPatientName(assignment.patientId)}
              videos={getVideosForAssignment(assignment)}
              onEdit={() => handleEdit(assignment)}
              onDelete={() => handleDelete(assignment)}
              onToggleActive={() => handleToggleActive(assignment)}
            />
          ))}
        </div>
      )}

      <AssignmentDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        assignment={editingAssignment}
        patients={data.patients}
        videos={data.videos}
        templates={data.templates}
      />
    </div>
  )
}
