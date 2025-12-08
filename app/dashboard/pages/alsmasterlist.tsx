'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Poppins } from 'next/font/google'
import Image from 'next/image'
import Logo from '@/app/favicon.ico'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})


export default function alsmasterlist() {
  const [openStrand, setOpenStrand] = useState(false)
  const [openSection, setOpenSection] = useState(false)
  const [openYearLevel, setOpenYearLevel] = useState(false)

  const [strand, setStrand] = useState('ABM')
  const [section, setSection] = useState('A')
  const [yearLevel, setYearLevel] = useState('11')
  const [adviser, setAdviser] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [sortColumn, setSortColumn] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const optionStrand: string[] = ['ABM', 'HUMSS', 'TVL-ICT']
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
      .from('ALS')
      .select('lrn, fname, mname, lname, ename, sex, indigenousPeople, fourPS, bday, age, houseNumber, streetName, barangay, municipality, province, fatherLN, fatherFN, fatherCN, motherLN, motherFN, motherCN, guardianLN, guardianFN, guardianCN')
      .eq('strand', strand)
      .eq('gradeLevel', Number(yearLevel))
      .eq('section', section)

    if (error) {
      console.error('Error fetching students:', error)
      setStudents([])
    } else {
      console.log('Fetched students:', data)
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

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const formatName = (student: any) => {
    return `${student.lname}${student.ename ? ', ' + student.ename : ''}, ${student.fname}${student.mname ? ' ' + student.mname : ''}`;
  }

  const filteredStudents = students.filter(student => {
    const fullName = formatName(student).toLowerCase();
    const gender = formatSex(student.sex).toLowerCase();
    const term = searchTerm.toLowerCase();
    return fullName.includes(term) || gender.startsWith(term);
  }).sort((a, b) => {
    let aValue: string, bValue: string;
    if (sortColumn === 'name') {
      aValue = formatName(a).toLowerCase();
      bValue = formatName(b).toLowerCase();
    } else {
      aValue = formatSex(a.sex).toLowerCase();
      bValue = formatSex(b.sex).toLowerCase();
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
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
          ALS Master List
        </label>
      </div>

      <div className="grid grid-cols-1 gap-2 p-3 bg-white text-black shadow-md h-full" >
        <div className="flex flex-row w-full gap-2 justify-center lg:justify-start">
          {/* Strand Dropdown */}
          <div className="relative sm:text-[14px] md:text-[16px] lg:text-[18px]">
            <button
              onClick={() => handleDropdown('strand')}
              className={`p-2 bg-gray-100 w-27 lg:w-40 text-left shadow-md flex justify-between`}
            >
              {strand || 'Strand'}
              <i className={`bi bi-chevron-down transition-transform duration-200 ${openStrand ? "rotate-180" : ""}`}></i>
            </button>
            {openStrand && (
              <div className="absolute bg-white shadow-[0px_8px_16px_0px_rgba(0,0,0,0.2)] w-27 lg:w-40 z-50 dropdown-animation">
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
          <div className="relative sm:text-[14px] md:text-[16px] lg:text-[18px]">
            <button
              onClick={() => handleDropdown('section')}
              className="p-2 bg-gray-100 shadow-md w-27 lg:w-40 text-left flex justify-between"
            >
              {section || 'Section'}
              <i className={`bi bi-chevron-down transition-transform duration-200 ${openSection ? "rotate-180" : ""}`}></i>
            </button>
            {openSection && (
              <div className="absolute bg-white shadow-[0px_8px_16px_0px_rgba(0,0,0,0.2)] w-27 lg:w-40 z-50 dropdown-animation ">
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
          <div className="relative sm:text-[14px] md:text-[16px] lg:text-[18px]">
            <button
              onClick={() => handleDropdown('yearLevel')}
              className={`p-2 bg-gray-100 shadow-md w-27 lg:w-40 text-left flex justify-between`}
            >
              {yearLevel || 'Year Level'}
              <i className={`bi bi-chevron-down transition-transform duration-200 ${openYearLevel ? "rotate-180" : ""}`}></i>
            </button>
            {openYearLevel && (
              <div className="absolute bg-white shadow-[0px_8px_16px_0px_rgba(0,0,0,0.2)] w-27 lg:w-40 z-50 dropdown-animation">
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
        <div className="flex flex-col w-full justify-between h-full " onClick={closeDropdown}>
          <span className='w-full flex flex-col lg:flex-row justify-between items-center gap-5 
            lg:border-b lg:border-gray-400 pb-5 lg:gap-0 mt-4'>
            <p className={`${poppins.className} text-lg`}>Adviser: {adviser || 'None'}</p>
            <div className='flex flex-row justify-center items-center rounded-4xl p-1 gap-2 bg-gray-50
                border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all duration-200'>
              <i className="bi bi-search text-gray-400 text-center ml-2"></i>
              <input type="text" className='outline-none cursor-auto l-2 mr-2 p-1' placeholder='Find the student...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </span>
        </div>

        <div className='grid grid-rows-4 top-0 w-full h-full lg:static lg:h-80 overflow-y-auto'>
              <table className='w-full'>
                  <thead className='sticky -top-1'>
                      <tr className='text-white'>
                          <th className='bg-sky-500 px-4 py-2 text-left font-semibold border-r-2 border-gray-200 cursor-pointer' onClick={() => handleSort('name')}>
                            Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className='bg-sky-500 px-4 py-2 text-left font-semibold cursor-pointer' onClick={() => handleSort('gender')}>
                            Gender {sortColumn === 'gender' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                      </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                      <tr key={index} className='hover:bg-gray-50 odd:bg-sky-100 hover:odd:bg-sky-200'>
                        <td className=' px-4 py-2 border-r-2 border-gray-200 cursor-pointer' onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}>{formatName(student)}</td>
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

        {/* Modal */}
        {isModalOpen && selectedStudent && (
          <div className="fixed inset-0 p-2 flex flex-col justify-center items-center z-50 gap-3">
            <span className='fixed inset-0 bg-black/80 backdrop-blur-sm flex ' onClick={() => setIsModalOpen(false)}></span>
            <div className=' w-full lg:w-1/2 z-600 flex flex-row justify-end'>
              <span className='flex justify-center items-center w-8 h-8 bg-gradient-to-l from-red-500 to-red-600
                              rounded-md cursor-pointer'
                onClick={() => setIsModalOpen(false)}
              >
                <i className="bi bi-x-lg text-white"></i>
              </span>
            </div>
            <div className="bg-white p-2 h-[70%] lg:h-[90%] lg:w-1/2 w-full z-500 ">
                <div className="p-2 w-full h-full flex flex-col justify-center items-center gap-2">
                  <span className='sticky top-0 w-full flex flex-col bg-white z-501'>
                    <img src={Logo.src} className='w-15 h-15 self-center mb-2' alt="kshslogo" />
                    <h2 className="text-xl font-bold mb-4 border-b">Student Information</h2>
                  </span>
                  <div className='w-full flex flex-col gap-1 overflow-auto'>
                    <p className='flex flex-col border-2 p-2 rounded-md border-gray-500  hover:border-blue-500 hover:border-3 hover:border-3'>
                      <strong className='text-[12px]'>LRN:</strong>
                      <label className='text-[16px]'>{selectedStudent.lrn}</label>
                    </p>
                    
                    <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                      <strong className='text-[12px]'>Full Name:</strong>
                      <label className='text-[16px]'>
                        {formatName(selectedStudent)}
                      </label>
                    </p>
                    
                    <span className='grid grid-cols-3 gap-1'>
                      <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                        <strong className='text-[12px]'>Gender:</strong> 
                        <label className='text-[16px]'>{formatSex(selectedStudent.sex)}</label>
                      </p>
                      <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                        <strong className='text-[12px]'>Birthdate:</strong>
                        <label className='text-[16px]'>{selectedStudent.bday}</label>
                      </p>
                      <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                        <strong className='text-[12px]'>Age:</strong>
                        <label className='text-[16px]'>{selectedStudent.age}</label>
                      </p>
                    </span>

                    
                    <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                      <strong className='text-[12px]'>Address:</strong>
                      <label className='text-[16px]'>
                        {selectedStudent.houseNumber} {' '} 
                        {selectedStudent.streetName} {' '} 
                        {selectedStudent.barangay} {' '} 
                        {selectedStudent.municipality} {' '} 
                        {selectedStudent.province} {' '} 
                      </label>
                    </p>
                    
                    <span className='grid grid-cols-2 gap-1'>
                      <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                        <strong className='text-[12px]'>Indigenous People:</strong> 
                        <label className='text-[16px]'>
                          {selectedStudent.indigenousPeople === 'No' ? '-' : selectedStudent.indigenousPeople }
                        </label>
                      </p>
                      <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                        <strong className='text-[12px]'>4Ps Member:</strong> 
                        <label className='text-[16px]'>
                          {selectedStudent.fourPS === 'No' ? '-' : 'Yes'}
                        </label>
                      </p>
                    </span>
                    
                    <span className='grid grid-cols-1 gap-1'>
                      <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                        <strong className='text-[12px]'>Father&apos;s Name:</strong>
                        <label className='text-[16px]'>{selectedStudent.fatherFN} {' '} {selectedStudent.fatherLN}</label>
                      </p>
                      <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                        <strong className='text-[12px]'>Father&apos;s Contact:</strong>
                        <label className='text-[16px]'>{selectedStudent.fatherCN === '' ? '-' : selectedStudent.fatherCN}</label>
                      </p>
                    </span>
                    
                    <span className='grid grid-cols-1 gap-1'>
                      <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                        <strong className='text-[12px]'>Mother&apos;s Name:</strong>
                        <label className='text-[16px]'>{selectedStudent.motherFN} {' '} {selectedStudent.motherLN}</label>
                      </p>
                      <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                        <strong className='text-[12px]'>Mother&apos;s Contact:</strong>
                        <label className='text-[16px]'>{selectedStudent.motherCN === '' ? '-' : selectedStudent.motherCN}</label>
                      </p>
                    </span>
                    <span className='grid grid-cols-1 gap-1'>
                      <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                        <strong className='text-[12px]'>Guardian&apos;s Name:</strong>
                        <label className='text-[16px]'>{selectedStudent.guardianFN} {' '} {selectedStudent.guardianLN}</label>
                      </p>
                      <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                        <strong className='text-[12px]'>Guardian&apos;s Contact:</strong>
                        <label className='text-[16px]'>{selectedStudent.guardianCN === '' ? '-' : selectedStudent.guardianCN}</label>
                      </p>
                    </span>
                    <p className='flex flex-col border-2 p-2 rounded-md border-gray-500 hover:border-blue-500 hover:border-3'>
                      <strong className='text-[12px]'>Leaner&apos;s under the Special Needs Education Program:</strong>
                      <label className='text-[16px]'>{selectedStudent.SNEP === 'None' ? '-' : selectedStudent.SNEP}</label>
                    </p>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }



