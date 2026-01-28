'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  label?: string
  value?: string // HH:mm format (24-hour)
  onChange?: (time: string) => void
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  step?: number // minute step (default: 15)
}

export function TimePicker({
  label,
  value,
  onChange,
  placeholder = 'Select time',
  error,
  hint,
  disabled,
  step = 15,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse current value or use default
  const parseTime = useCallback((timeStr?: string) => {
    if (!timeStr) return { hours: 9, minutes: 0 }
    const [h, m] = timeStr.split(':').map(Number)
    return { hours: h || 0, minutes: m || 0 }
  }, [])

  const { hours, minutes } = parseTime(value)

  // Format display value
  const displayValue = useMemo(() => {
    if (!value) return null
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const period = hours < 12 ? 'AM' : 'PM'
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
  }, [value, hours, minutes])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  // Set initial value when opening without a value
  const handleOpen = () => {
    if (!disabled) {
      if (!value) {
        // Default to 9:00 AM
        onChange?.('09:00')
      }
      setIsOpen(!isOpen)
    }
  }

  // Adjustment handlers
  const adjustHours = (delta: number) => {
    const currentHours = value ? hours : 9
    const currentMinutes = value ? minutes : 0
    const newHours = (currentHours + delta + 24) % 24
    const newTime = `${newHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`
    onChange?.(newTime)
  }

  const adjustMinutes = (delta: number) => {
    const currentHours = value ? hours : 9
    const currentMinutes = value ? minutes : 0
    let newMinutes = currentMinutes + delta
    let newHours = currentHours

    if (newMinutes >= 60) {
      newMinutes -= 60
      newHours = (newHours + 1) % 24
    } else if (newMinutes < 0) {
      newMinutes += 60
      newHours = (newHours - 1 + 24) % 24
    }

    const newTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`
    onChange?.(newTime)
  }

  const togglePeriod = () => {
    const currentHours = value ? hours : 9
    const currentMinutes = value ? minutes : 0
    const newHours = currentHours < 12 ? currentHours + 12 : currentHours - 12
    const newTime = `${newHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`
    onChange?.(newTime)
  }

  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  const isPM = hours >= 12

  return (
    <div className="w-full" ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label className="block text-sm font-medium text-foreground-muted mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={cn(
            'flex items-center w-full h-12 rounded-xl border bg-surface-elevated px-4',
            'text-foreground transition-all duration-200 outline-none',
            'border-white/10 hover:border-white/20',
            isOpen && 'border-violet-500 ring-2 ring-violet-500/20',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          aria-label="Select time"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <Clock className="w-4 h-4 text-foreground-subtle mr-3" />
          <span className={cn(!displayValue && 'text-foreground-subtle')}>
            {displayValue || placeholder}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute z-50 mt-2 p-5 rounded-2xl',
                'bg-surface-elevated border border-white/10',
                'shadow-xl shadow-black/30'
              )}
              role="dialog"
              aria-label="Time selection"
            >
              <div className="flex items-center justify-center gap-4">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => adjustHours(1)}
                    className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-foreground transition-colors"
                    aria-label="Increase hour"
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <div className="text-4xl font-bold text-foreground tabular-nums w-16 text-center py-2">
                    {displayHours.toString().padStart(2, '0')}
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustHours(-1)}
                    className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-foreground transition-colors"
                    aria-label="Decrease hour"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>

                <span className="text-4xl font-bold text-foreground-muted pb-1">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => adjustMinutes(step)}
                    className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-foreground transition-colors"
                    aria-label="Increase minutes"
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <div className="text-4xl font-bold text-foreground tabular-nums w-16 text-center py-2">
                    {minutes.toString().padStart(2, '0')}
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustMinutes(-step)}
                    className="p-2 rounded-lg hover:bg-white/10 text-foreground-muted hover:text-foreground transition-colors"
                    aria-label="Decrease minutes"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>

                {/* AM/PM Toggle */}
                <div className="flex flex-col gap-2 ml-2">
                  <button
                    type="button"
                    onClick={() => isPM && togglePeriod()}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                      !isPM
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-foreground'
                    )}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => !isPM && togglePeriod()}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                      isPM
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/5 text-foreground-muted hover:bg-white/10 hover:text-foreground'
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Done button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
      {hint && !error && <p className="mt-2 text-sm text-foreground-subtle">{hint}</p>}
    </div>
  )
}
