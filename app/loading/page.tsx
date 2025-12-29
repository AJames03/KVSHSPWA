'use client'

import React from 'react'
import { motion, Variants } from "framer-motion" // Note: Check if you are using 'framer-motion' or 'motion/react'
import Logo from '@/app/favicon.ico'

export default function LoadingScreen() {
    // Logo pulsing effect
    const logoVariants: Variants = {
        pulse: {
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    }

    // Dot jumping animation
    const dotVariants: Variants = {
        initial: { y: 0 },
        animate: {
            y: -10,
            transition: {
                duration: 0.5,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            },
        },
    }

    return (
        <div className='fixed inset-0 z-[9999] flex flex-col justify-center items-center bg-gradient-to-tr from-blue-100 via-white to-blue-200'>
            
            {/* Soft Glow Background for Logo */}
            <div className="absolute w-64 h-64 bg-sky-400/10 rounded-full blur-3xl" />

            {/* Container for Logo */}
            <motion.div 
                variants={logoVariants}
                animate="pulse"
                className='relative flex flex-col items-center'
            >
                <div className="w-24 h-24 bg-white/40 backdrop-blur-md rounded-[2rem] flex items-center justify-center shadow-xl border border-white/50 mb-8">
                    <img src={Logo.src} className='w-16 h-16' alt="logo" />
                </div>
                
                {/* Branding text during load */}
                <h2 className="text-sky-800 font-bold tracking-widest text-sm uppercase">
                    KVSHS LIS
                </h2>
            </motion.div>

            {/* Loading Dots at the bottom */}
            <div className="absolute bottom-16 flex gap-2">
                {[0, 1, 2].map((index) => (
                    <motion.div
                        key={index}
                        variants={dotVariants}
                        initial="initial"
                        animate="animate"
                        transition={{
                            delay: index * 0.15,
                        }}
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 shadow-sm"
                    />
                ))}
            </div>

            {/* Subtle text label */}
            <p className="absolute bottom-8 text-[10px] text-sky-400 font-semibold tracking-[0.2em] uppercase">
                Loading Assets
            </p>
        </div>
    )
}