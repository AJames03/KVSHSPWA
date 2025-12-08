'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/app/favicon.ico'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'
import Monday from '@/app/dashboard/pages/schedulepage/monday'
import Tuesday from '@/app/dashboard/pages/schedulepage/tuesday'
import Wednesday from '@/app/dashboard/pages/schedulepage/wednesday'
import Thursday from '@/app/dashboard/pages/schedulepage/thursday'
import Friday from '@/app/dashboard/pages/schedulepage/friday'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})


export default function schedules() {
  const [tab, setTab] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getLeft = () => {
    if (windowWidth >= 1024){
      if(tab === 0){
        return `0%`;
      }
      if(tab === 1){
        return `20.2%`;
      }
      if(tab === 2){
        return `40.2%`;
      }
      if(tab === 3){
        return `60.4%`;
      }
      if(tab === 4){
        return `80.55%`;
      }
    }
    if(windowWidth >= 768){
      if(tab === 0){
        return `0%`;
      }
      if(tab === 1){
        return `20.2%`;
      }
      if(tab === 2){
        return `40.2%`;
      }
      if(tab === 3){
        return `60.4%`;
      }
      if(tab === 4){
        return `80.55%`;
      }
    }
    if(windowWidth >= 320){
      if(tab === 0){
        return `0%`;
      }
      if(tab === 1){
        return `20.2%`;
      }
      if(tab === 2){
        return `40.3%`;
      }
      if(tab === 3){
        return `60.5%`;
      }
      if(tab === 4){
        return `81%`;
      }
    }
  };


  const dayTab = () => {
    switch (tab) {
      case 0:
        return <Monday />;
      case 1:
        return <Tuesday />;
      case 2:
        return <Wednesday />;
      case 3:
        return <Thursday />;
      case 4:
        return <Friday />;
      default:
        return <div>Day 1</div>;
    }
  }

  return (
    <div className='grid grid-rows-[40px_30px_1fr] lg:grid-rows-[40px_40px_1fr] gap-3 bg-white w-full h-full p-2 text-black'>
        <h1 className={`${poppins.className} text-lg lg:text-2xl font-bold border-b`}>CLASS SCHEDULES</h1>
        <nav className='relative flex justify-center items-center w-full'>
          <ul className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr] text-center gap-2 w-full z-2 bg-transparent'>
            <li 
              className={`${poppins.className} cursor-pointer transition-all duration-300 
                ease-in-out
              ${tab === 0 ? ' text-white' : ''}
              `}
              onClick={() => setTab(0)}
            >
              Mon
            </li>
            <li 
              className={`${poppins.className} cursor-pointer transition-all duration-300 
                ease-in-out
              ${tab === 1 ? ' text-white' : ''}
              `}
              onClick={() => setTab(1)}
            >
              Tue
            </li>
            <li 
              className={`${poppins.className} cursor-pointer transition-all duration-300 
                ease-in-out
              ${tab === 2 ? ' text-white' : ''}
              `}
              onClick={() => setTab(2)}
            >Wed</li>
            <li 
              className={`${poppins.className} cursor-pointer transition-all duration-300 
                ease-in-out
              ${tab === 3 ? ' text-white' : ''}
              `}
              onClick={() => setTab(3)}
            >Thu</li>
            <li 
              className={`${poppins.className} cursor-pointer transition-all duration-300 
                ease-in-out
              ${tab === 4 ? ' text-white' : ''}
              `}
              onClick={() => setTab(4)}
            >Fri</li>
          </ul>
          <span className="absolute bottom-0 h-full w-[19%] lg:w-[219px] bg-sky-700 z-1 transition-all duration-300"
            style={{
              left: getLeft(),
            }} 
          />
          <div className='absolute grid grid-cols-5 gap-2 text-center h-full w-full z-0'>
            <span className='bg-gray-100 w-full h-full' />
            <span className='bg-gray-100 w-full h-full' />
            <span className='bg-gray-100 w-full h-full' />
            <span className='bg-gray-100 w-full h-full' />
            <span className='bg-gray-100 w-full h-full' />
          </div>
        </nav>

        <div className=' h-full w-full  p-2'>
          {dayTab()}
        </div>

    </div>
  )
}
