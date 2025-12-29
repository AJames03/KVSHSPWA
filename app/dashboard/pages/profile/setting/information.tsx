'use client'
import LoadingCircleSpinner from '@/components/LoadingCircleSpinner'
import { motion } from 'framer-motion'

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
  firstname, setFirstname,
  middlename, setMiddlename,
  surname, setSurname,
  suffix, setSuffix,
  honorific, setHonorific,
  post_nominals, setPost_nominals,
  loading, uploading, handleSave,
}: InformationProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      {/* 🔹 Header Section */}
      <div className="mb-6 px-1">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <i className="bi bi-person-lines-fill text-sky-500"></i>
          Personal Information
        </h3>
        <p className="text-xs text-gray-500 italic">Update your public profile details here.</p>
      </div>

      <form className="grid grid-cols-1 gap-4 px-1">
        {/* Honorific & Post Nominals Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-sky-700 ml-1">Honorific</label>
            <input 
              placeholder="e.g. Mr. / Ms."
              className="w-full bg-gray-50/50 border border-gray-200 p-3 rounded-2xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-sm" 
              value={honorific} 
              onChange={(e) => setHonorific(e.target.value)} 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-sky-700 ml-1">Post Nominals</label>
            <input 
              placeholder="e.g. LPT, MAEd"
              className="w-full bg-gray-50/50 border border-gray-200 p-3 rounded-2xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-sm" 
              value={post_nominals} 
              onChange={(e) => setPost_nominals(e.target.value)} 
            />
          </div>
        </div>

        {/* Name Fields */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-sky-700 ml-1">First Name</label>
          <input 
            className="w-full bg-gray-50/50 border border-gray-200 p-3 rounded-2xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-sm" 
            value={firstname} 
            onChange={(e) => setFirstname(e.target.value)} 
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-sky-700 ml-1">Middle Name</label>
          <input 
            className="w-full bg-gray-50/50 border border-gray-200 p-3 rounded-2xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-sm" 
            value={middlename} 
            onChange={(e) => setMiddlename(e.target.value)} 
          />
        </div>

        {/* Last Name & Suffix Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-bold text-sky-700 ml-1">Last Name</label>
            <input 
              className="w-full bg-gray-50/50 border border-gray-200 p-3 rounded-2xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-sm" 
              value={surname} 
              onChange={(e) => setSurname(e.target.value)} 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-sky-700 ml-1">Suffix</label>
            <input 
              placeholder="Jr."
              className="w-full bg-gray-50/50 border border-gray-200 p-3 rounded-2xl outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-sm" 
              value={suffix} 
              onChange={(e) => setSuffix(e.target.value)} 
            />
          </div>
        </div>
      </form>

      {/* 🚀 Responsive Action Button Section */}
      <div className="mt-10 px-1 mb-10 lg:mb-0">
        <div className="flex flex-col lg:flex-row lg:justify-end">
            <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleSave}
            disabled={loading || uploading}
            className={`
                /* Mobile: Full Width, Desktop: Auto/Fixed */
                w-full lg:w-52 
                /* Padding & Text */
                py-4 lg:py-3 px-6 
                /* Colors & Effects */
                bg-gradient-to-r from-sky-400 to-blue-600 
                hover:from-sky-500 hover:to-blue-700
                text-white font-bold text-sm lg:text-base
                /* Shape & Shadow */
                rounded-2xl lg:rounded-full shadow-lg shadow-blue-200/50 
                /* Transitions */
                transition-all duration-200 
                /* Flexbox for Loader/Icon alignment */
                flex justify-center items-center gap-2
                /* Disabled State */
                disabled:opacity-50 disabled:cursor-not-allowed
            `}
            >
            {loading || uploading ? (
                <>
                <LoadingCircleSpinner />
                <span>Saving...</span>
                </>
            ) : (
                <>
                <i className="bi bi-cloud-arrow-up-fill text-lg"></i>
                <span>Save Changes</span>
                </>
            )}
            </motion.button>
        </div>
        
        {/* Subtle helper text for mobile */}
        <p className="lg:hidden text-center text-[10px] text-gray-400 mt-4">
            Make sure all details are correct before saving.
        </p>
      </div>
    </div>
  )
}