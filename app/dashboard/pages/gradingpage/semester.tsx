'use client'
import { useState, useEffect, useRef } from 'react'
import { Poppins } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
})

export default function Semester({ onSelect }: { onSelect: (sem: string) => void }) {
  const [focusSemester, setFocusSemester] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const semesters = ['1st Semester', '2nd Semester']

  // Click outside to close logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`${poppins.className} w-full`} ref={dropdownRef}>
      <div className="relative">
        {/* Modern Mobile-Responsive Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between gap-2
            px-4 py-3 rounded-xl transition-all duration-200
            ${isOpen 
              ? 'bg-white shadow-md ring-2 ring-blue-500/20' 
              : 'bg-slate-100/50 hover:bg-slate-100'}
          `}
        >
          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Term
            </span>
            <span className="text-sm font-bold text-slate-700 truncate">
              {focusSemester || 'Select Semester'}
            </span>
          </div>
          
          <svg 
            className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Animated Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-[70] left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden"
            >
              {semesters.map((sem, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setFocusSemester(sem)
                    onSelect(sem)
                    setIsOpen(false)
                  }}
                  className={`
                    px-5 py-4 cursor-pointer transition-colors border-b border-slate-50 last:border-none
                    flex items-center justify-between
                    ${focusSemester === sem ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'}
                  `}
                >
                  <span className="text-sm">{sem}</span>
                  {focusSemester === sem && (
                    <span className="text-blue-500 text-xs font-black">ACTIVE</span>
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}