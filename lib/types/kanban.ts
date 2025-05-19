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

export interface KanbanBoardProps {
  boardId: string
  onBoardDataChange?: (data: BoardData) => void
}

export interface KanbanBoardRef {
  handleAddQuest: (columnId: string) => void
} 