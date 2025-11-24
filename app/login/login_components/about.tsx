'use client'
import { useState, useEffect } from 'react'
import Logo from '@/app/favicon.ico'

export default function about() {
  return (
    <div className='fixed flex justify-center items-center w-full h-[80%] lg:w-1/2 lg:h-[90%] z-50 '>
        <div className='flex flex-col gap-5 w-full h-full rounded-md bg-white m-5 p-3 lg:p-5 text-black text-center overflow-auto'>
            <img src={Logo.src} className='w-20 h-20 self-center' alt="kshslogo" />
            <p className='lg:text-lg'>This LIS Web App can be installed on your phone like a regular app, allowing teachers to 
              access student records and school data quickly and conveniently..
            </p>
        </div>
    </div>
  )
}
