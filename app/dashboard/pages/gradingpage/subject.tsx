'use client'
import { useState, useEffect, useRef } from 'react'
import { Poppins } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
})

interface SubjectType {
  id: string
  subject_title: string
  teacher_email: string
  semester: string
}

export default function Subject({
  selectedSection,
  selectedSemester,
  onSelect,
}: {
  selectedSection: any
  selectedSemester: string | null
  onSelect: (sub: SubjectType) => void
}) {
  const [mounted, setMounted] = useState(false)
  const [subjects, setSubjects] = useState<SubjectType[]>([])
  const [focusSubject, setFocusSubject] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const fetchSubjects = async () => {
    if (!selectedSection || !selectedSemester) return
    const email = localStorage.getItem('userEmail')
    if (!email) return

    const cleanedSemester = selectedSemester.split(' ')[0];

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        subjects!inner(id, subject_title, semester, teacher_email),
        sections!inner(id)
      `)
      .or(`semester.eq.${cleanedSemester},semester.eq.${selectedSemester}`)

    if (error) {
      console.error('Error fetching subjects:', error)
      return
    }

    if (data) {
      const allSubjects = data
        .filter((item: any) => item.sections?.id === selectedSection.id)
        .flatMap((item: any) => item.subjects)
        .filter((s: any) => s && s.teacher_email === email)

      const uniqueSubjects = Array.from(
        new Set(allSubjects.map((s: any) => s.id))
      ).map((id) => allSubjects.find((s: any) => s.id === id))

      setSubjects(uniqueSubjects as SubjectType[])
    }
  }

  useEffect(() => {
    if (!mounted) return
    if (!selectedSection || !selectedSemester) {
      setFocusSubject(null)
      setSubjects([])
      return
    }
    setFocusSubject(null)
    fetchSubjects()
  }, [mounted, selectedSection, selectedSemester])

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
    /**
     * RESPONSIVE CONTAINER:
     * w-full: Mobile-first (full width)
     * lg:w-auto: Sa malalaking screen, depende sa content ang width
     * lg:min-w-[220px]: Siguradong may sapat na space sa desktop
     */
    <div className={`${poppins.className} w-full lg:w-auto lg:min-w-[220px]`} ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between gap-3
            px-4 py-3.5 rounded-xl transition-all duration-200
            ${isOpen 
              ? 'bg-white shadow-lg ring-2 ring-blue-500/20' 
              : 'bg-slate-100/60 hover:bg-slate-100'}
          `}
        >
          <div className="flex-1 flex flex-col items-start overflow-hidden text-left min-w-0">
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Subject
            </span>
            <span className="text-sm font-bold text-slate-700 truncate w-full">
              {focusSubject || 'Select Subject'}
            </span>
          </div>
          
          <svg 
            className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              /**
               * RESPONSIVE DROPDOWN:
               * w-full: Laging kasing-lapad ng button
               * lg:absolute: Naka-floating sa desktop
               * max-h-[60vh]: Hindi lalampas sa screen height sa mobile
               */
              className="absolute z-[100] left-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden max-h-[350px] overflow-y-auto w-full"
            >
              {!selectedSection || !selectedSemester ? (
                <li className="px-5 py-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  Select section &<br/>semester first
                </li>
              ) : subjects.length === 0 ? (
                <li className="px-5 py-8 text-center text-slate-400 text-xs italic">
                  No subjects found.
                </li>
              ) : (
                subjects.map((sub) => (
                  <li
                    key={sub.id}
                    onClick={() => {
                      setFocusSubject(sub.subject_title)
                      onSelect(sub)
                      setIsOpen(false)
                    }}
                    className={`
                      px-5 py-4 cursor-pointer transition-colors border-b border-slate-50 last:border-none
                      flex flex-col gap-1 active:bg-slate-100
                      ${focusSubject === sub.subject_title ? 'bg-blue-50' : 'hover:bg-slate-50'}
                    `}
                  >
                    <span className={`text-sm font-bold leading-tight ${focusSubject === sub.subject_title ? 'text-blue-600' : 'text-slate-700'}`}>
                      {sub.subject_title}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {sub.semester}
                    </span>
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