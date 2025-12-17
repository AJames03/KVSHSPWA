'use client'
import { useState, useEffect, useRef } from 'react'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
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

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch subjects
  const fetchSubjects = async () => {
    if (!selectedSection || !selectedSemester) return

    const email = localStorage.getItem('userEmail')
    if (!email) return

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        subjects!inner(id, subject_title, semester, teacher_email),
        sections!inner(id)
      `)
      .eq('semester', selectedSemester)

    if (error) {
      console.error('Error fetching subjects:', error)
      return
    }

    // Filter by section and teacher email
    const allSubjects = data
      .filter((item: any) => item.sections.id === selectedSection.id)
      .flatMap((item: any) => item.subjects)
      .filter((s: any) => s.teacher_email === email)

    // Remove duplicates by ID
    const uniqueSubjects = Array.from(
      new Set(allSubjects.map((s: any) => s.id))
    ).map((id) => allSubjects.find((s: any) => s.id === id))

    console.log('Fetched subjects:', uniqueSubjects)
    setSubjects(uniqueSubjects as SubjectType[])
  }

  // Fetch when section or semester changes
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

  // Close dropdown on click outside
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
    <div className={`${poppins.className} lg:w-50 h-full  p-2`}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 
            py-2 text-left flex flex-nowrap justify-between items-center 
            hover:bg-gray-200 focus:outline-none 
            focus:ring-2 focus:ring-blue-500"
          >
            <span className="w-50 truncate">{focusSubject || 'Select a subject'}</span>
            <svg
              className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <ul className="flex flex-col absolute z-10 right-0 w-70 bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
              {!selectedSection || !selectedSemester ? (
                <li className="px-4 py-2 text-gray-500 text-sm">
                  Select semester and section first.
                </li>
              ) : subjects.length === 0 ? (
                <li className="px-4 py-2 text-gray-500 text-sm">
                  No assigned subjects for this section and semester.
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
                    className={`px-4 py-2 cursor-pointer transition
                      ${focusSubject === sub.subject_title ? 'bg-yellow-200 text-black font-medium' : 'hover:bg-gray-100'}
                    `}
                  >
                    {sub.subject_title} - {sub.semester}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
