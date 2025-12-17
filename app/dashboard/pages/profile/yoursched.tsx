'use client'
import { useState, useEffect } from 'react'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function YourSched() {
  const [mounted, setMounted] = useState(false)
  const [dateData, setDateData] = useState<any[]>([])
  const [sections, setSections] = useState<any[]>([])
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const today = new Date()
  const currentDay = days[today.getDay() - 1] // -1 dahil arrays start sa 0

  // Setup mounted on first load
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch unique sections
  const fetchSections = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select('sections(strand, year_level, section_name, section_type)')

    if (error) {
      console.error('Error fetching sections:', error)
      return
    }

    const sectionList = data.map((item) => item.sections).filter((s) => s)
    const uniqueSections = Array.from(
      new Set(sectionList.map((s) => JSON.stringify(s)))
    ).map((s) => JSON.parse(s))

    setSections(uniqueSections)
  }

  // Fetch schedule for logged-in teacher
  const fetchSchedule = async () => {
    const email = localStorage.getItem('userEmail')
    if (!email) return

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        id,
        day,
        time_slot,
        subjects(subject_title, teacher_email),
        sections(strand, year_level, section_name, section_type)
      `)
      .eq('day', currentDay)

    if (error) {
      console.error('Error fetching schedules:', error)
      return
    }

    // Filter schedules to only include those with this teacher
    const filteredSchedules = data.filter(
      (schedule: any) =>
        schedule.subjects && schedule.subjects.teacher_email === email
    )

    // Sort by start time, but prioritize current schedule
    const now = new Date()
    const sortedSchedules = filteredSchedules.sort((a: any, b: any) => {
      const getTime = (timeSlot: string) =>
        new Date(`1970-01-01 ${timeSlot.split(' - ')[0]}`).getTime()
      const getEndTime = (timeSlot: string) =>
        new Date(`1970-01-01 ${timeSlot.split(' - ')[1]}`).getTime()

      const aStart = getTime(a.time_slot)
      const aEnd = getEndTime(a.time_slot)
      const bStart = getTime(b.time_slot)
      const bEnd = getEndTime(b.time_slot)

      const aIsCurrent = now >= new Date(today.toDateString() + ' ' + a.time_slot.split(' - ')[0]) && now <= new Date(today.toDateString() + ' ' + a.time_slot.split(' - ')[1])
      const bIsCurrent = now >= new Date(today.toDateString() + ' ' + b.time_slot.split(' - ')[0]) && now <= new Date(today.toDateString() + ' ' + b.time_slot.split(' - ')[1])

      if (aIsCurrent && !bIsCurrent) return -1
      if (!aIsCurrent && bIsCurrent) return 1
      return aStart - bStart
    })

    setDateData(sortedSchedules)
  }

  // Load on mount
  useEffect(() => {
    fetchSections()
    fetchSchedule()
  }, [])

  const shouldShowSchedule = () => {
    if (dateData.length === 0) return false
    const now = new Date()
    const maxEndTime = Math.max(...dateData.map(s => new Date(today.toDateString() + ' ' + s.time_slot.split(' - ')[1]).getTime()))
    return now.getTime() <= maxEndTime
  }

  return (
    <div className='w-full h-full text-black bg-white'>
      <div className='w-auto h-full p-2 lg:grid lg:grid-rows-[1fr] items-end '>
        <div className='p-2 w-full h-full lg:w-120 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] rounded-md'>
          <div className='sticky top-0 z-10 p-2  w-full'>
            <p className={`${poppins.className} text-[24px] font-bold text-blue-500`}>{currentDay}</p>
            <p className={`${poppins.className} text-[14px]`}>Your today's Schedule</p>
          </div>
          {shouldShowSchedule() && (
            <ul className='w-full h-50 lg:h-95 flex flex-col gap-2 overflow-auto'>
              {dateData.map((schedule, index) => {
                // Parse start at end time
                const [start, end] = schedule.time_slot.split(' - ')
                const today = new Date()
                const startDate = new Date(today.toDateString() + ' ' + start)
                const endDate = new Date(today.toDateString() + ' ' + end)

                // Check if current time is within the schedule
                const now = new Date()
                const highlight = now >= startDate && now <= endDate
                console.log('Schedule:', schedule.time_slot, 'now:', now.toLocaleTimeString(), 'start:', startDate.toLocaleTimeString(), 'end:', endDate.toLocaleTimeString(), 'highlight:', highlight)

                return (
                  <li
                    key={index}
                    className={`p-2 rounded-md h-1/2 text-[clamp(14px,18px,20px)]
                      ${highlight ?
                      'bg-blue-800 text-white z-5 scale-100 grid grid-cols-[25px_1fr] group'
                      :
                      ' z-0 scale-90 odd:bg-sky-50 even:bg-yellow-50'}`}
                  >
                    <span className='w-1 h-full bg-blue-300 rounded-md' />
                    <span>
                      <p className='w-100 truncate font-bold'>
                        {schedule.subjects?.subject_title || 'No subject'}
                      </p>
                      <p className=''>
                        <i className={`bi ${highlight ? 'bi-clock-fill' : 'bi-clock'} mr-2 ml-2`}></i>
                        {schedule.time_slot}
                      </p>
                      <p className='text-sm ml-2'>
                        {schedule.sections?.strand} {schedule.sections?.year_level} -{' '}
                        {schedule.sections?.section_name}
                        {schedule.sections?.section_type !== 'Regular' && (
                          <> ({schedule.sections?.section_type})</>
                        )}
                      </p>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}