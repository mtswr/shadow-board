"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { MoreHorizontal, Pencil, Trash2, Clock, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QuestFormDialog } from "./formn"
import { DeleteConfirmationDialog } from "./delete-confirmation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pomodoro } from "./pomodoro"

export type QuestRank = "S" | "A" | "B" | "C" | "D" | "E"

export interface QuestItem {
  id: string
  content: string
  description?: string
  rank: QuestRank
  points: number
  showPomodoro?: boolean
}

export interface Column {
  id: string
  title: string
  questIds: string[]
}

export interface BoardData {
  quests: Record<string, QuestItem>
  columns: Record<string, Column>
  columnOrder: string[]
}

export interface KanbanBoardRef {
  handleAddQuest: (columnId: string) => void
}

interface KanbanBoardProps {
  boardId: string
  onBoardDataChange?: (data: BoardData) => void
}

const STORAGE_KEYS = {
  BOARD_DATA: (boardId: string) => `shadow-board-${boardId}`,
  BOARD_UPDATED: (boardId: string) => `shadow-board-updated-${boardId}`,
}

const DEFAULT_COLUMNS: Record<string, Column> = {
  "column-1": { id: "column-1", title: "Quests", questIds: [] },
  "column-2": { id: "column-2", title: "In Progress", questIds: [] },
  "column-3": { id: "column-3", title: "Under Review", questIds: [] },
  "column-4": { id: "column-4", title: "Completed", questIds: [] },
}

const getEmptyBoard = (): BoardData => ({
  quests: {},
  columns: DEFAULT_COLUMNS,
  columnOrder: ["column-1", "column-2", "column-3", "column-4"],
})

const saveToLocalStorage = (boardId: string, data: BoardData): void => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.BOARD_DATA(boardId), JSON.stringify(data))
      localStorage.setItem(STORAGE_KEYS.BOARD_UPDATED(boardId), Date.now().toString())
    }
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

const loadFromLocalStorage = (boardId: string): BoardData | null => {
  try {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(STORAGE_KEYS.BOARD_DATA(boardId))
      return savedData ? JSON.parse(savedData) : null
    }
    return null
  } catch (error) {
    console.error("Error loading from localStorage:", error)
    return null
  }
}

