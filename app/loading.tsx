import { Music2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center animate-pulse-glow">
            <Music2 className="w-8 h-8 text-white" />
          </div>
          {/* Orbiting dot */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-violet-400 rounded-full" />
          </div>
        </div>

        {/* Loading text */}
        <p className="text-foreground-muted text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
