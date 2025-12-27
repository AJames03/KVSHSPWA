'use client'
import React from 'react'
import { Poppins } from 'next/font/google'
import { motion, AnimatePresence } from "framer-motion";
import About from './login_components/about';
import Form from './login_components/form';

const poppins = Poppins({
    weight: '400',
    subsets: ['latin'],
})

export default function page() {
  const [aboutModal, setAboutModal] = React.useState(false);
  return (
    <div className='flex flex-col w-screen h-screen bg-gradient-to-br from-gray-50 via-sky-50 to-blue-50 text-gray-800'>
        <header className='absolute top-0 left-0 right-0 z-10'>
            <div className='flex justify-between items-center p-4 lg:p-6'>
                <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg'></div>
                    <span className={`${poppins.className} text-lg font-bold text-gray-800`}>KVSHS LIS</span>
                </div>
                <button
                    className='flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm
                    hover:bg-white border border-gray-200 transition-all shadow-sm hover:shadow-md'
                    onClick={() => setAboutModal(true)}
                >
                    <i className="bi bi-info-circle text-sky-600 text-lg"></i>
                    <span className={`${poppins.className} text-sm font-medium text-gray-700`}>About</span>
                </button>
            </div>
        </header>

        <div className='flex justify-center items-center w-full h-full p-4'>
            <Form />
        </div>

        <AnimatePresence>
            {aboutModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black/60 backdrop-blur-sm'
                        onClick={() => setAboutModal(false)}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className='relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 lg:p-8'
                    >
                        <button
                            onClick={() => setAboutModal(false)}
                            className='absolute top-4 right-4 w-10 h-10 flex items-center justify-center
                            rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors'
                        >
                            <i className="bi bi-x-lg text-gray-600"></i>
                        </button>
                        <About />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  )
}
