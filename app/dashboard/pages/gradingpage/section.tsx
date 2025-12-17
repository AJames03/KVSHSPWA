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

export default function Section({ onSelect }: { onSelect: (sec: any) => void }) {
  const [userName, setUserName] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [sections, setSections] = useState<any[]>([])
  const [focusSection, setFocusSection] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Ensure component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch logged-in teacher name
  useEffect(() => {
    if (!mounted) return

    const fetchUserName = async () => {
      const email = localStorage.getItem('userEmail')
      if (!email) return

      const { data, error } = await supabase
        .from('teachers')
        .select('surname, firstname, middlename, suffix')
        .eq('email', email)
        .single()

      if (error) console.error('Error fetching teacher name:', error)

      if (data) {
        const fullName = `${data.firstname} ${data.middlename ?? ''} ${data.surname} ${data.suffix ?? ''}`.trim();
        setUserName(fullName);
      }
    }

    fetchUserName()
  }, [mounted])

  // Fetch all sections the teacher teaches (ALL DAYS, UNIQUE ONLY)
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
      // Unique sections
      const uniqueSections = Array.from(
        new Set(sectionList.map((s) => JSON.stringify(s)))
      ).map((s) => JSON.parse(s))

      setSections(uniqueSections)
    }
  }

  // Run on load
  useEffect(() => {
    if (!mounted) return
    fetchSections()
  }, [mounted])

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
    <div className={`${poppins.className}  lg:w-50 h-full  p-2`}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-left flex justify-between items-center hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className='w-50 truncate'>{selectedSec ? `${selectedSec.strand} ${selectedSec.year_level} ${selectedSec.section_name}${selectedSec.section_type !== 'Regular' ? ` (${selectedSec.section_type})` : ''}` : 'Select Section'}</span>
            <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen && (
            <ul className="absolute z-10 w-40 lg:w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
              {sections.length === 0 ? (
                <li className="px-4 py-2 text-gray-500 text-sm">No assigned sections.</li>
              ) : (
                sections.map((sec) => (
                  <li
                    key={sec.id}
                    onClick={() => {
                      setFocusSection(sec.id)
                      onSelect(sec)
                      setIsOpen(false)
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {sec.strand} {sec.year_level} {sec.section_name}
                    {sec.section_type !== 'Regular' && <> ({sec.section_type})</>}
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
