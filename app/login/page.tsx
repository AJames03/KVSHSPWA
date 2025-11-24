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
    <div className='flex flex-col w-screen h-screen bg-white text-black'>
        <header className='bg-gray-50 w-full p-2'>
            <label className='flex flex-row items-center gap-2 cursor-pointer' onClick={() => setAboutModal(true)}>
                <span className="flex items-center justify-center w-5 h-5">
                    <span className="absolute inline-flex h-5 w-5 animate-ping rounded-full bg-sky-700 opacity-50"></span>
                    <i className="bi bi-info-circle text-xl z-5"></i>
                </span>


                <p className={`${poppins.className} lg:text-lg`}>About</p>
            </label>
        </header>

        <div className='flex justify-center items-center w-full h-full'>
            <Form />    
            
        </div>

        {aboutModal && (
            <AnimatePresence>
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed w-screen h-screen flex flex-col justify-center items-center z-50"
                >
                    <span className='fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-[3px]' onClick={() => setAboutModal(false)}></span>
                    <i className="bi bi-x-lg fixed top-4 right-4 text-2xl font-black text-white cursor-pointer" onClick={() => setAboutModal(false)}></i>
                    <About />
                </motion.div>
            </AnimatePresence>
        )}
    </div>
  )
}
