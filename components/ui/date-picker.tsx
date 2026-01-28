'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  label?: string
  value?: string // ISO date string (YYYY-MM-DD)
  onChange?: (date: string) => void
  placeholder?: string
  error?: string
  hint?: string
  minDate?: Date
  disabled?: boolean
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
  hint,
  minDate,
  disabled,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      return new Date(value)
    }
    return new Date()
  })
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedDate = value ? new Date(value) : null

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

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Pad the days array to start on Sunday
  const startDay = startOfMonth(currentMonth).getDay()
  const paddedDays = [...Array(startDay).fill(null), ...days]

  const handleDateSelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    onChange?.(formattedDate)
    setIsOpen(false)
  }

  const isDateDisabled = (date: Date) => {
    if (!minDate) return false
    return isBefore(date, startOfDay(minDate))
  }

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

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
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex items-center w-full h-12 rounded-xl border bg-surface-elevated px-4',
            'text-foreground transition-all duration-200 outline-none',
            'border-white/10 hover:border-white/20',
            isOpen && 'border-violet-500 ring-2 ring-violet-500/20',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          aria-label="Select date"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <CalendarIcon className="w-4 h-4 text-foreground-subtle mr-3" />
          <span className={cn(!selectedDate && 'text-foreground-subtle')}>
            {selectedDate ? format(selectedDate, 'EEE, MMM d, yyyy') : placeholder}
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
                'absolute z-50 mt-2 p-4 rounded-2xl',
                'bg-surface-elevated border border-white/10',
                'shadow-xl shadow-black/30'
              )}
              role="dialog"
              aria-label="Calendar"
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-lg hover:bg-white/5 text-foreground-muted hover:text-foreground transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-foreground font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg hover:bg-white/5 text-foreground-muted hover:text-foreground transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="w-10 h-8 flex items-center justify-center text-xs font-medium text-foreground-subtle"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {paddedDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="w-10 h-10" />
                  }

                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const isCurrentDay = isToday(day)
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isDisabled = isDateDisabled(day)

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => !isDisabled && handleDateSelect(day)}
                      disabled={isDisabled}
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all',
                        'hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                        !isCurrentMonth && 'text-foreground-subtle opacity-40',
                        isCurrentMonth && !isSelected && 'text-foreground',
                        isCurrentDay && !isSelected && 'ring-1 ring-violet-500/50 text-violet-400',
                        isSelected && 'bg-violet-500 text-white font-semibold hover:bg-violet-600',
                        isDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent'
                      )}
                      aria-label={format(day, 'PPPP')}
                      aria-selected={isSelected || undefined}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>

              {/* Today Button */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date()
                    if (!isDateDisabled(today)) {
                      setCurrentMonth(today)
                      handleDateSelect(today)
                    }
                  }}
                  className="w-full py-2 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors"
                >
                  Today
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
      {hint && !error && <p className="mt-2 text-sm text-foreground-subtle">{hint}</p>}
    </div>
  )
}
