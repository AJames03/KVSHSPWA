'use client'
import { useState, useEffect, useRef } from 'react'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function Semester({ onSelect }: { onSelect: (sem: string) => void }) {
  const [focusSemester, setFocusSemester] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const semesters = ['1st', '2nd']

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
        <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-left flex justify-between items-center hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className='w-50 truncate'>{focusSemester || 'Select Semester'}</span>
            <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
              {semesters.map((sem, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setFocusSemester(sem)
                    onSelect(sem)
                    setIsOpen(false)
                  }}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${focusSemester === sem ? 'bg-yellow-200 text-black font-medium' : ''}`}
                >
                  {sem}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
