'use client'
import { useState } from 'react'
import { Poppins } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'

// Import components
import Monday from '@/app/dashboard/pages/schedulepage/monday'
import Tuesday from '@/app/dashboard/pages/schedulepage/tuesday'
import Wednesday from '@/app/dashboard/pages/schedulepage/wednesday'
import Thursday from '@/app/dashboard/pages/schedulepage/thursday'
import Friday from '@/app/dashboard/pages/schedulepage/friday'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
})

export default function Schedules() {
  const [tab, setTab] = useState(0);

  const days = [
    { label: 'Mon', comp: <Monday /> },
    { label: 'Tue', comp: <Tuesday /> },
    { label: 'Wed', comp: <Wednesday /> },
    { label: 'Thu', comp: <Thursday /> },
    { label: 'Fri', comp: <Friday /> },
  ];

  return (
    /* Layout with soft light-blue gradient background from the design */
    <div className={`grid grid-rows-[60px_70px_1fr] h-[100dvh] w-full bg-gradient-to-b from-[#CFEFFF] via-[#E8F7FF] to-white overflow-hidden ${poppins.className}`}>
      
      {/* ROW 1: HEADER - Minimalist and clean */}
      <header className="flex items-center px-6">
        <h1 className="text-lg font-bold tracking-tight text-slate-800">
          Class Schedules
        </h1>
      </header>

      {/* ROW 2: PILL TABS - Following the "All, Work, Personal" pill style */}
      <nav className="flex items-center px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-full justify-between">
          {days.map((day, idx) => (
            <button
              key={day.label}
              onClick={() => setTab(idx)}
              className={`relative px-5 py-2 text-xs font-semibold rounded-full transition-all duration-300 ${
                tab === idx 
                ? 'text-white' 
                : 'text-slate-500 bg-white/40 backdrop-blur-md border border-white/40 shadow-sm'
              }`}
            >
              <span className="relative z-10">{day.label}</span>
              {tab === idx && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#2D3142] rounded-full shadow-lg shadow-slate-300"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ROW 3: SCROLLABLE CONTENT - With extra bottom padding to prevent overlap */}
      <main className="overflow-y-auto relative p-4 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {/* Tip: Ensure your schedule cards in <Monday /> etc., use:
               className="bg-white/70 backdrop-blur-md rounded-3xl p-5 mb-4 border border-white/50 shadow-sm"
            */}
            {days[tab].comp}
          </motion.div>
        </AnimatePresence>
      </main>

      
    </div>
  )
}