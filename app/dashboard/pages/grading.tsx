'use client'
import { useState, useEffect } from 'react'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'
import Semester from '@/app/dashboard/pages/gradingpage/semester'
import Section from '@/app/dashboard/pages/gradingpage/section'
import Subject from '@/app/dashboard/pages/gradingpage/subject'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
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

  const [grades, setGrades] = useState<Record<string, { first_grading?: number; second_grading?: number; third_grading?: number; fourth_grading?: number; first_sem_subject_average?: number; first_sem_subject_remarks?: string; second_sem_subject_average?: number; second_sem_subject_remarks?: string }>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!selectedSection) {
      setStudents([])
      return
    }

    const fetchStudents = async () => {
      const { data: gradeData, error: gradeError } = await supabase
        .from('grades')
        .select('student_lrn')
        .eq('section_id', selectedSection.id)

      if (gradeError) {
        console.error('Error fetching students:', gradeError)
        return
      }

      const studentLRNs = gradeData?.map(item => item.student_lrn) || []

      const { data: studentData, error: studentError } = await supabase
        .from('NewStudents')
        .select('lrn, lname, fname, mname, ename')
        .in('lrn', studentLRNs)

      if (studentError) {
        console.error('Error fetching students:', studentError)
        return
      }

      setStudents(studentData || [])
    }

    fetchStudents()
  }, [selectedSection])

  const fetchGrades = async () => {
    if (!selectedSection || !selectedSubject) {
      setGrades({})
      return
    }

    const { data, error } = await supabase
      .from('grades')
      .select(`
        student_lrn,
        first_grading,
        second_grading,
        third_grading,
        fourth_grading,
        first_sem_subject_average,
        first_sem_subject_remarks,
        second_sem_subject_average,
        second_sem_subject_remarks
      `)
      .eq('section_id', selectedSection.id)
      .eq('subject_id', selectedSubject.id)

    if (error) {
      console.error('Error fetching grades:', error)
      return
    }

    const gradeMap: Record<string, { first_grading?: number; second_grading?: number; third_grading?: number; fourth_grading?: number; first_sem_subject_average?: number; first_sem_subject_remarks?: string; second_sem_subject_average?: number; second_sem_subject_remarks?: string }> = {}
    data?.forEach(item => {
      gradeMap[item.student_lrn] = {
        first_grading: item.first_grading,
        second_grading: item.second_grading,
        third_grading: item.third_grading,
        fourth_grading: item.fourth_grading,
        first_sem_subject_average: item.first_sem_subject_average,
        first_sem_subject_remarks: item.first_sem_subject_remarks,
        second_sem_subject_average: item.second_sem_subject_average,
        second_sem_subject_remarks: item.second_sem_subject_remarks
      }
    })
    setGrades(gradeMap)
  }

  useEffect(() => {
    fetchGrades()
  }, [selectedSection, selectedSubject])

  const saveGrades = async () => {
    if (!selectedSection || !selectedSubject) {
      alert('Please select section and subject first')
      return
    }

    setIsSaving(true)

    try {
      for (const [lrn, grade] of Object.entries(grades)) {
        // Check if the grade entry exists
        const { data: existing, error: fetchError } = await supabase
          .from('grades')
          .select('*')
          .eq('section_id', selectedSection.id)
          .eq('subject_id', selectedSubject.id)
          .eq('student_lrn', lrn)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching existing grade:', fetchError)
          continue
        }

        if (existing) {
          // Update
          const { error: updateError } = await supabase
            .from('grades')
            .update({
              first_grading: grade.first_grading ?? null,
              second_grading: grade.second_grading ?? null,
              third_grading: grade.third_grading ?? null,
              fourth_grading: grade.fourth_grading ?? null,
            })
            .eq('section_id', selectedSection.id)
            .eq('subject_id', selectedSubject.id)
            .eq('student_lrn', lrn)

          if (updateError) console.error('Error updating grade:', updateError)
        } else {
          // Insert
          const { error: insertError } = await supabase
            .from('grades')
            .insert({
              section_id: selectedSection.id,
              subject_id: selectedSubject.id,
              student_lrn: lrn,
              first_grading: grade.first_grading ?? null,
              second_grading: grade.second_grading ?? null,
              third_grading: grade.third_grading ?? null,
              fourth_grading: grade.fourth_grading ?? null,
            })

          if (insertError) console.error('Error inserting grade:', insertError)
        }
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      await fetchGrades() // Refresh the grades after saving
    } catch (err) {
      console.error(err)
      alert('Error saving grades')
    }

    setIsSaving(false)
  }

  return (
    <div className={`${poppins.className}
      grid lg:grid-rows-[100px_1fr_auto]
      grid-rows-[170px_1fr_auto]
      w-full h-full bg-white p-4
    `}>
      {showSuccess && (
        <div className="fixed 
          top-4 lg:right-4
          flex justify-center items-center gap-2 bg-green-700 
          text-white p-4 rounded shadow-lg z-50"
        >
          <i className="bi bi-check2-circle text-2xl "></i>
          Grades saved successfully
        </div>
      )}
      <div className='
        grid grid-rows-[100px_1fr]
        text-[14px]
        lg:flex lg:flex-row
        lg:mb-4 w-full z-21 items-center justify-between
      '>
        <div className='lg:flex lg:flex-row justify-center items-center 
          grid grid-cols-[110px_110px_110px] 
        '>
          <Semester onSelect={setSelectedSemester} />
          <Section onSelect={setSelectedSection} />
          <Subject selectedSection={selectedSection} selectedSemester={selectedSemester} onSelect={setSelectedSubject} />
        </div>
        <span className='border border-gray-300 bg-gray-100 rounded-full'>
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ml-4 p-2  text-sm outline-none"
          />
        </span>
      </div>

      <div className='p-2 bg-white max-h-[60vh] overflow-auto'>
        <div className='grid 
            grid-cols-[250px_135px_135px_230px_100px_135px_135px_230px_100px]
            lg:grid-cols-[400px_150px_150px_250px_120px_150px_150px_250px_120px] 
            gap-1 text-center text-[clamp(18px,1.5vw,24px)]
            sticky -top-2 z-20
        '>
          <label className='font-semibold bg-blue-500 p-2 text-white lg:sticky lg:-left-2'>Student Name</label>
          <label className='font-semibold bg-blue-500 p-2 text-white'>1st Grading</label>
          <label className='font-semibold bg-blue-500 p-2 text-white'>2nd Grading</label>
          <label className='font-semibold bg-blue-500 p-2 text-white'>1st Semester Average</label>
          <label className='font-semibold bg-blue-500 p-2 text-white'>Remarks</label>
          <label className='font-semibold bg-blue-500 p-2 text-white'>3rd Grading</label>
          <label className='font-semibold bg-blue-500 p-2 text-white'>4th Grading</label>
          <label className='font-semibold bg-blue-500 p-2 text-white'>2nd Semester Average</label>
          <label className='font-semibold bg-blue-500 p-2 text-white'>Remarks</label>
        </div>

        {(() => {
          const filteredStudents = students.filter(student =>
            student.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.mname && student.mname.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.ename && student.ename.toLowerCase().includes(searchTerm.toLowerCase())) ||
            student.lrn.toLowerCase().includes(searchTerm.toLowerCase())
          )
          return filteredStudents.length === 0 ? (
            <p>No students found {searchTerm ? 'matching the search.' : 'for this section.'}</p>
          ) : (
            <ul className='flex flex-col gap-1 '>
              {filteredStudents.map(({ lrn, lname, fname, mname, ename }, index) => (
              <li key={index} className='grid
                grid-cols-[250px_135px_135px_230px_100px_135px_135px_230px_100px]
                lg:grid-cols-[400px_150px_150px_250px_120px_150px_150px_250px_120px]
                gap-1 group'>
                <div className='lg:sticky lg:-left-2 flex flex-col p-2 group-odd:bg-gray-100 group-even:bg-cyan-50'>
                  <span className='text-[clamp(12px,1.5vw,16px)]'>{lrn}</span>
                  <span className='text-[clamp(14px,1.5vw,18px)] font-semibold'>{lname}, {fname} {mname} {ename}</span>
                </div>

                <div className='flex flex-col justify-center p-2 text-[clamp(14px,1.5vw,18px)] group-odd:bg-gray-100 group-even:bg-cyan-50'>
                  <input
                    type='number'
                    className='text-center text-lg'
                    value={grades[lrn]?.first_grading || ''}
                    onChange={(e) =>
                      setGrades(prev => ({ ...prev, [lrn]: { ...prev[lrn], first_grading: Number(e.target.value) } }))
                    }
                  />
                </div>

                <div className='flex flex-col justify-center p-2 group-odd:bg-gray-100 group-even:bg-cyan-50'>
                  <input
                    type='number'
                    className='text-center text-lg'
                    value={grades[lrn]?.second_grading || ''}
                    onChange={(e) =>
                      setGrades(prev => ({ ...prev, [lrn]: { ...prev[lrn], second_grading: Number(e.target.value) } }))
                    }
                  />
                </div>

                <span className='flex items-center justify-center p-2 group-odd:bg-gray-100 group-even:bg-cyan-50'>
                  {grades[lrn]?.first_sem_subject_average || '-'}
                </span>
              <span className={`flex items-center justify-center p-2 group-odd:bg-gray-100 group-even:bg-cyan-50
                ${
                  grades[lrn]?.first_sem_subject_remarks === 'Passed'
                      ? 'text-blue-500 font-semibold'
                      : grades[lrn]?.first_sem_subject_remarks === 'Failed'
                      ? 'text-red-500 font-semibold'
                      : ''
                }
              `}>
                  <p className={`
                    ${
                      grades[lrn]?.first_sem_subject_remarks === 'Passed'
                        ? 'bg-yellow-50 p-2 rounded-md'
                        : grades[lrn]?.first_sem_subject_remarks === 'Failed'
                        ? 'bg-yellow-50 p-2 rounded-md'
                        : ''
                    }
                  `}>
                    {grades[lrn]?.first_sem_subject_remarks || '-'}
                  </p>
                </span>
                <div className='flex flex-col justify-center p-2 group-odd:bg-gray-100 group-even:bg-cyan-50'>
                  <input
                    type='number'
                    className='text-center text-lg'
                    value={grades[lrn]?.third_grading || ''}
                    onChange={(e) =>
                      setGrades(prev => ({ ...prev, [lrn]: { ...prev[lrn], third_grading: Number(e.target.value) } }))
                    }
                  />
                </div>
                <div className='flex flex-col justify-center p-2 group-odd:bg-gray-100 group-even:bg-cyan-50'>
                  <input
                    type='number'
                    className='text-center text-lg'
                    value={grades[lrn]?.fourth_grading || ''}
                    onChange={(e) =>
                      setGrades(prev => ({ ...prev, [lrn]: { ...prev[lrn], fourth_grading: Number(e.target.value) } }))
                    }
                  />
                </div>
                <span className='flex items-center justify-center p-2 group-odd:bg-gray-100'>
                  {grades[lrn]?.second_sem_subject_average || '-'}
                </span>
                <span className={`flex items-center justify-center p-2 group-odd:bg-gray-100
                  ${
                    grades[lrn]?.second_sem_subject_remarks === 'Passed'
                      ? 'text-blue-500 font-semibold'
                      : grades[lrn]?.second_sem_subject_remarks === 'Failed'
                      ? 'text-red-500 font-semibold'
                      : ''
                  }
                `}>
                  <p className={`
                    ${
                      grades[lrn]?.second_sem_subject_remarks === 'Passed'
                        ? 'bg-yellow-50 p-2 rounded-md'
                        : grades[lrn]?.second_sem_subject_remarks === 'Failed'
                        ? 'bg-yellow-50 p-2 rounded-md'
                        : ''
                    }
                  `}>
                    {grades[lrn]?.second_sem_subject_remarks || '-'}
                  </p>
                </span>
              </li>
            ))}
            </ul>
          )
        })()}
      </div>

      <div className='mt-4'>
        <button
          className={`px-4 py-2 rounded text-white ${isSaving ? 'bg-gray-500 cursor-progress' : 'bg-blue-500 hover:bg-blue-600'}`}
          onClick={saveGrades}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Grades'}
        </button>
      </div>
    </div>
  )
}

