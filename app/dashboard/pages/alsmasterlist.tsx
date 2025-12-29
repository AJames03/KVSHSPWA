'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Poppins } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from '@/app/favicon.ico'

const poppins = Poppins({
  weight: ['400', '600', '700', '900'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function ALSMasterList() {
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

  const handleDropdown = (dropdown: string) => {
    setOpenStrand(dropdown === 'strand' ? !openStrand : false)
    setOpenSection(dropdown === 'section' ? !openSection : false)
    setOpenYearLevel(dropdown === 'yearLevel' ? !openYearLevel : false)
  }

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('ALS')
      .select('*')
      .eq('strand', strand)
      .eq('gradeLevel', Number(yearLevel))
      .eq('section', section)
    if (!error) setStudents(data || [])
  }

  const fetchAdviser = async () => {
    const { data } = await supabase
      .from('sections')
      .select('adviser')
      .eq('strand', strand)
      .eq('year_level', Number(yearLevel))
      .eq('section_name', section)
      .single()
    setAdviser(data?.adviser || 'No Adviser Assigned')
  }

  const formatSex = (sex: string) => (sex?.toLowerCase().startsWith('m') ? 'Male' : 'Female')
  const formatName = (s: any) => `${s.lname}${s.ename ? ' ' + s.ename : ''}, ${s.fname} ${s.mname || ''}`

  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase()
    return formatName(student).toLowerCase().includes(term) || student.lrn?.includes(term)
  }).sort((a, b) => {
    const aVal = sortColumn === 'name' ? formatName(a) : a.sex
    const bVal = sortColumn === 'name' ? formatName(b) : b.sex
    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })

  useEffect(() => {
    fetchAdviser()
    fetchStudents()
  }, [strand, section, yearLevel])

  return (
    <div className={`${poppins.className} flex flex-col h-full w-full max-w-7xl mx-auto gap-4 p-2 lg:p-6`}>
      
      {/* 🔹 Filter Section */}
      {/* 🔹 HERO / FILTER SECTION */}
{/* Nagdagdag tayo ng 'z-50' para masiguradong nasa ibabaw ito ng listahan ng mga estudyante */}
<section className="relative z-50 bg-white/40 backdrop-blur-xl p-6 lg:p-8 rounded-[2.5rem] border border-white/60 shadow-2xl shadow-blue-200/40">
  
  {/* Light Effect Background */}
  <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-400/10 blur-[100px] rounded-full pointer-events-none"></div>
  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/10 blur-[100px] rounded-full pointer-events-none"></div>

  <div className="relative flex flex-col gap-6">
    
    {/* Header Part */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-200">
            <i className="bi bi-people-fill text-xl"></i>
          </div>
          <h1 className="text-2xl lg:text-4xl font-black text-slate-800 tracking-tight leading-none">
            ALS Master List
          </h1>
        </div>
        <div className="flex items-center gap-2 px-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-xs lg:text-sm font-bold text-slate-500 uppercase tracking-wider">
            Adviser: <span className="text-sky-600">{adviser}</span>
          </p>
        </div>
      </div>

      {/* Quick Badge para sa Mobile/Desktop */}
      <div className="hidden lg:block">
        <div className="bg-sky-100/50 border border-sky-200 px-4 py-2 rounded-2xl">
          <p className="text-[10px] font-black text-sky-600 uppercase">Registered Students</p>
          <p className="text-xl font-black text-sky-700">{filteredStudents.length}</p>
        </div>
      </div>
    </div>

    {/* Controls Part (Dropdowns & Search) */}
    {/* Tinanggal ang 'overflow-hidden' dito para hindi maputol ang menu */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white/50 p-3 rounded-[2rem] border border-white/80 shadow-inner relative">
      
      {/* Dropdowns Group */}
      <div className="lg:col-span-5 flex flex-wrap md:flex-nowrap gap-2">
        <FilterDropdown 
          label={strand} 
          options={optionStrand} 
          isOpen={openStrand} 
          toggle={() => handleDropdown('strand')} 
          onSelect={(val: string) => { setStrand(val); setOpenStrand(false); }} 
        />
        <FilterDropdown 
          label={section} 
          options={optionSection} 
          isOpen={openSection} 
          toggle={() => handleDropdown('section')} 
          onSelect={(val: string) => { setSection(val); setOpenSection(false); }} 
        />
        <FilterDropdown 
          label={yearLevel} 
          options={optionYearLevel} 
          isOpen={openYearLevel} 
          toggle={() => handleDropdown('yearLevel')} 
          onSelect={(val: string) => { setYearLevel(val); setOpenYearLevel(false); }} 
        />
      </div>

      {/* Search Bar Group */}
      <div className="lg:col-span-7 relative group">
        <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors"></i>
        <input 
          type="text" 
          placeholder="Search LRN or Student Name..." 
          className="w-full bg-white border border-slate-100 pl-12 pr-4 py-3.5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400 transition-all text-sm font-medium shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>

  </div>
</section>

      {/* 🔹 Table Section */}
      <section className="flex-1 bg-white/70 backdrop-blur-md rounded-[1rem] border border-white overflow-hidden shadow-2xl flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                <th className="p-4 text-xs lg:text-sm font-bold uppercase tracking-wider cursor-pointer" onClick={() => {setSortColumn('name'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}}>
                  Student Name <i className={`bi bi-arrow-${sortColumn === 'name' ? (sortDirection === 'asc' ? 'up' : 'down') : 'down-up'} ml-1`}></i>
                </th>
                <th className="p-4 text-xs lg:text-sm font-bold uppercase tracking-wider hidden md:table-cell">LRN</th>
                <th className="p-4 text-xs lg:text-sm font-bold uppercase tracking-wider">Gender</th>
                <th className="p-4 text-center"><i className="bi bi-three-dots-vertical"></i></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredStudents.map((student, index) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={index} 
                    className="hover:bg-sky-50/50 transition-colors cursor-pointer group"
                    onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}
                  >
                    <td className="p-4">
                      <p className="font-bold text-slate-700 text-sm lg:text-base group-hover:text-sky-600 transition-colors">{formatName(student)}</p>
                      <p className="text-[10px] md:hidden text-slate-400">{student.lrn}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600 hidden md:table-cell font-mono">{student.lrn}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${student.sex?.toLowerCase().startsWith('m') ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                        {formatSex(student.sex)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="w-8 h-8 rounded-full hover:bg-white shadow-sm transition-all text-slate-400 hover:text-sky-500">
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <i className="bi bi-inbox text-5xl mb-4 opacity-20"></i>
              <p>No students found in this section.</p>
            </div>
          )}
        </div>
      </section>

      {/* 🔹 Student Modal (Drawer Style for Mobile) */}
      <AnimatePresence>
        {isModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="relative bg-white w-full lg:max-w-2xl h-[85vh] lg:h-auto lg:max-h-[90vh] rounded-t-[1rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                    <img src={Logo.src} className="w-10 h-10 object-contain" alt="logo" />
                    <div>
                        <h2 className="font-bold text-slate-800 leading-none">Student Profile</h2>
                        <p className="text-[10px] text-slate-400 uppercase mt-1 tracking-widest">ALS Learner Information</p>
                    </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard label="Full Name" value={formatName(selectedStudent)} icon="person-vcard" />
                  <InfoCard label="LRN" value={selectedStudent.lrn} icon="fingerprint" />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoCard label="Gender" value={formatSex(selectedStudent.sex)} />
                    <InfoCard label="Age" value={selectedStudent.age} />
                  </div>
                  <InfoCard label="Birthdate" value={selectedStudent.bday} icon="calendar-event" />
                  <div className="md:col-span-2">
                    <InfoCard label="Address" value={`${selectedStudent.houseNumber || ''} ${selectedStudent.streetName || ''} ${selectedStudent.barangay}, ${selectedStudent.municipality}, ${selectedStudent.province}`} icon="geo-alt" />
                  </div>
                </div>

                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                    <h4 className="text-xs font-bold text-sky-700 uppercase mb-3">Parent / Guardian Information</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Father:</span>
                            <span className="font-semibold text-slate-700">{selectedStudent.fatherFN} {selectedStudent.fatherLN}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Mother:</span>
                            <span className="font-semibold text-slate-700">{selectedStudent.motherFN} {selectedStudent.motherLN}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-sky-200">
                            <span className="text-slate-500">Emergency Contact:</span>
                            <span className="font-bold text-sky-600">{selectedStudent.guardianCN || 'N/A'}</span>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 🔹 Reusable Components
function FilterDropdown({ label, options, isOpen, toggle, onSelect }: any) {
  return (
    <div className="relative">
      <button onClick={toggle} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-2 shadow-sm hover:border-sky-400 transition-all">
        {label} <i className={`bi bi-chevron-down text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full mt-2 w-32 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
            {options.map((opt: string) => (
              <div key={opt} onClick={() => onSelect(opt)} className="px-4 py-3 text-sm hover:bg-sky-500 hover:text-white cursor-pointer transition-colors font-semibold">
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InfoCard({ label, value, icon }: { label: string, value: string, icon?: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-sky-200 transition-all">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
        {icon && <i className={`bi bi-${icon} text-sky-500`}></i>} {label}
      </p>
      <p className="text-sm lg:text-base font-bold text-slate-700">{value || '---'}</p>
    </div>
  )
}