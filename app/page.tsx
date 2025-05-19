"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { KanbanBoard } from "@/components/kanban-board"
import { BoardTimeStats } from "@/components/board-time-stats"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { LoadingAnimation } from "@/components/loading-animation"

interface BoardData {
  quests: Record<string, any>
  columns: Record<string, any>
  columnOrder: string[]
}

const STORAGE_KEYS = {
  BOARD_TITLE: (boardId: string) => `shadow-board-title-${boardId}`,
  BOARD_DATA: (boardId: string) => `shadow-board-${boardId}`,
  BOARD_UPDATED: (boardId: string) => `shadow-board-updated-${boardId}`,
}

const loadBoardTitle = (boardId: string): string => {
  try {
    if (typeof window !== "undefined") {
      const savedTitle = localStorage.getItem(STORAGE_KEYS.BOARD_TITLE(boardId))
      return savedTitle || "New Gate"
    }
    return "New Gate"
  } catch (error) {
    console.error("Error loading board title:", error)
    return "New Gate"
  }
}

const saveBoardTitle = (boardId: string, title: string): void => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.BOARD_TITLE(boardId), title)
    }
  } catch (error) {
    console.error("Error saving board title:", error)
  }
}

const createNewBoard = (): string => {
  const newBoardId = `board-${Date.now()}`

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.BOARD_TITLE(newBoardId), "New Gate")
    localStorage.setItem(STORAGE_KEYS.BOARD_UPDATED(newBoardId), Date.now().toString())
  }

  return newBoardId
}

export default function BoardPage() {
  const searchParams = useSearchParams()
  const boardIdParam = searchParams.get("board")
  const kanbanRef = useRef<any>(null)

  const [currentBoardId, setCurrentBoardId] = useState<string>("")
  const [boardTitle, setBoardTitle] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [boardData, setBoardData] = useState<BoardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (boardIdParam) {
      setCurrentBoardId(boardIdParam)
    } else {
      const newId = createNewBoard()
      setCurrentBoardId(newId)
      window.history.replaceState(null, "", `/?board=${newId}`)
    }
  }, [boardIdParam])

  useEffect(() => {
    if (currentBoardId) {
      const title = loadBoardTitle(currentBoardId)
      setBoardTitle(title)
      setNewTitle(title)

      try {
        if (typeof window !== "undefined") {
          const savedData = localStorage.getItem(STORAGE_KEYS.BOARD_DATA(currentBoardId))
          if (savedData) {
            setBoardData(JSON.parse(savedData))
          }
        }
      } catch (error) {
        console.error("Error loading board data:", error)
      }
    }
  }, [currentBoardId])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleTitleEdit = () => setIsEditingTitle(true)

  const handleTitleSave = () => {
    if (newTitle.trim()) {
      setBoardTitle(newTitle)
      saveBoardTitle(currentBoardId, newTitle)
    } else {
      setNewTitle(boardTitle)
    }
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave()
    } else if (e.key === "Escape") {
      setNewTitle(boardTitle)
      setIsEditingTitle(false)
    }
  }

  const handleAddNewQuest = () => {
    if (kanbanRef.current?.handleAddQuest) {
      kanbanRef.current.handleAddQuest("column-1")
    }
  }

  if (isLoading) {
    return <LoadingAnimation />
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a] text-slate-200">
      <DashboardHeader />
      <main className="flex-1 p-6 container mx-auto">
        <div className="sl-panel mb-6 p-4">
          <div className="sl-corner-decoration-tl"></div>
          <div className="sl-corner-decoration-tr"></div>
          <div className="sl-corner-decoration-bl"></div>
          <div className="sl-corner-decoration-br"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    className="text-xl font-bold bg-slate-800 border-blue-500 focus-visible:ring-blue-500 font-rajdhani"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleTitleSave} className="bg-blue-600 hover:bg-blue-700 font-rajdhani">
                    Save
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-blue-400 font-orbitron sl-glow-text tracking-wider">
                    {boardTitle}
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleTitleEdit}
                    className="text-slate-400 hover:text-blue-400"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
              {boardData && <BoardTimeStats boardId={currentBoardId} boardData={boardData} />}
              <Button className="bg-blue-600 hover:bg-blue-700 font-rajdhani ml-auto" onClick={handleAddNewQuest}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Quest
              </Button>
            </div>
          </div>
        </div>

        <KanbanBoard ref={kanbanRef} boardId={currentBoardId} onBoardDataChange={(data) => setBoardData(data)} />
      </main>
    </div>
  )
}
