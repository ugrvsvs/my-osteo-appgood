"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getData, recordVideoView } from "@/lib/storage"
import { patientsApi, assignmentsApi, videosApi } from "@/lib/api"
import type { Patient, Assignment, Video, VideoView as VideoViewType } from "@/lib/types"
import { getThumbnailSrcUrl } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, CheckCircle2, Clock, ArrowLeft } from "lucide-react"
import { VideoPlayer } from "@/components/video-player"

/**
 * PUBLIC PATIENT PORTAL
 * Страница доступна по ссылке: /share/[token]
 * Безопасный и надежный для деплоя с basePath
 */
export default function PublicPatientPortalPage() {
  const params = useParams()
  const token = params?.token as string | undefined

  const [patient, setPatient] = useState<Patient | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [views, setViews] = useState<VideoViewType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null)

  // Инициализация данных
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        if (!token) {
          setError("Ошибка: токен доступа не найден в URL")
          setLoading(false)
          return
        }

        // Сначала пытаемся получить пациента с backend по токену
        let foundPatient: Patient | null = null
        try {
          foundPatient = await patientsApi.getByToken(token)
        } catch (err) {
          console.log("Backend patient not found, checking local storage...")
        }

        // Если не найдено в backend, ищем в локальном хранилище
        if (!foundPatient) {
          const data = getData()
          foundPatient = data.patients.find((p) => p.accessToken === token) || null
        }

        if (!foundPatient) {
          setError("Ссылка не найдена или истекла. Свяжитесь с врачом.")
          setLoading(false)
          return
        }

        // Загружаем все данные с сервера
        let allVideos: Video[] = []
        let patientAssignments: Assignment[] = []
        
        try {
          // Получаем видео с сервера
          allVideos = await videosApi.getAll()
        } catch (err) {
          console.log("Failed to load videos from API, using local storage")
          const data = getData()
          allVideos = data.videos
        }

        try {
          // Получаем назначения пациента с сервера
          const allAssignments = await assignmentsApi.getByPatientId(foundPatient.id)
          // Фильтруем активные и не истекшие назначения
          patientAssignments = allAssignments.filter((a) => {
            if (!a.isActive) return false
            if (a.expiresAt && new Date(a.expiresAt) < new Date()) return false
            return true
          })
        } catch (err) {
          console.log("Failed to load assignments from API, using local storage")
          const data = getData()
          patientAssignments = data.assignments.filter((a) => {
            if (a.patientId !== foundPatient.id) return false
            if (!a.isActive) return false
            if (a.expiresAt && new Date(a.expiresAt) < new Date()) return false
            return true
          })
        }

        setPatient(foundPatient)
        setAssignments(patientAssignments)
        setVideos(allVideos)
        setLoading(false)
      } catch (err) {
        console.error("Ошибка загрузки данных:", err)
        setError("Ошибка при загрузке. Попробуйте позже.")
        setLoading(false)
      }
    }

    loadPatientData()
  }, [token])

  // Вспомогательные функции
  const getVideoById = (id: string): Video | undefined => videos.find((v) => v.id === id)

  const isVideoWatched = (assignmentId: string, videoId: string): boolean => {
    return views.some((v) => v.assignmentId === assignmentId && v.videoId === videoId && v.completed)
  }

  const getAssignmentProgress = (assignment: Assignment) => {
    const watchedCount = assignment.videoOrder.filter((videoId) => isVideoWatched(assignment.id, videoId)).length
    return {
      watched: watchedCount,
      total: assignment.videoOrder.length,
      percentage: assignment.videoOrder.length > 0 ? Math.round((watchedCount / assignment.videoOrder.length) * 100) : 0,
    }
  }

  const handleVideoComplete = (assignment: Assignment, video: Video) => {
    if (!patient) return

    try {
      const newView = recordVideoView({
        patientId: patient.id,
        assignmentId: assignment.id,
        videoId: video.id,
        watchedAt: new Date().toISOString(),
        completed: true,
      })
      setViews([...views, newView])
      setPlayingVideo(null)
    } catch (err) {
      console.error("Ошибка при записи просмотра видео:", err)
    }
  }

  // СОСТОЯНИЕ: Загрузка
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  // СОСТОЯНИЕ: Ошибка или пациент не найден
  if (error || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="rounded-full bg-destructive/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <span className="text-destructive text-2xl">!</span>
            </div>
            <h1 className="text-xl font-semibold mb-2">Ошибка</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-xs text-muted-foreground">
              Если это ошибка, свяжитесь с вашим лечащим врачом и попросите новую ссылку.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // СОСТОЯНИЕ: Просмотр видео
  if (playingVideo && selectedAssignment) {
    const watched = isVideoWatched(selectedAssignment.id, playingVideo.id)
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => setPlayingVideo(null)} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к списку
            </Button>
            <h1 className="text-xl font-semibold">{playingVideo.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{playingVideo.description}</p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-4">
          <VideoPlayer
            video={playingVideo}
            onComplete={() => handleVideoComplete(selectedAssignment, playingVideo)}
            isCompleted={watched}
          />
          {watched && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-700">Видео отмечено как просмотренное</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // СОСТОЯНИЕ: Просмотр одного назначения
  if (selectedAssignment) {
    const progress = getAssignmentProgress(selectedAssignment)

    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedAssignment(null)} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Все комплексы
            </Button>
            <h1 className="text-xl font-semibold">{selectedAssignment.title}</h1>
            {selectedAssignment.description && (
              <p className="text-muted-foreground mt-1">{selectedAssignment.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress.percentage}%` }} />
              </div>
              <span className="text-sm text-muted-foreground">
                {progress.watched}/{progress.total}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-3">
          {selectedAssignment.videoOrder.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">В этом назначении нет видео</p>
              </CardContent>
            </Card>
          ) : (
            selectedAssignment.videoOrder.map((videoId, index) => {
              const video = getVideoById(videoId)
              if (!video) return null

              const watched = isVideoWatched(selectedAssignment.id, videoId)

              return (
                <Card
                  key={videoId}
                  className={`cursor-pointer transition-all hover:border-primary hover:shadow-sm ${watched ? "bg-primary/5" : ""}`}
                  onClick={() => setPlayingVideo(video)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={getThumbnailSrcUrl(video.thumbnailUrl)}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                        {watched ? (
                          <CheckCircle2 className="h-8 w-8 text-green-500" />
                        ) : (
                          <Play className="h-8 w-8 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground flex-shrink-0">{index + 1}.</span>
                        <h3 className="font-medium truncate">{video.title}</h3>
                      </div>
                      {video.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                      )}
                    </div>
                    {watched && (
                      <Badge variant="secondary" className="flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Просмотрено
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // СОСТОЯНИЕ: Список всех назначений (главная страница портала)
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Ваши упражнения</h1>
          <p className="text-muted-foreground mt-1">
            {patient.name}, здесь находятся назначенные вам комплексы упражнений
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Нет активных назначений</h3>
              <p className="text-muted-foreground">Ваш врач пока не назначил вам упражнения</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => {
            const progress = getAssignmentProgress(assignment)

            return (
              <Card
                key={assignment.id}
                className="cursor-pointer transition-all hover:border-primary hover:shadow-sm"
                onClick={() => setSelectedAssignment(assignment)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                      )}
                    </div>
                    {progress.percentage === 100 && <Badge className="bg-green-500 flex-shrink-0">Выполнено</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
                            {progress.percentage}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {progress.watched} из {progress.total} видео просмотрено
                        </p>
                      </div>
                    </div>
                    {assignment.expiresAt && (
                      <p className="text-xs text-muted-foreground">
                        📅 Доступно до{" "}
                        {new Date(assignment.expiresAt).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
