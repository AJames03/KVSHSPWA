'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/app/favicon.ico'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})


export default function monday() {
  const [mondayData, setMondayData] = useState<any[]>([]) // store schedules
  const [sections, setSections] = useState<any[]>([]) // store sections
  const [selectedSection, setSelectedSection] = useState<string>('') // selected section
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // dropdown open state

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select("sections(strand, year_level, section_name)")

    if (error) {
      console.error("Error fetching sections:", error)
    } else {
      // extract and make unique
      const sectionList = data.map(item => item.sections).filter(s => s)
      const uniqueSections = Array.from(new Set(sectionList.map(s => JSON.stringify(s)))).map(s => JSON.parse(s))
      setSections(uniqueSections)
    }
  }

  const fetchMonday = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select(`
        id,
        day,
        time_slot,
        subjects (
          subject_title
        ),
        sections(
          strand,
          year_level,
          section_name
        )
      `)
      .eq("day", "Monday"); // filter Monday only

    if (error) {
      console.error("Error fetching schedules:", error)
    } else {
      console.log("Schedules with subjects:", data)
      setMondayData(data)
    }
  }

  useEffect(() => {
    fetchSections()
    fetchMonday()
  }, [])

  const filteredData = selectedSection ? mondayData.filter(item => {
    const sel = JSON.parse(selectedSection)
    return item.sections?.strand === sel.strand && item.sections?.year_level === sel.year_level && item.sections?.section_name === sel.section_name
  }) : []

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
        <h2 className="text-xl font-bold">Monday Schedule</h2>
        <div className="relative mb-4">
          <div className="p-2 border rounded cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            {selectedSection ? JSON.parse(selectedSection).year_level + ' ' + JSON.parse(selectedSection).strand + ' ' + JSON.parse(selectedSection).section_name : 'Select Section'}
          </div>
          {isDropdownOpen && (
            <ul className="absolute top-full left-0 right-0 border rounded bg-white max-h-40 overflow-y-auto z-10">
              <li className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => { setSelectedSection(''); setIsDropdownOpen(false); }}>Select Section</li>
              {sections.map((s, i) => (
                <li key={i} className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => { setSelectedSection(JSON.stringify(s)); setIsDropdownOpen(false); }}>
                  {s.year_level} {s.strand} {s.section_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
            {filteredData.length === 0 ? (
                <p className="text-center">No schedules for Monday</p>
            ) : (
                <ul className="grid grid-cols-1 lg:grid-cols-3 h-1 gap-3 ">
                    {filteredData.map((item) => (
                        <li 
                        key={item.id}
                        className="group odd:bg-gradient-to-b odd:from-yellow-50 odd:to-yellow-100
                                  even:bg-gradient-to-b even:from-sky-100 even:to-sky-200
                                  text-[clamp(12px,2vw,20px)] 
                                  p-4 lg:flex lg:flex-col justify-between items-center h-full shadow-md rounded-md
                                  grid grid-cols-[3px_1fr] gap-2 " 
                        >
                          <p className='h-full w-full group-odd:bg-yellow-400 group-even:bg-sky-400 rounded-md lg:hidden' />
                          <span className="flex flex-col gap-2 text-center cursor-auto" >
                            <p className={`${poppins.className} font-black `}
                            >
                              {item.sections?.year_level + " " + item.sections?.strand + " " + item.sections?.section_name || "-"}
                            </p>
                            
                            <p className={`${poppins.className}
                                `}> {item.subjects?.subject_title || "-"}</p>
                            <p className={`${poppins.className} bg-cyan-50 w-full px-2 rounded`}> 
                              <label className=''>{item.time_slot}</label>
                            </p>
                          </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
  )
}

