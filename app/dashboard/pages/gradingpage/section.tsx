'use client'
import { useState, useEffect, useRef } from 'react'
import { Poppins } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion' // Para sa smooth mobile feel
import { supabase } from '@/lib/supabaseClient'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
})

export default function Section({ onSelect }: { onSelect: (sec: any) => void }) {
  const [mounted, setMounted] = useState(false)
  const [sections, setSections] = useState<any[]>([])
  const [focusSection, setFocusSection] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Fetch sections logic (Same as original)
  const fetchSections = async () => {
    const email = localStorage.getItem('userEmail')
    if (!email) return

    const { data, error } = await supabase
      .from('schedules')
      .select('sections(id, strand, year_level, section_name, section_type)')
      .eq('teacher_email', email)

    if (error) {
      console.error('Error fetching sections:', error)
      return
    }

    if (data) {
      const sectionList = data.map(item => item.sections)
      const uniqueSections = Array.from(
        new Set(sectionList.map((s) => JSON.stringify(s)))
      ).map((s) => JSON.parse(s))
      setSections(uniqueSections)
    }
  }

  useEffect(() => {
    if (!mounted) return
    fetchSections()
  }, [mounted])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedSec = sections.find(sec => sec.id === focusSection)

  return (
    <div className={`${poppins.className} w-full`} ref={dropdownRef}>
      <div className="relative">
        {/* Mobile-friendly Button */}
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
              Section
            </span>
            <span className="text-sm font-bold text-slate-700 truncate w-full">
              {selectedSec 
                ? `${selectedSec.strand} ${selectedSec.year_level}-${selectedSec.section_name}` 
                : 'Select Section'}
            </span>
          </div>
          
          <svg 
            className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Responsive Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`
                absolute z-[60] left-0 right-0 mt-2
                bg-white border border-slate-100 rounded-2xl shadow-2xl
                max-h-[300px] overflow-y-auto overflow-x-hidden
                custom-scrollbar
              `}
            >
              {sections.length === 0 ? (
                <li className="px-5 py-4 text-slate-400 text-xs text-center italic">
                  No assigned sections found.
                </li>
              ) : (
                sections.map((sec) => (
                  <li
                    key={sec.id}
                    onClick={() => {
                      setFocusSection(sec.id)
                      onSelect(sec)
                      setIsOpen(false)
                    }}
                    className={`
                      px-5 py-4 border-b border-slate-50 last:border-none
                      hover:bg-blue-50 transition-colors cursor-pointer
                      flex flex-col gap-0.5
                    `}
                  >
                    <span className="text-sm font-bold text-slate-800">
                      {sec.strand} {sec.year_level}-{sec.section_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                        sec.section_type === 'Regular' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-amber-50 text-amber-600'
                      }`}>
                        {sec.section_type}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}