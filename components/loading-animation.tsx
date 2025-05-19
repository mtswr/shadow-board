"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function LoadingAnimation() {
  const [progress, setProgress] = useState(0)
  const [showText, setShowText] = useState(false)
  const [showAriseText, setShowAriseText] = useState(false)
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

    const ariseTextTimer = setTimeout(() => {
      setShowAriseText(true)
    }, 1500)

    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 2700)

    return () => {
      clearTimeout(timer)
      clearTimeout(textTimer)
      clearTimeout(ariseTextTimer)
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

      <div className="relative w-40 h-40 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-pulse" />

        <div className="absolute inset-0 animate-spin-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <g key={i} transform={`rotate(${angle} 50 50)`}>
                <rect x="48" y="5" width="4" height="8" fill="#3b82f6" />
              </g>
            ))}
          </svg>
        </div>

        <div className="absolute inset-2 animate-spin-reverse-slow">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          </svg>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-400/30">
            <div className="text-xl font-bold text-blue-400 font-orbitron sl-glow-text">SL</div>
          </div>
        </div>

        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(30, 64, 175, 0.2)" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="transition-all duration-100 ease-linear"
          />
        </svg>
      </div>

      <div className="relative">
        <div
          className={cn(
            "text-xl font-orbitron text-blue-400 tracking-widest sl-glow-text transition-opacity duration-500",
            showText ? "opacity-100" : "opacity-0",
          )}
        >
          LOADING
        </div>

        <div className="text-sm text-blue-300/70 font-mono mt-2 text-center">{Math.floor(progress)}%</div>
      </div>1

      <div
        className={cn(
          "absolute text-4xl md:text-6xl font-orbitron text-blue-400 tracking-widest sl-glow-text transition-all duration-700 transform",
          showAriseText ? "opacity-100 scale-100" : "opacity-0 scale-150",
        )}
        style={{
          textShadow: showAriseText ? "0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4)" : "none",
        }}
      >
        ARISE
      </div>

      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-blue-500/50" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-blue-500/50" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-blue-500/50" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-500/50" />
    </div>
  )
}
