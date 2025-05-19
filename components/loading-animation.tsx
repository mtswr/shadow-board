"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function LoadingAnimation() {
  const [progress, setProgress] = useState(0)
  const [showText, setShowText] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 1
        })
      }, 20)

      return () => clearInterval(interval)
    }, 500)

    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 300)

    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 2700)

    return () => {
      clearTimeout(timer)
      clearTimeout(textTimer)
      clearTimeout(fadeTimer)
    }
  }, [])

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 transition-opacity duration-500",
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('/images/solo-leveling-bg-pattern.png')`,
            backgroundSize: "400px",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-slate-900/80" />
      </div>

      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            "text-4xl md:text-6xl font-orbitron text-blue-400 tracking-widest sl-glow-text transition-all duration-700 transform mb-4",
            showText ? "opacity-100 scale-100" : "opacity-0 scale-150",
          )}
          style={{
            textShadow: showText ? "0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4)" : "none",
          }}
        >
          ARISE
        </div>

        <div
          className={cn(
            "text-xl font-orbitron text-blue-400 tracking-widest sl-glow-text transition-opacity duration-500",
            showText ? "opacity-100" : "opacity-0",
          )}
        >
          LOADING
        </div>

        <div className="text-sm text-blue-300/70 font-mono mt-2 text-center">{Math.floor(progress)}%</div>
      </div>

      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-blue-500/50" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-blue-500/50" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-blue-500/50" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-500/50" />
    </div>
  )
}