export const KanbanBoard = forwardRef<KanbanBoardRef, KanbanBoardProps>(({ boardId, onBoardDataChange }, ref) => {
  const [data, setData] = useState<BoardData>(getEmptyBoard())
  const [isQuestFormOpen, setIsQuestFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentColumn, setCurrentColumn] = useState<string | null>(null)
  const [currentQuest, setCurrentQuest] = useState<QuestItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useImperativeHandle(ref, () => ({
    handleAddQuest: (columnId: string) => handleAddQuest(columnId),
  }))

  useEffect(() => {
    const savedData = loadFromLocalStorage(boardId)
    if (savedData) {
      setData(savedData)
    }
    setIsLoading(false)
  }, [boardId])

  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage(boardId, data)
      onBoardDataChange?.(data)
    }
  }, [data, boardId, isLoading, onBoardDataChange])

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    const sourceColumn = data.columns[source.droppableId]
    const destColumn = data.columns[destination.droppableId]

    if (sourceColumn.id === destColumn.id) {
      const newQuestIds = Array.from(sourceColumn.questIds)
      newQuestIds.splice(source.index, 1)
      newQuestIds.splice(destination.index, 0, draggableId)

      setData({
        ...data,
        columns: {
          ...data.columns,
          [sourceColumn.id]: { ...sourceColumn, questIds: newQuestIds },
        },
      })
      return
    }

    const sourceQuestIds = Array.from(sourceColumn.questIds)
    sourceQuestIds.splice(source.index, 1)
    const destQuestIds = Array.from(destColumn.questIds)
    destQuestIds.splice(destination.index, 0, draggableId)

    setData({
      ...data,
      columns: {
        ...data.columns,
        [sourceColumn.id]: { ...sourceColumn, questIds: sourceQuestIds },
        [destColumn.id]: { ...destColumn, questIds: destQuestIds },
      },
    })
  }

  const handleAddQuest = (columnId: string) => {
    setCurrentColumn(columnId)
    setCurrentQuest(null)
    setIsEditing(false)
    setIsQuestFormOpen(true)
  }

  const handleEditQuest = (quest: QuestItem) => {
    setCurrentQuest(quest)
    setIsEditing(true)
    setIsQuestFormOpen(true)
  }

  const handleDeleteClick = (quest: QuestItem) => {
    setCurrentQuest(quest)
    setIsDeleteDialogOpen(true)
  }

  const togglePomodoro = (questId: string) => {
    setData({
      ...data,
      quests: {
        ...data.quests,
        [questId]: {
          ...data.quests[questId],
          showPomodoro: !data.quests[questId].showPomodoro,
        },
      },
    })
  }

  const handlePomodoroComplete = (questId: string) => {
    console.log(`Pomodoro completed for quest ${questId}`)
  }

  const handleQuestSubmit = (questData: {
    id?: string
    content: string
    description: string
    rank: QuestRank
    points: number
  }) => {
    if (isEditing && currentQuest) {
      setData({
        ...data,
        quests: {
          ...data.quests,
          [currentQuest.id]: {
            ...currentQuest,
            content: questData.content,
            description: questData.description,
            rank: questData.rank,
            points: questData.points,
          },
        },
      })
    } else if (currentColumn) {
      const newQuestId = `quest-${Date.now()}`
      const newQuest: QuestItem = {
        id: newQuestId,
        content: questData.content,
        description: questData.description,
        rank: questData.rank,
        points: questData.points,
        showPomodoro: false,
      }

      const column = data.columns[currentColumn]
      const newQuestIds = Array.from(column.questIds)
      newQuestIds.push(newQuestId)

      setData({
        ...data,
        quests: { ...data.quests, [newQuestId]: newQuest },
        columns: {
          ...data.columns,
          [currentColumn]: { ...column, questIds: newQuestIds },
        },
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (!currentQuest) return

    const remainingQuests = { ...data.quests }
    delete remainingQuests[currentQuest.id]
    const updatedColumns: Record<string, Column> = {}

    Object.values(data.columns).forEach((column) => {
      updatedColumns[column.id] = {
        ...column,
        questIds: column.questIds.filter((id) => id !== currentQuest.id),
      }
    })

    setData({
      ...data,
      quests: remainingQuests,
      columns: updatedColumns,
    })

    setIsDeleteDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-blue-400 font-rajdhani">Loading board data...</div>
      </div>
    )
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId]
            const quests = column.questIds.map((questId) => data.quests[questId])

            return (
              <div key={column.id} className="sl-panel relative">
                <div className="decorative-corner corner-top-left"></div>
                <div className="decorative-corner corner-top-right"></div>
                <div className="decorative-corner corner-bottom-left"></div>
                <div className="decorative-corner corner-bottom-right"></div>

                <div className="border-b border-slate-700 flex justify-between items-center">
                  <h3 className="font-rajdhani font-semibold text-blue-400">{column.title}</h3>
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                    {column.questIds.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="p-3 min-h-[200px]">
                      {quests.length > 0 ? (
                        quests.map((quest, index) => (
                          <Draggable key={quest.id} draggableId={quest.id} index={index}>
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-3 bg-slate-900 border-slate-700 hover:border-blue-500 transition-all relative solo-card"
                              >
                                <CardContent className="p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-rajdhani font-semibold">{quest.content}</p>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="bg-slate-800 border-slate-700 text-slate-200"
                                      >
                                        <DropdownMenuItem
                                          onClick={() => togglePomodoro(quest.id)}
                                          className="flex items-center cursor-pointer hover:bg-slate-700"
                                        >
                                          <Clock className="mr-2 h-4 w-4" />
                                          {quest.showPomodoro ? "Hide Timer" : "Show Timer"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleEditQuest(quest)}
                                          className="flex items-center cursor-pointer hover:bg-slate-700"
                                        >
                                          <Pencil className="mr-2 h-4 w-4" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteClick(quest)}
                                          className="flex items-center cursor-pointer text-red-400 hover:bg-slate-700 hover:text-red-400"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  {quest.description && (
                                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">{quest.description}</p>
                                  )}

                                  <div className="flex justify-between items-center mt-3">
                                    <Badge
                                      className={`
                                      ${quest.rank === "S"
                                          ? "bg-purple-900 hover:bg-purple-800 text-purple-200"
                                          : quest.rank === "A"
                                            ? "bg-red-900 hover:bg-red-800 text-red-200"
                                            : quest.rank === "B"
                                              ? "bg-orange-900 hover:bg-orange-800 text-orange-200"
                                              : quest.rank === "C"
                                                ? "bg-yellow-900 hover:bg-yellow-800 text-yellow-200"
                                                : quest.rank === "D"
                                                  ? "bg-green-900 hover:bg-green-800 text-green-200"
                                                  : "bg-blue-900 hover:bg-blue-800 text-blue-200"
                                        }
                                      font-rajdhani
                                    `}
                                    >
                                      {quest.rank}-Rank
                                    </Badge>
                                    <span className="text-xs text-slate-400">{quest.points} XP</span>
                                  </div>

                                  {quest.showPomodoro && (
                                    <div className="mt-3 pt-3 border-t border-slate-700">
                                      <Pomodoro
                                        questId={quest.id}
                                        onComplete={() => handlePomodoroComplete(quest.id)}
                                      />
                                    </div>
                                  )}

                                  {!quest.showPomodoro && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full mt-2 text-xs text-slate-400 hover:text-slate-200"
                                      onClick={() => togglePomodoro(quest.id)}
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      Start Timer
                                    </Button>
                                  )}

                                  {quest.showPomodoro && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full mt-2 text-xs text-slate-400 hover:text-slate-200"
                                      onClick={() => togglePomodoro(quest.id)}
                                    >
                                      <ChevronUp className="h-3 w-3 mr-1" />
                                      Hide Timer
                                    </Button>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
                          <p>No quests yet</p>
                          <p className="text-xs mt-1">Click below to add one</p>
                        </div>
                      )}
                      {provided.placeholder}

                      <Button
                        variant="link"
                        className="w-full justify-center text-slate-400 hover:text-slate-200 mt-2"
                        onClick={() => handleAddQuest(column.id)}
                      >
                        Add Quest
                      </Button>
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      <QuestFormDialog
        isOpen={isQuestFormOpen}
        onClose={() => setIsQuestFormOpen(false)}
        onSubmit={handleQuestSubmit}
        initialData={currentQuest || undefined}
        isEditing={isEditing}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Quest"
        description={`Are you sure you want to delete "${currentQuest?.content}"? This action cannot be undone.`}
      />
    </>
  )
})

KanbanBoard.displayName = "KanbanBoard"
