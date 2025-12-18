"use client"

import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Users, ClipboardList, Eye } from "lucide-react"

export default function DashboardPage() {
  const { data, isLoading } = useData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  const stats = [
    {
      title: "Видео",
      value: data.videos.length,
      icon: Video,
      description: "в библиотеке",
    },
    {
      title: "Пациенты",
      value: data.patients.length,
      icon: Users,
      description: "зарегистрировано",
    },
    {
      title: "Назначения",
      value: data.assignments.filter((a) => a.isActive).length,
      icon: ClipboardList,
      description: "активных",
    },
    {
      title: "Просмотры",
      value: data.videoViews.length,
      icon: Eye,
      description: "всего",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
        <p className="text-muted-foreground mt-1">Добро пожаловать в приложение "Мой Остео"</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.videos.length === 0 && data.patients.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Начните работу</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Добавьте видео-упражнения в библиотеку и создайте карточки пациентов, чтобы начать назначать
              персонализированные комплексы.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
