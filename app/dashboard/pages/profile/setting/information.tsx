'use client'
import LoadingCircleSpinner from '@/components/LoadingCircleSpinner'

interface InformationProps {
  firstname: string
  setFirstname: (value: string) => void
  middlename: string
  setMiddlename: (value: string) => void
  surname: string
  setSurname: (value: string) => void
  suffix: string
  setSuffix: (value: string) => void
  honorific: string
  setHonorific: (value: string) => void
  post_nominals: string
  setPost_nominals: (value: string) => void
  loading: boolean
  uploading: boolean
  handleSave: () => void
}

export default function Information({
  firstname,
  setFirstname,
  middlename,
  setMiddlename,
  surname,
  setSurname,
  suffix,
  setSuffix,
  honorific,
  setHonorific,
  post_nominals,
  setPost_nominals,
  loading,
  uploading,
  handleSave,
}: InformationProps) {
  return (
    <>
      {/* 🔹 Info Form */}
      <form className='grid md:grid-cols-[auto_1fr] gap-2 max-w-lg'>
        <label>Honorific:</label>
        <input className='border p-2 rounded' value={honorific} onChange={(e) => setHonorific(e.target.value)} />
        <label>First Name:</label>
        <input className='border p-2 rounded' value={firstname} onChange={(e) => setFirstname(e.target.value)} />

        <label>Middle Name:</label>
        <input className='border p-2 rounded' value={middlename} onChange={(e) => setMiddlename(e.target.value)} />

        <label>Last Name:</label>
        <input className='border p-2 rounded' value={surname} onChange={(e) => setSurname(e.target.value)} />

        <label>Suffix:</label>
        <input className='border p-2 rounded' value={suffix} onChange={(e) => setSuffix(e.target.value)} />
        <label>Post Nominals:</label>
        <input className='border p-2 rounded' value={post_nominals} onChange={(e) => setPost_nominals(e.target.value)} />
      </form>

      <div className='p-2 mt-2 flex justify-end'>
        <button
            type='button'
            onClick={handleSave}
            disabled={loading || uploading}
            className='px-4 py-2 bg-blue-500 text-white rounded flex justify-center items-center gap-2 
                        w-30 '
        >
            {loading || uploading ? <LoadingCircleSpinner /> : 'Save'}
        </button>
      </div>
    </>
  )
}