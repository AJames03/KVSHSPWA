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

export default function MasterList() {
  const [openStrand, setOpenStrand] = useState(false)
  const [openSection, setOpenSection] = useState(false)
  const [openYearLevel, setOpenYearLevel] = useState(false)

  const [strand, setStrand] = useState('STEM')
  const [section, setSection] = useState('A')
  const [yearLevel, setYearLevel] = useState('11')
  const [adviser, setAdviser] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [sortColumn, setSortColumn] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const optionStrand = ['STEM', 'ABM', 'HUMSS', 'TVL-ICT']
  const optionSection = ['A', 'B', 'C', 'D', 'E']
  const optionYearLevel = ['11', '12']

  const handleDropdown = (dropdown: string) => {
    setOpenStrand(dropdown === 'strand' ? !openStrand : false)
    setOpenSection(dropdown === 'section' ? !openSection : false)
    setOpenYearLevel(dropdown === 'yearLevel' ? !openYearLevel : false)
  }

  const fetchStudents = async () => {
    if (!strand || !section || !yearLevel) return
    const { data, error } = await supabase
      .from('NewStudents')
      .select('*')
      .eq('strand', strand)
      .eq('gradeLevel', Number(yearLevel))
      .eq('section', section)
    if (!error) setStudents(data || [])
  }

  const fetchAdviser = async () => {
    if (!strand || !section || !yearLevel) return
    const { data } = await supabase
      .from('sections')
      .select('adviser')
      .eq('strand', strand)
      .eq('year_level', Number(yearLevel))
      .eq('section_name', section)
      .single()
    setAdviser(data?.adviser || 'No Adviser Assigned')
  }

  useEffect(() => {
    fetchAdviser()
    fetchStudents()
  }, [strand, section, yearLevel])

  const formatName = (s: any) => `${s.lname}${s.ename ? ' ' + s.ename : ''}, ${s.fname} ${s.mname || ''}`
  const formatSex = (sex: string) => sex?.toLowerCase().startsWith('m') ? 'Male' : 'Female'

  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase()
    return formatName(student).toLowerCase().includes(term) || student.lrn?.includes(term)
  }).sort((a, b) => {
    const aVal = sortColumn === 'name' ? formatName(a) : a.sex
    const bVal = sortColumn === 'name' ? formatName(b) : b.sex
    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })

  return (
    <div className={`${poppins.className} flex flex-col min-h-screen w-full bg-[#f8fafc] p-4 lg:p-8 gap-6 text-slate-800`}>
      
      {/* 🔹 HEADER / FILTER SECTION */}
      <section className="relative z-50 bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white shadow-xl shadow-blue-100/50">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Master List</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Adviser: <span className="text-sky-600">{adviser}</span>
                </p>
              </div>
            </div>
            
            <div className="relative group w-full md:w-80">
              <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors"></i>
              <input 
                type="text" 
                placeholder="Find a student..." 
                className="w-full bg-white border border-slate-200 pl-12 pr-4 py-3 rounded-2xl outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400 transition-all text-sm font-medium shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <FilterDropdown label={strand} options={optionStrand} isOpen={openStrand} toggle={() => handleDropdown('strand')} onSelect={setStrand} />
            <FilterDropdown label={section} options={optionSection} isOpen={openSection} toggle={() => handleDropdown('section')} onSelect={setSection} />
            <FilterDropdown label={yearLevel} options={optionYearLevel} isOpen={openYearLevel} toggle={() => handleDropdown('yearLevel')} onSelect={setYearLevel} />
          </div>
        </div>
      </section>

      {/* 🔹 TABLE SECTION */}
      <section className="relative z-10 bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white shadow-2xl overflow-hidden flex flex-col flex-1">
        <div className="overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-xs font-bold uppercase text-slate-400 tracking-widest cursor-pointer hover:text-sky-600 transition-colors" onClick={() => {setSortColumn('name'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}}>
                  Student Name <i className="bi bi-arrow-down-up ml-1 opacity-50"></i>
                </th>
                <th className="p-5 text-xs font-bold uppercase text-slate-400 tracking-widest">Gender</th>
                <th className="p-5 text-center text-xs font-bold uppercase text-slate-400 tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                <tr key={index} className="group hover:bg-sky-50/50 transition-colors">
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 group-hover:text-sky-700 transition-colors">{formatName(student)}</span>
                      <span className="text-[11px] font-mono text-slate-400">{student.lrn}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm font-medium text-slate-600">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${student.sex?.toLowerCase().startsWith('m') ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                      {formatSex(student.sex)}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}
                      className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                    >
                      <i className="bi bi-eye-fill"></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <i className="bi bi-inbox text-6xl"></i>
                      <p className="mt-2 font-bold italic">No students found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 🔹 MODERN MODAL */}
      <AnimatePresence>
        {isModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-[1rem] shadow-2xl overflow-hidden flex flex-col">
              
              <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <img src={Logo.src} className="w-10 h-10" alt="logo" />
                  <div>
                    <h2 className="font-black text-slate-800 leading-none">Student Profile</h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Information System</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Full Name" value={formatName(selectedStudent)} icon="person-badge" primary />
                  <InfoItem label="LRN" value={selectedStudent.lrn} icon="fingerprint" />
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Gender" value={formatSex(selectedStudent.sex)} />
                    <InfoItem label="Age" value={selectedStudent.age} />
                  </div>
                  <InfoItem label="Birthdate" value={selectedStudent.bday} icon="calendar3" />
                  <div className="md:col-span-2">
                    <InfoItem label="Address" value={`${selectedStudent.houseNumber || ''} ${selectedStudent.streetName || ''} ${selectedStudent.barangay}, ${selectedStudent.municipality}, ${selectedStudent.province}`} icon="geo-alt" />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Guardian Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase">Father</p>
                      <p className="font-bold text-slate-700">{selectedStudent.fatherFN} {selectedStudent.fatherLN}</p>
                      <p className="text-xs text-sky-600 font-medium">{selectedStudent.fatherCN || 'No contact'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase">Mother</p>
                      <p className="font-bold text-slate-700">{selectedStudent.motherFN} {selectedStudent.motherLN}</p>
                      <p className="text-xs text-sky-600 font-medium">{selectedStudent.motherCN || 'No contact'}</p>
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

function FilterDropdown({ label, options, isOpen, toggle, onSelect }: any) {
  return (
    <div className="relative">
      <button onClick={toggle} className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 flex items-center gap-3 shadow-sm hover:border-sky-400 hover:text-sky-600 transition-all">
        {label || 'Select'} <i className={`bi bi-chevron-down text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] overflow-hidden">
            {options.map((opt: string) => (
              <div key={opt} onClick={() => onSelect(opt)} className="px-5 py-3 text-sm font-semibold hover:bg-sky-500 hover:text-white cursor-pointer transition-colors">
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InfoItem({ label, value, icon, primary }: any) {
  return (
    <div className={`p-4 rounded-2xl border transition-all ${primary ? 'bg-sky-50/50 border-sky-100' : 'bg-white border-slate-100'}`}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-1">
        {icon && <i className={`bi bi-${icon} text-sky-500`}></i>} {label}
      </p>
      <p className={`text-sm lg:text-base font-bold ${primary ? 'text-sky-900' : 'text-slate-700'}`}>{value || '---'}</p>
    </div>
  )
}