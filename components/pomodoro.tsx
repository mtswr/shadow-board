"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type PomodoroStatus = "idle" | "running" | "paused" | "break"

interface PomodoroProps {
  questId: string
  onComplete?: () => void
  className?: string
}

const WORK_MINUTES = 25
const BREAK_MINUTES = 5
const WORK_TIME = WORK_MINUTES * 60
const BREAK_TIME = BREAK_MINUTES * 60

export function Pomodoro({ questId, onComplete, className }: PomodoroProps) {
  const [status, setStatus] = useState<PomodoroStatus>("idle")
  const [timeLeft, setTimeLeft] = useState(WORK_TIME)
  const [isMuted, setIsMuted] = useState(false)
  const [totalTimeSpent, setTotalTimeSpent] = useState(0)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const loadTimerState = () => {
      try {
        if (typeof window !== "undefined") {
          const savedState = localStorage.getItem(`pomodoro-${questId}`)
          if (savedState) {
            const { totalTime, sessions, muted } = JSON.parse(savedState)
            setTotalTimeSpent(totalTime || 0)
            setSessionsCompleted(sessions || 0)
            setIsMuted(muted || false)
          }
        }
      } catch (error) {
        console.error("Error loading timer state:", error)
      }
    }

    loadTimerState()
  }, [questId])

  useEffect(() => {
    const saveTimerState = () => {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `pomodoro-${questId}`,
            JSON.stringify({
              totalTime: totalTimeSpent,
              sessions: sessionsCompleted,
              muted: isMuted,
              lastSession: Date.now(),
            }),
          )
        }
      } catch (error) {
        console.error("Error saving timer state:", error)
      }
    }

    saveTimerState()
  }, [questId, totalTimeSpent, sessionsCompleted, isMuted])

  useEffect(() => {
    if (status === "running") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!)

            if (!isMuted && audioRef.current) {
              audioRef.current.play().catch((err) => console.error("Error playing audio:", err))
            }

            if (status === "running") {
              setSessionsCompleted((prev) => prev + 1)
              setTotalTimeSpent((prev) => prev + WORK_TIME)
              setTimeLeft(BREAK_TIME)
              setStatus("break")
              if (onComplete) onComplete()
              return 0
            } else {
              setTimeLeft(WORK_TIME)
              setStatus("idle")
              return WORK_TIME
            }
          }

          if (status === "running") {
            setTotalTimeSpent((prev) => prev + 1)
          }

          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [status, isMuted, onComplete])

  const startTimer = () => {
    setStatus("running")
  }

  const pauseTimer = () => {
    setStatus("paused")
  }

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setStatus("idle")
    setTimeLeft(WORK_TIME)
  }

  const resumeTimer = () => {
    setStatus("running")
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const calculateProgress = () => {
    const totalTime = status === "break" ? BREAK_TIME : WORK_TIME
    return 100 - (timeLeft / totalTime) * 100
  }

  const formatTotalTime = () => {
    const hours = Math.floor(totalTimeSpent / 3600)
    const minutes = Math.floor((totalTimeSpent % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className={cn("space-y-2", className)}>
      <audio ref={audioRef} src="/notification.mp3" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              status === "running"
                ? "bg-green-500 animate-pulse"
                : status === "break"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-slate-500",
            )}
          />
          <span className="text-xs font-medium">
            {status === "running" ? "Focus" : status === "break" ? "Break" : status === "paused" ? "Paused" : "Ready"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400">{sessionsCompleted} sessions</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-400">{formatTotalTime()}</span>
        </div>
      </div>

      <div className="relative pt-1">
        <Progress
          value={calculateProgress()}
          className={cn(
            "h-1.5",
            status === "break" ? "[&>div]:bg-blue-500" : "[&>div]:bg-green-500"
          )}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-mono font-medium">{formatTime(timeLeft)}</span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-200"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-200"
            onClick={resetTimer}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          {status === "idle" || status === "paused" ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 bg-slate-800 hover:bg-slate-700 border-slate-700"
              onClick={status === "paused" ? resumeTimer : startTimer}
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              {status === "paused" ? "Resume" : "Start"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 bg-slate-800 hover:bg-slate-700 border-slate-700"
              onClick={pauseTimer}
            >
              <Pause className="h-3.5 w-3.5 mr-1" />
              Pause
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
