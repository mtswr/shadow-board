import Link from "next/link"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="font-orbitron font-bold text-white">SL</span>
          </div>
          <span className="text-lg font-orbitron font-bold text-blue-400 hidden md:inline-block sl-glow-text">
            SHADOW BOARD
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link href="https://github.com/mtswr/shadow-board" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-400">
              <Github className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
