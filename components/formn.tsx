"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

type QuestRank = "S" | "A" | "B" | "C" | "D" | "E"

type QuestFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (quest: {
    id?: string
    content: string
    description: string
    rank: QuestRank
    points: number
  }) => void
  initialData?: {
    id: string
    content: string
    description?: string
    rank: QuestRank
    points: number
  }
  isEditing?: boolean
}

export function QuestFormDialog({ isOpen, onClose, onSubmit, initialData, isEditing = false }: QuestFormProps) {
  const [content, setContent] = useState(initialData?.content || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [rank, setRank] = useState<QuestRank>(initialData?.rank || "E")
  const [points, setPoints] = useState(initialData?.points || 10)

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setContent(initialData.content || "")
        setDescription(initialData.description || "")
        setRank(initialData.rank || "E")
        setPoints(initialData.points || 10)
      } else if (!isEditing) {
        setContent("")
        setDescription("")
        setRank("E")
        setPoints(15)
      }
    }
  }, [isOpen, isEditing, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      id: initialData?.id,
      content,
      description,
      rank,
      points,
    })

    if (!isEditing) {
      setContent("")
      setDescription("")
      setRank("E")
      setPoints(15)
    }

    onClose()
  }

  const getRankColor = (questRank: QuestRank) => {
    switch (questRank) {
      case "S":
        return "text-purple-400 border-purple-400"
      case "A":
        return "text-red-400 border-red-400"
      case "B":
        return "text-orange-400 border-orange-400"
      case "C":
        return "text-yellow-400 border-yellow-400"
      case "D":
        return "text-green-400 border-green-400"
      case "E":
        return "text-blue-400 border-blue-400"
      default:
        return "text-blue-400 border-blue-400"
    }
  }

  const getPointsRange = (questRank: QuestRank) => {
    switch (questRank) {
      case "S":
        return { min: 200, max: 500, default: 300 }
      case "A":
        return { min: 100, max: 200, default: 150 }
      case "B":
        return { min: 70, max: 120, default: 100 }
      case "C":
        return { min: 40, max: 80, default: 60 }
      case "D":
        return { min: 20, max: 50, default: 30 }
      case "E":
        return { min: 5, max: 30, default: 15 }
      default:
        return { min: 5, max: 30, default: 15 }
    }
  }

  const handleRankChange = (newRank: QuestRank) => {
    setRank(newRank)
    setPoints(getPointsRange(newRank).default)
  }

  const pointsRange = getPointsRange(rank)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 sm:max-w-[500px] relative fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="sl-corner-decoration-tl"></div>
        <div className="sl-corner-decoration-tr"></div>
        <div className="sl-corner-decoration-bl"></div>
        <div className="sl-corner-decoration-br"></div>

        <DialogHeader>
          <DialogTitle className="font-orbitron text-blue-400 text-center text-xl">
            {isEditing ? "EDIT QUEST" : "CREATE NEW QUEST"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="quest-title" className="text-slate-300">
              Quest Title
            </Label>
            <Input
              id="quest-title"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter quest title"
              className="bg-slate-800 border-slate-700 focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quest-description" className="text-slate-300">
              Description
            </Label>
            <Textarea
              id="quest-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quest details"
              className="bg-slate-800 border-slate-700 min-h-[80px] focus:border-blue-500"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-slate-300">Quest Rank</Label>
            <RadioGroup
              value={rank}
              onValueChange={(value) => handleRankChange(value as QuestRank)}
              className="flex flex-wrap gap-3"
            >
              {(["S", "A", "B", "C", "D", "E"] as QuestRank[]).map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={`rank-${r}`} className={`border-2 ${getRankColor(r)}`} />
                  <Label
                    htmlFor={`rank-${r}`}
                    className={`font-bold font-orbitron ${r === rank ? getRankColor(r) : ""}`}
                  >
                    {r}-Rank
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-slate-300">XP Points</Label>
              <span className="text-sm font-medium text-blue-400">{points} XP</span>
            </div>
            <Slider
              value={[points]}
              min={pointsRange.min}
              max={pointsRange.max}
              step={5}
              onValueChange={(value) => setPoints(value[0])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>{pointsRange.min} XP</span>
              <span>{pointsRange.max} XP</span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isEditing) {
                  setContent("")
                  setDescription("")
                  setRank("E")
                  setPoints(15)
                }
                onClose()
              }}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button type="submit" className="sl-button">
              {isEditing ? "Save Changes" : "Create Quest"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
