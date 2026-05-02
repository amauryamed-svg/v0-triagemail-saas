"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onComplete: (audioBlob: Blob) => void
  duration?: number
}

export function VoiceRecorder({ onComplete, duration = 15 }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [countdown, setCountdown] = useState(duration)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [waveformValues, setWaveformValues] = useState<number[]>(Array(20).fill(0.2))
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  const updateWaveform = useCallback(() => {
    if (!analyzerRef.current) return
    
    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
    analyzerRef.current.getByteFrequencyData(dataArray)
    
    const newValues = []
    const step = Math.floor(dataArray.length / 20)
    for (let i = 0; i < 20; i++) {
      const value = dataArray[i * step] / 255
      newValues.push(Math.max(0.15, value))
    }
    setWaveformValues(newValues)
    
    if (isRecording) {
      animationRef.current = requestAnimationFrame(updateWaveform)
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyzer = audioContext.createAnalyser()
      analyzer.fftSize = 256
      source.connect(analyzer)
      analyzerRef.current = analyzer
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setCountdown(duration)
      
      intervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      animationRef.current = requestAnimationFrame(updateWaveform)
    } catch {
      console.error("No pudimos acceder al micrófono")
    }
  }

  const stopRecording = () => {
    cleanup()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    setWaveformValues(Array(20).fill(0.2))
  }

  const retry = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setCountdown(duration)
    setWaveformValues(Array(20).fill(0.2))
  }

  const confirmRecording = () => {
    if (audioBlob) {
      onComplete(audioBlob)
    }
  }

  useEffect(() => {
    return cleanup
  }, [cleanup])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Recording Button */}
      <div className="relative">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 0.3 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-urgent"
            />
          )}
        </AnimatePresence>
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!!audioBlob}
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center transition-all",
            "active:scale-[0.98]",
            isRecording 
              ? "bg-urgent text-white" 
              : audioBlob
                ? "bg-surface border border-white/[0.06] text-muted-foreground cursor-not-allowed"
                : "bg-brand text-white hover:bg-brand/90"
          )}
        >
          {isRecording ? (
            <Square className="w-8 h-8" fill="currentColor" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      {/* Countdown */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-light text-foreground tabular-nums"
        >
          {countdown}
        </motion.div>
      )}

      {/* Waveform Visualization */}
      <div className="flex items-center justify-center gap-1 h-16 w-full max-w-xs">
        {waveformValues.map((value, i) => (
          <motion.div
            key={i}
            animate={{ scaleY: value }}
            transition={{ duration: 0.1 }}
            className={cn(
              "w-1.5 rounded-full",
              isRecording ? "bg-brand" : "bg-white/10"
            )}
            style={{ 
              height: 48,
              transformOrigin: "center"
            }}
          />
        ))}
      </div>

      {/* Audio Player & Actions */}
      <AnimatePresence>
        {audioUrl && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <audio src={audioUrl} controls className="w-full max-w-xs" />
            
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={retry}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4" />
                Reintentar
              </Button>
              <Button
                onClick={confirmRecording}
                className="gap-2 bg-brand hover:bg-brand/90 text-white"
              >
                <Check className="w-4 h-4" />
                Usar esta voz
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
