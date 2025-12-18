"use client"

import { useData } from "@/lib/data-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface VideoFiltersProps {
  allTags: string[]
  selectedZones: string[]
  selectedTags: string[]
  onZonesChange: (zones: string[]) => void
  onTagsChange: (tags: string[]) => void
}

export function VideoFilters({ allTags, selectedZones, selectedTags, onZonesChange, onTagsChange }: VideoFiltersProps) {
  const { data } = useData()
  const bodyZones = [...data.bodyZones].sort((a, b) => a.order - b.order)

  const toggleZone = (zoneId: string) => {
    if (selectedZones.includes(zoneId)) {
      onZonesChange(selectedZones.filter((z) => z !== zoneId))
    } else {
      onZonesChange([...selectedZones, zoneId])
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const clearAll = () => {
    onZonesChange([])
    onTagsChange([])
  }

  const hasFilters = selectedZones.length > 0 || selectedTags.length > 0

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Зоны тела</span>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs">
              <X className="h-3 w-3 mr-1" />
              Сбросить
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {bodyZones.map((zone) => (
            <Badge
              key={zone.id}
              variant={selectedZones.includes(zone.id) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleZone(zone.id)}
            >
              {zone.name}
            </Badge>
          ))}
        </div>
      </div>

      {allTags.length > 0 && (
        <div>
          <span className="text-sm font-medium mb-2 block">Теги</span>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
