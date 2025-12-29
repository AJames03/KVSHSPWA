'use client'
import { useState, useEffect } from 'react'
import { Poppins } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import Semester from '@/app/dashboard/pages/gradingpage/semester'
import Section from '@/app/dashboard/pages/gradingpage/section'
import Subject from '@/app/dashboard/pages/gradingpage/subject'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
})

interface Student {
  lrn: string
  lname: string
  fname: string
  mname: string | null
  ename: string | null
}

export default function Grading() {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState<any>(null)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Record<string, any>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const calculateAvg = (g1: any, g2: any) => {
    if (!g1 || !g2) return '-'
    return ((Number(g1) + Number(g2)) / 2).toFixed(0)
  }

  const calculateFinalAvg = (lrn: string) => {
    const s = grades[lrn]
    if (!s?.first_grading || !s?.second_grading || !s?.third_grading || !s?.fourth_grading) return '-'
    const final = (Number(s.first_grading) + Number(s.second_grading) + Number(s.third_grading) + Number(s.fourth_grading)) / 4
    return final.toFixed(0)
  }

  const getStatus = (finalAvg: string) => {
    if (finalAvg === '-') return { label: 'PENDING', class: 'bg-slate-100 text-slate-400' }
    return Number(finalAvg) >= 75 
      ? { label: 'PASSED', class: 'bg-emerald-100 text-emerald-600' }
      : { label: 'FAILED', class: 'bg-rose-100 text-rose-600' }
  }

  useEffect(() => {
    if (!selectedSection) { setStudents([]); return; }
    const fetchStudents = async () => {
      const { data: gradeData } = await supabase.from('grades').select('student_lrn').eq('section_id', selectedSection.id);
      const studentLRNs = gradeData?.map(item => item.student_lrn) || [];
      const { data: studentData } = await supabase.from('NewStudents').select('lrn, lname, fname, mname, ename').in('lrn', studentLRNs);
      setStudents(studentData || []);
    }
    fetchStudents();
  }, [selectedSection]);

  const fetchGrades = async () => {
    if (!selectedSection || !selectedSubject) { setGrades({}); return; }
    const { data } = await supabase.from('grades').select('*').eq('section_id', selectedSection.id).eq('subject_id', selectedSubject.id);
    const gradeMap: Record<string, any> = {};
    data?.forEach(item => { gradeMap[item.student_lrn] = item; });
    setGrades(gradeMap);
  }

  useEffect(() => { fetchGrades(); }, [selectedSection, selectedSubject]);

  // --- APPLIED FIX START ---
  const saveGrades = async () => {
    if (!selectedSection?.id || !selectedSubject?.id) {
      alert("Please select both a Section and a Subject.");
      return;
    }

    setIsSaving(true);
    try {
      const upsertData = Object.entries(grades).map(([lrn, grade]) => ({
        // Using 'id' if it exists in the state. 
        // If it exists, Supabase UPDATES. If it's missing, Supabase INSERTS.
        ...(grade.id ? { id: grade.id } : {}), 
        student_lrn: lrn,
        section_id: selectedSection.id,
        subject_id: selectedSubject.id,
        first_grading: grade.first_grading ? Number(grade.first_grading) : null,
        second_grading: grade.second_grading ? Number(grade.second_grading) : null,
        third_grading: grade.third_grading ? Number(grade.third_grading) : null,
        fourth_grading: grade.fourth_grading ? Number(grade.fourth_grading) : null,
      }));

      if (upsertData.length === 0) {
        setIsSaving(false);
        return;
      }

      // We removed "onConflict" because we are now passing the Primary Key (id)
      const { error } = await supabase
        .from('grades')
        .upsert(upsertData); 

      if (error) {
        console.error("Supabase Error Details:", error);
        throw error;
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await fetchGrades(); // Refresh to get the IDs for any brand new inserts
    } catch (err: any) {
      console.error("Failed to save:", err);
      alert(`Error saving grades: ${err.message || 'Database connection error'}`);
    } finally {
      setIsSaving(false);
    }
  }
  // --- APPLIED FIX END ---

  const filteredStudents = students.filter(s => 
    `${s.fname} ${s.lname} ${s.lrn}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex flex-col h-screen w-full bg-[#F8FAFC] ${poppins.className} relative overflow-hidden`}>
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-[110] flex items-center gap-3 border border-white/10">
            <div className="bg-emerald-500 p-1 rounded-full text-xs">✓</div>
            <p className="text-sm font-bold tracking-tight">Grades updated successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white border-b border-slate-200 p-4 lg:px-8 shadow-sm z-30 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">Class Grading</h1>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Portal Entry System</p>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
             <div className="flex bg-slate-100 p-1 rounded-xl">
                <Semester onSelect={setSelectedSemester} />
                <Section onSelect={setSelectedSection} />
                <Subject selectedSection={selectedSection} selectedSemester={selectedSemester} onSelect={setSelectedSubject} />
             </div>
             <div className="relative">
                <input
                  type="text" placeholder="Search student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-64 bg-slate-100 border-none py-2.5 pl-10 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-40"> 
        <div className="max-w-7xl mx-auto">
          {/* MOBILE VIEW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
            {filteredStudents.map((student) => {
              const finalAvg = calculateFinalAvg(student.lrn);
              const status = getStatus(finalAvg);
              return (
                <div key={student.lrn} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 uppercase leading-none">{student.lname}, {student.fname}</h3>
                      <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest">LRN: {student.lrn}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black ${status.class}`}>{status.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['first_grading', 'second_grading', 'third_grading', 'fourth_grading'].map((q, i) => (
                      <div key={q} className="bg-slate-50 p-2 rounded-xl">
                        <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">{i + 1}st Quarter</label>
                        <input 
                          type="number"
                          className="w-full bg-transparent font-bold text-slate-700 outline-none"
                          value={grades[student.lrn]?.[q] || ''}
                          onChange={(e) => setGrades(prev => ({ ...prev, [student.lrn]: { ...prev[student.lrn], [q]: e.target.value } }))}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-900 p-2 rounded-xl text-center">
                      <p className="text-[7px] text-slate-400 uppercase">Sem 1</p>
                      <p className="text-white text-xs font-bold">{calculateAvg(grades[student.lrn]?.first_grading, grades[student.lrn]?.second_grading)}</p>
                    </div>
                    <div className="flex-1 bg-slate-800 p-2 rounded-xl text-center">
                      <p className="text-[7px] text-slate-400 uppercase">Sem 2</p>
                      <p className="text-white text-xs font-bold">{calculateAvg(grades[student.lrn]?.third_grading, grades[student.lrn]?.fourth_grading)}</p>
                    </div>
                    <div className="flex-1 bg-blue-600 p-2 rounded-xl text-center">
                      <p className="text-[7px] text-blue-200 uppercase">Final</p>
                      <p className="text-white text-xs font-bold">{finalAvg}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* DESKTOP VIEW */}
          <div className="hidden lg:block bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest sticky left-0 bg-slate-900 z-10">Student Information</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Q1</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Q2</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center bg-slate-800">Sem 1</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Q3</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Q4</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center bg-slate-800">Sem 2</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center bg-blue-900">Final Avg</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const finalAvg = calculateFinalAvg(student.lrn);
                    const status = getStatus(finalAvg);
                    return (
                      <tr key={student.lrn} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="p-4 sticky left-0 bg-white group-hover:bg-blue-50 transition-colors">
                          <p className="font-bold text-slate-700 uppercase text-sm leading-none">{student.lname}, {student.fname}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic">LRN: {student.lrn}</p>
                        </td>
                        {['first_grading', 'second_grading'].map((q) => (
                          <td key={q} className="p-2 text-center">
                            <input type="number" className="w-14 p-2 bg-slate-50 rounded-lg text-center font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={grades[student.lrn]?.[q] || ''} onChange={(e) => setGrades(prev => ({ ...prev, [student.lrn]: { ...prev[student.lrn], [q]: e.target.value } }))} />
                          </td>
                        ))}
                        <td className="p-4 text-center font-bold text-slate-600 bg-slate-50/50">{calculateAvg(grades[student.lrn]?.first_grading, grades[student.lrn]?.second_grading)}</td>
                        {['third_grading', 'fourth_grading'].map((q) => (
                          <td key={q} className="p-2 text-center">
                            <input type="number" className="w-14 p-2 bg-slate-50 rounded-lg text-center font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" value={grades[student.lrn]?.[q] || ''} onChange={(e) => setGrades(prev => ({ ...prev, [student.lrn]: { ...prev[student.lrn], [q]: e.target.value } }))} />
                          </td>
                        ))}
                        <td className="p-4 text-center font-bold text-slate-600 bg-slate-50/50">{calculateAvg(grades[student.lrn]?.third_grading, grades[student.lrn]?.fourth_grading)}</td>
                        <td className="p-4 text-center font-black text-blue-600 bg-blue-50/30">{finalAvg}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black inline-block min-w-[70px] ${status.class}`}>{status.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none p-6 pb-[safe-area-inset-bottom] mb-20">
        <div className="max-w-7xl mx-auto flex justify-end">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={saveGrades}
            disabled={isSaving || !selectedSubject}
            className={`pointer-events-auto flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all ${isSaving || !selectedSubject ? 'bg-slate-300 text-slate-500' : 'bg-slate-900 text-white active:bg-blue-600 ring-4 ring-white shadow-black/20'}`}
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            <span>{isSaving ? 'Saving...' : 'Commit Changes'}</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}