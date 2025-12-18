"use client"

import { useState } from "react"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { PatientCard } from "@/components/patient-card"
import { PatientDialog } from "@/components/patient-dialog"
import type { Patient } from "@/lib/types"

export default function PatientsPage() {
  const { data, isLoading, deletePatient } = useData()
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  const filteredPatients = data.patients.filter((patient) => {
    const matchesSearch =
      search === "" ||
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.email?.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone?.includes(search)

    return matchesSearch
  })

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setDialogOpen(true)
  }

  const handleDelete = (patient: Patient) => {
    if (confirm(`Удалить пациента "${patient.name}"? Все назначения этого пациента также будут удалены.`)) {
      deletePatient(patient.id)
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingPatient(null)
  }

  // Получаем количество активных назначений для каждого пациента
  const getActiveAssignmentsCount = (patientId: string) => {
    return data.assignments.filter((a) => a.patientId === patientId && a.isActive).length
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Пациенты</h1>
          <p className="text-muted-foreground mt-1">{data.patients.length} пациентов в базе</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить пациента
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени, email или телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {data.patients.length === 0 ? "Нет пациентов" : "Ничего не найдено"}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {data.patients.length === 0
              ? "Добавьте первого пациента, нажав кнопку выше."
              : "Попробуйте изменить параметры поиска."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              activeAssignments={getActiveAssignmentsCount(patient.id)}
              onEdit={() => handleEdit(patient)}
              onDelete={() => handleDelete(patient)}
            />
          ))}
        </div>
      )}

      <PatientDialog open={dialogOpen} onOpenChange={handleDialogClose} patient={editingPatient} />
    </div>
  )
}
