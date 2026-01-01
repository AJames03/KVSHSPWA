'use client'
import { useState, useEffect } from 'react'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'

const poppins = Poppins({
  weight: ['400', '600', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function YourSched() {
  const [mounted, setMounted] = useState(false)
  const [dateData, setDateData] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const [scheduleError, setScheduleError] = useState(false)
  const [sectionsError, setSectionsError] = useState(false)
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const today = new Date()
  const currentDay = days[today.getDay() - 1]

  useEffect(() => { setMounted(true) }, [])

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select('sections(strand, year_level, section_name, section_type)')
    if (error) {
      console.error('Error fetching sections:', error)
      setSectionsError(true)
      return
    }
    const sectionList = data.map((item) => item.sections).filter((s) => s)
    const uniqueSections = Array.from(new Set(sectionList.map((s) => JSON.stringify(s)))).map((s) => JSON.parse(s))
    setSections(uniqueSections)
    setSectionsError(false)
  }

  const fetchSchedule = async () => {
    const email = localStorage.getItem('userEmail')
    if (!email) return
    const { data, error } = await supabase
      .from('schedules')
      .select(`id, day, time_slot, subjects(subject_title, teacher_email), sections(strand, year_level, section_name, section_type)`)
      .eq('day', currentDay)

    if (error) {
      console.error('Error fetching schedule:', error)
      setScheduleError(true)
      return
    }
    const filteredSchedules = data.filter((schedule: any) => schedule.subjects && schedule.subjects.teacher_email === email)

    const now = new Date()
    const sortedSchedules = filteredSchedules.sort((a: any, b: any) => {
      const getTime = (t: string) => new Date(`1970-01-01 ${t.split(' - ')[0]}`).getTime()
      return getTime(a.time_slot) - getTime(b.time_slot)
    })

    // Remove duplicates based on time_slot
    const uniqueSchedules = []
    const seen = new Set()
    for (const schedule of sortedSchedules) {
      if (!seen.has(schedule.time_slot)) {
        seen.add(schedule.time_slot)
        uniqueSchedules.push(schedule)
      }
    }
    setDateData(uniqueSchedules)
    setScheduleError(false)
  }

  useEffect(() => { fetchSections(); fetchSchedule(); }, [])

  return (
    <div className={`${poppins.className} w-full h-full p-4`}>
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{currentDay}</h2>
        <div className="flex items-center gap-2 text-sky-600 font-medium">
          <i className="bi bi-calendar-event"></i>
          <p className="text-sm">Today's Teaching Schedule</p>
        </div>
      </div>

      {/* Schedule List */}
      <div className="flex flex-col gap-4">
        {scheduleError ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <i className="bi bi-wifi-off text-6xl mb-4"></i>
            <p className="font-bold">Failed to load schedule</p>
            <p className="text-sm">Check your internet connection and try again</p>
          </div>
        ) : dateData.length > 0 ? (
          dateData.map((schedule, index) => {
            const [start, end] = schedule.time_slot.split(' - ')
            const now = new Date()
            const startDate = new Date(today.toDateString() + ' ' + start)
            const endDate = new Date(today.toDateString() + ' ' + end)
            const isCurrent = now >= startDate && now <= endDate

            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className={`relative overflow-hidden rounded-3xl p-5 transition-all duration-300 shadow-sm border ${
                  isCurrent 
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xl shadow-blue-200 border-transparent scale-[1.02]' 
                  : 'bg-white/70 backdrop-blur-sm border-white/50 text-slate-700'
                }`}
              >
                {/* Status Indicator */}
                {isCurrent && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    On-going
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <p className={`text-lg font-bold ${isCurrent ? 'text-white' : 'text-slate-800'}`}>
                    {schedule.subjects?.subject_title || 'No subject'}
                  </p>
                  
                  <div className="flex items-center gap-2 opacity-90 text-sm">
                    <i className={`bi ${isCurrent ? 'bi-clock-fill' : 'bi-clock'}`}></i>
                    <span>{schedule.time_slot}</span>
                  </div>

                  <div className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit ${
                    isCurrent ? 'bg-white/20' : 'bg-sky-50 text-sky-700'
                  }`}>
                    <i className="bi bi-people-fill text-xs"></i>
                    <p className="text-xs font-bold uppercase tracking-wide">
                      {schedule.sections?.strand} {schedule.sections?.year_level} - {schedule.sections?.section_name}
                    </p>
                  </div>
                </div>

                {/* Background Decoration */}
                <div className={`absolute -bottom-2 -right-2 opacity-10 text-6xl rotate-12`}>
                   <i className="bi bi-journal-bookmark-fill"></i>
                </div>
              </motion.div>
            )
          })
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <i className="bi bi-calendar-x text-6xl mb-4"></i>
            <p className="font-bold">No schedule for today</p>
          </div>
        )}
      </div>
    </div>
  )
}