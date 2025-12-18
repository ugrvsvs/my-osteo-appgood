"use client"

import { useData } from "@/lib/data-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, Users, Eye, TrendingUp, Calendar } from "lucide-react"

export default function AnalyticsPage() {
  const { data, isLoading } = useData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  // Статистика
  const totalVideos = data.videos.length
  const totalPatients = data.patients.length
  const activeAssignments = data.assignments.filter((a) => a.isActive).length
  const totalViews = data.videoViews.length
  const completedViews = data.videoViews.filter((v) => v.completed).length

  // Активность по дням (последние 7 дней)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const viewsByDay = last7Days.map((day) => ({
    date: day,
    count: data.videoViews.filter((v) => v.watchedAt.split("T")[0] === day).length,
  }))

  // Топ видео по просмотрам
  const videoViewCounts = data.videos.map((video) => ({
    video,
    views: data.videoViews.filter((v) => v.videoId === video.id).length,
  }))
  const topVideos = videoViewCounts.sort((a, b) => b.views - a.views).slice(0, 5)

  // Активность пациентов
  const patientActivity = data.patients
    .map((patient) => {
      const patientViews = data.videoViews.filter((v) => v.patientId === patient.id)
      const lastView = patientViews.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())[0]
      return {
        patient,
        totalViews: patientViews.length,
        completedViews: patientViews.filter((v) => v.completed).length,
        lastActivity: lastView?.watchedAt,
      }
    })
    .sort((a, b) => b.totalViews - a.totalViews)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    })
  }

  const maxViews = Math.max(...viewsByDay.map((d) => d.count), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Аналитика</h1>
        <p className="text-muted-foreground mt-1">Статистика использования приложения</p>
      </div>

      {/* Основные метрики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Всего видео</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Пациентов</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">{activeAssignments} активных назначений</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Просмотров</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">{completedViews} завершённых</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Выполнение</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews > 0 ? Math.round((completedViews / totalViews) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">видео отмечено выполненными</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Активность за неделю */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Активность за 7 дней
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {viewsByDay.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary rounded-t transition-all"
                    style={{
                      height: `${(day.count / maxViews) * 100}%`,
                      minHeight: day.count > 0 ? "4px" : "0",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{formatDate(day.date)}</span>
                </div>
              ))}
            </div>
            {totalViews === 0 && <p className="text-center text-muted-foreground mt-4">Пока нет данных о просмотрах</p>}
          </CardContent>
        </Card>

        {/* Топ видео */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Популярные видео
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topVideos.length === 0 || topVideos.every((v) => v.views === 0) ? (
              <p className="text-center text-muted-foreground py-8">Пока нет просмотров</p>
            ) : (
              <div className="space-y-3">
                {topVideos
                  .filter((v) => v.views > 0)
                  .map((item, index) => (
                    <div key={item.video.id} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                      <div className="w-12 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={
                            item.video.thumbnailUrl ||
                            `/placeholder.svg?height=32&width=48&query=${item.video.title || "/placeholder.svg"}`
                          }
                          alt={item.video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm truncate flex-1">{item.video.title}</span>
                      <Badge variant="secondary">{item.views}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Активность пациентов */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Активность пациентов
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patientActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Нет пациентов</p>
          ) : (
            <div className="space-y-3">
              {patientActivity.map((item) => (
                <div key={item.patient.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium text-sm">
                      {item.patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.totalViews} просмотров, {item.completedViews} выполнено
                    </p>
                  </div>
                  {item.lastActivity ? (
                    <span className="text-sm text-muted-foreground">{formatDate(item.lastActivity)}</span>
                  ) : (
                    <Badge variant="outline">Нет активности</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
