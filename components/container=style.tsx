import { cn } from "@/lib/utils"

type CornerPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right"

interface ContainerStyleProps {
  position: CornerPosition
  className?: string
  size?: "sm" | "md" | "lg"
  color?: string
}

export function ContainerStyle({
  position,
  className,
  size = "md",
  color = "rgba(59, 130, 246, 0.7)",
}: ContainerStyleProps) {
  const sizeMap = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  }

  const positionMap = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  }

  const borderMap = {
    "top-left": "border-t-2 border-l-2",
    "top-right": "border-t-2 border-r-2",
    "bottom-left": "border-b-2 border-l-2",
    "bottom-right": "border-b-2 border-r-2",
  }

  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        positionMap[position],
        sizeMap[size],
        borderMap[position],
        className,
      )}
      style={{ borderColor: color }}
    />
  )
}
