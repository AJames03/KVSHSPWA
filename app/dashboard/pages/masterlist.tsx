'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})


export default function masterlist() {
  const [openStrand, setOpenStrand] = useState(false)
  const [openSection, setOpenSection] = useState(false)
  const [openYearLevel, setOpenYearLevel] = useState(false)

  const [strand, setStrand] = useState('')
  const [section, setSection] = useState('')
  const [yearLevel, setYearLevel] = useState('')
  const [adviser, setAdviser] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const optionStrand: string[] = ['STEM', 'ABM', 'HUMSS', 'TVL-ICT']
  const optionSection: string[] = ['A', 'B', 'C', 'D', 'E']
  const optionYearLevel: string[] = ['11', '12']

  // Function to toggle dropdown and close others
  const handleDropdown = (dropdown: string) => {
    if (dropdown === 'strand') {
      setOpenStrand(!openStrand)
      setOpenSection(false)
      setOpenYearLevel(false)
    } else if (dropdown === 'section') {
      setOpenSection(!openSection)
      setOpenStrand(false)
      setOpenYearLevel(false)
    } else if (dropdown === 'yearLevel') {
      setOpenYearLevel(!openYearLevel)
      setOpenStrand(false)
      setOpenSection(false)
    }
  }

  const closeDropdown = () => {
    setOpenStrand(false)
    setOpenSection(false)
    setOpenYearLevel(false)
  }

  const handleStrand = (value: string) => {
    setStrand(value)
    setOpenStrand(false)
  }

  const handleSection = (value: string) => {
    setSection(value)
    setOpenSection(false)
  }

  const handleYearLevel = (value: string) => {
    setYearLevel(value)
    setOpenYearLevel(false)
  }

  const fetchStudents = async () =>{
    if(!strand || !section || !yearLevel) return

    console.log('Fetching students with:', { strand, section, yearLevel })

    const { data, error } = await supabase
      .from('NewStudents')
      .select('fname, mname, lname, ename, sex')
      .eq('strand', strand)
      .eq('gradeLevel', Number(yearLevel))
      .eq('section', section)

    if (error) {
      console.error('Error fetching students:', error)
      setStudents([])
    } else {
      setStudents(data || [])
    }
  }

  const fetchAdviser = async () => {
    if (!strand || !section || !yearLevel) return

    console.log('Fetching adviser with:', { strand, section, yearLevel })

    const { data, error } = await supabase
      .from('sections')
      .select('adviser')
      .eq('strand', strand)
      .eq('year_level', Number(yearLevel))
      .eq('section_name', section)

    if (error) {
      console.error('Error fetching adviser:', error)
      setAdviser('Not found')
    } else if (data && data.length > 0) {
      setAdviser(data[0].adviser || 'Not assigned yet')
    } else {
      setAdviser('Not found')
    }

  }

  const formatSex = (sex: string | null | undefined) => {
    if (!sex) return 'Unknown'
    if (sex.toLowerCase() === 'm' || sex.toLowerCase() === 'male') return 'Male'
    if (sex.toLowerCase() === 'f' || sex.toLowerCase() === 'female') return 'Female'
    return sex
  }

  const filteredStudents = students.filter(student => {
    const fullName = `${student.fname} ${student.mname} ${student.lname} ${student.ename}`.toLowerCase();
    const gender = formatSex(student.sex).toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || gender.startsWith(term);
  })

  useEffect(() => {
    fetchAdviser()
    fetchStudents()
  }, [strand, section, yearLevel])

  return (
    <div className="flex flex-col h-full w-full gap-2 text-black">
      <div className="flex flex-col gap-2 p-3 bg-white text-black shadow-md">
        <label
          className={`${poppins.className} lg:text-lg font-black p-2 lg:bg-white w-full border-b-2`}
        >
          Master List
        </label>
      </div>

      <div className="flex flex-col gap-2 p-3 bg-white text-black shadow-md h-full" >
        <div className="flex flex-row gap-2 justify-center lg:justify-start">
          {/* Strand Dropdown */}
          <div className="relative text-[12px] lg:text-[14px]">
            <button
              onClick={() => handleDropdown('strand')}
              className={`p-2 bg-gray-100 w-24 lg:w-40 text-left shadow-md flex justify-between`}
            >
              {strand || 'Strand'}
              <i className={`bi bi-chevron-down transition-transform duration-200 ${openStrand ? "rotate-180" : ""}`}></i>
            </button>
            {openStrand && (
              <div className="absolute bg-white shadow-[0px_8px_16px_0px_rgba(0,0,0,0.2)] w-24 lg:w-40 z-50 dropdown-animation">
                {optionStrand.map((optStrand) => (
                  <div
                    key={optStrand}
                    onClick={() => handleStrand(optStrand)}
                    className={`px-4 py-2 cursor-pointer
                      ${strand === optStrand ? "bg-blue-500 text-white" : "hover:bg-gray-200 hover:text-black"}
                      `}
                  >
                    {optStrand}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section Dropdown */}
          <div className="relative text-[12px] lg:text-[14px]">
            <button
              onClick={() => handleDropdown('section')}
              className="p-2 bg-gray-100 shadow-md w-24 lg:w-40 text-left flex justify-between"
            >
              {section || 'Section'}
              <i className={`bi bi-chevron-down transition-transform duration-200 ${openSection ? "rotate-180" : ""}`}></i>
            </button>
            {openSection && (
              <div className="absolute bg-white shadow-[0px_8px_16px_0px_rgba(0,0,0,0.2)] w-24 lg:w-40 z-50 dropdown-animation ">
                {optionSection.map((optSection) => (
                  <div
                    key={optSection}
                    onClick={() => handleSection(optSection)}
                    className={`px-4 py-2 cursor-pointer
                      ${section === optSection ? "bg-blue-500 text-white" : "hover:bg-gray-200 hover:text-black"}
                      `}
                  >
                    {optSection}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Year Level Dropdown */}
          <div className="relative text-[12px] lg:text-[14px]">
            <button
              onClick={() => handleDropdown('yearLevel')}
              className={`p-2 bg-gray-100 shadow-md w-24 lg:w-40 text-left flex justify-between`}
            >
              {yearLevel || 'Year Level'}
              <i className={`bi bi-chevron-down transition-transform duration-200 ${openYearLevel ? "rotate-180" : ""}`}></i>
            </button>
            {openYearLevel && (
              <div className="absolute bg-white shadow-[0px_8px_16px_0px_rgba(0,0,0,0.2)] w-24 lg:w-40 z-50 dropdown-animation">
                {optionYearLevel.map((optYearLevel) => (
                  <div
                    key={optYearLevel}
                    onClick={() => handleYearLevel(optYearLevel)}
                    className={`px-4 py-2 cursor-pointer
                      ${yearLevel === optYearLevel ? "bg-blue-500 text-white" : "hover:bg-gray-200 hover:text-black"}
                      `}
                  >
                    {optYearLevel}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Display Selected Info */}
        <div className="flex flex-col justify-between h-full " onClick={closeDropdown}>
          <span className='w-full flex flex-col lg:flex-row justify-between items-center gap-5 
            lg:border-b lg:border-gray-400 pb-5 lg:gap-0 mt-4'>
            <p className={`${poppins.className} text-lg`}>Adviser: {adviser || 'None'}</p>
            <div className='flex flex-row justify-center items-center rounded-4xl p-1 gap-2 bg-gray-50
                border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all duration-200'>
              <i className="bi bi-search text-gray-400 text-center ml-2"></i>
              <input type="text" className='outline-none cursor-auto l-2 mr-2 p-1' placeholder='Find the student...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </span>

          <div className='w-full h-80 overflow-y-auto rounded-md'>
              <table className='w-full border-collapse'>
                  <thead className='sticky top-0 bg-gray-100 z-10'>
                      <tr className='text-white'>
                          <th className='bg-sky-500 px-4 py-2 text-left font-semibold border-r-2 border-gray-200'>Name</th>
                          <th className='bg-sky-500 px-4 py-2 text-left font-semibold'>Gender</th>
                      </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                      <tr key={index} className='hover:bg-gray-50 odd:bg-sky-100 hover:odd:bg-sky-200'>
                        <td className=' px-4 py-2 border-r-2 border-gray-200'>{student.fname} {student.mname} {student.lname} {student.ename}</td>
                        <td className=' px-4 py-2'>{formatSex(student.sex)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td className=' px-4 py-2 text-center' colSpan={2}>{searchTerm ? 'No matching students' : 'No students data'}</td>
                      </tr>
                    )}
                  </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }



