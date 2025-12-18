"use client"

import type { Patient } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, Link2, Mail, Phone, ClipboardList } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface PatientCardProps {
  patient: Patient
  activeAssignments: number
  onEdit: () => void
  onDelete: () => void
}

export function PatientCard({ patient, activeAssignments, onEdit, onDelete }: PatientCardProps) {
  const { toast } = useToast()
  const [copying, setCopying] = useState(false)

  const patientLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${patient.accessToken}`
      : `/share/${patient.accessToken}`

  const copyLink = async () => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(patientLink)
      toast({
        title: "Ссылка скопирована",
        description: "Персональная ссылка пациента скопирована в буфер обмена",
      })
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
        variant: "destructive",
      })
    }
    setCopying(false)
  }

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">{initials}</span>
          </div>
          <div>
            <h3 className="font-semibold">{patient.name}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(patient.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {patient.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}
          {patient.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{patient.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            {activeAssignments > 0 ? (
              <Badge variant="secondary">{activeAssignments} активных назначений</Badge>
            ) : (
              <span className="text-muted-foreground">Нет активных назначений</span>
            )}
          </div>
        </div>

        {patient.notes && <p className="text-sm text-muted-foreground line-clamp-2">{patient.notes}</p>}

        <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={copyLink} disabled={copying}>
          <Link2 className="h-4 w-4 mr-2" />
          {copying ? "Копирование..." : "Скопировать ссылку"}
        </Button>
      </CardContent>
    </Card>
  )
}
