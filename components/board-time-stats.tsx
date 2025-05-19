"use client"

import { useState, useEffect } from "react"
import { Clock, Calendar } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { BoardData } from "./kanban-board"

interface BoardTimeStatsProps {
  boardId: string
  boardData: BoardData
}

interface TimeStats {
  totalTimeSpent: number
  estimatedCompletion: Date | null
}

const STORAGE_KEYS = {
  POMODORO: (questId: string) => `pomodoro-${questId}`,
}

const DEFAULT_AVERAGE_TIME = 25 * 60

export function BoardTimeStats({ boardId, boardData }: BoardTimeStatsProps) {
  const [timeStats, setTimeStats] = useState<TimeStats>({
    totalTimeSpent: 0,
    estimatedCompletion: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculateTimeStats = () => {
      if (typeof window === "undefined" || !boardData) {
        setLoading(false)
        return
      }

      try {
        const allQuests = Object.keys(boardData.quests || {})
        const completedQuestIds = boardData.columns["column-4"]?.questIds || []
        const incompleteQuestIds = allQuests.filter((id) => !completedQuestIds.includes(id))

        let totalTime = 0
        let completedQuestsWithTime = 0
        let averageTimePerQuest = 0

        allQuests.forEach((questId) => {
          try {
            const pomodoroData = localStorage.getItem(STORAGE_KEYS.POMODORO(questId))
            if (pomodoroData) {
              const { totalTime: questTime } = JSON.parse(pomodoroData)
              totalTime += questTime || 0

              if (completedQuestIds.includes(questId) && questTime > 0) {
                completedQuestsWithTime++
              }
            }
          } catch (e) {
            console.error("Error processing quest time data:", e)
          }
        })

        if (completedQuestsWithTime > 0) {
          const completedTime = completedQuestIds.reduce((total, questId) => {
            try {
              const pomodoroData = localStorage.getItem(STORAGE_KEYS.POMODORO(questId))
              if (pomodoroData) {
                const { totalTime: questTime } = JSON.parse(pomodoroData)
                return total + (questTime || 0)
              }
            } catch (e) {
              console.error("Error calculating completed quest time:", e)
            }
            return total
          }, 0)

          averageTimePerQuest = completedTime / completedQuestsWithTime
        } else {
          averageTimePerQuest = DEFAULT_AVERAGE_TIME
        }

        const remainingTime = incompleteQuestIds.length * averageTimePerQuest
        const estimatedCompletion = remainingTime > 0 ? new Date(Date.now() + remainingTime * 1000) : null

        setTimeStats({
          totalTimeSpent: totalTime,
          estimatedCompletion,
        })
        setLoading(false)
      } catch (error) {
        console.error("Error calculating board time stats:", error)
        setLoading(false)
      }
    }

    calculateTimeStats()
    const interval = setInterval(calculateTimeStats, 60000)
    return () => clearInterval(interval)
  }, [boardId, boardData])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const formatCompletionTime = (date: Date): string => {
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  if (loading) {
    return <div className="flex items-center text-slate-400 text-sm animate-pulse">Calculating...</div>
  }

  return (
    <div className="flex items-center gap-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-sm text-slate-300">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>{formatTime(timeStats.totalTimeSpent)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Total time spent on this board</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {timeStats.estimatedCompletion && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-sm text-slate-300">
                <Calendar className="h-4 w-4 text-green-400" />
                <span>Est. completion: {formatCompletionTime(timeStats.estimatedCompletion)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Estimated completion time based on your progress</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
