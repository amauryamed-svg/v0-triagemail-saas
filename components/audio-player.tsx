"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  src: string
  className?: string
}

export function AudioPlayer({ src, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [waveformValues] = useState<number[]>(
    Array(30).fill(0).map(() => 0.2 + Math.random() * 0.8)
  )
  
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progress = duration > 0 ? currentTime / duration : 0

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          "bg-brand text-white hover:bg-brand/90 transition-colors",
          "active:scale-[0.98]"
        )}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" fill="currentColor" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
        )}
      </button>

      {/* Waveform */}
      <div className="flex-1 flex items-center gap-0.5 h-8">
        {waveformValues.map((value, i) => {
          const isActive = i / waveformValues.length <= progress
          return (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-colors",
                isActive ? "bg-brand" : "bg-white/20"
              )}
              style={{ height: `${value * 100}%` }}
            />
          )
        })}
      </div>

      {/* Time */}
      <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">
        {formatTime(currentTime)} / {formatTime(duration || 0)}
      </span>
    </div>
  )
}
