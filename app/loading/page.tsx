'use client'

import React from 'react'
import { motion, Variants } from "motion/react"
import Logo from '@/app/favicon.ico'

export default function Page() {
    const dotVariants: Variants = {
        jump: {
            y: -20,
            transition: {
                duration: 0.8,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            },
        },
    }

    return (
        <div className='fixed inset-0 flex flex-col justify-center items-center bg-white'>
            {/* Logo sa itaas */}
            <img src={Logo.src} className='w-30 h-30 mb-6' alt="kshslogo" />

            {/* Loading three dots */}
            <motion.div
                animate="jump"
                transition={{ staggerChildren: 0.2, repeat: Infinity, repeatType: "loop" }}
                className="flex justify-center items-center gap-2.5 absolute bottom-10"
            >
                <motion.div className="w-3 h-3 rounded-full bg-blue-400 will-change-transform" variants={dotVariants} />
                <motion.div className="w-3 h-3 rounded-full bg-blue-400 will-change-transform" variants={dotVariants} />
                <motion.div className="w-3 h-3 rounded-full bg-blue-400 will-change-transform" variants={dotVariants} />
            </motion.div>
        </div>
    )
}
