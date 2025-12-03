'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/app/favicon.ico'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'
import Profile from '@/app/dashboard/pages/profile'
import Masterlist from '@/app/dashboard/pages/masterlist'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function Page() {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState(0);

  const handleSetTab = (newTab: number) => {
    setTab(newTab);
    localStorage.setItem('currentTab', newTab.toString());
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail"); 
    router.replace("/login");
  }

  // PAGES TAB NAVIGATION
  const dashboard = () => {
    switch (tab) {
      case 0:
        return <Profile />;
      case 1:
        return <Masterlist />;
      case 2:
        return <div>Page 3</div>;
      default:
        return <div>Page 1</div>;
    }
  }

  // Fetch user name from Supabase
  useEffect(() => {
      setMounted(true);
    }, []);

  // Load tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('currentTab');
    if (savedTab) {
      setTab(Number(savedTab));
    }
  }, []);

    useEffect(() => {
      if (!mounted) return; // wait until component is mounted

      const fetchUserName = async () => {
        const email = localStorage.getItem('userEmail');
        if (!email) return;

        const { data, error } = await supabase
          .from('AppUsers')
          .select('full_name')
          .eq('email', email)
          .single();

        if (!error && data) {
          setUserName(data.full_name);
        }
      };

      fetchUserName();
    }, [mounted]);

  return (
    <div className="flex flex-row lg:grid lg:grid-cols-[200px_1fr] text-black w-screen h-screen 
    bg-gradient-to-b from-sky-50 to-sky-200">
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static top-0 left-0 h-full w-[200px] bg-white shadow-[4px_0_6px_-1px_rgba(0,0,0,0.3)]
        transform transition-transform duration-300 z-1 p-2
        ${showTooltip ? 'translate-x-0' : '-translate-x-[200px]'}
        lg:translate-x-0 
      `}>
        <i className="bi bi-list text-xl lg:hidden" onClick={() => setShowTooltip(!showTooltip)}></i>
        <div className="p-2 flex flex-row justify-start items-center gap-2 border-b-2">
          <img src={Logo.src} className="w-10 h-10" alt="kshslogo" />
          <p className={`${poppins.className} text-lg font-bold`}>KVSHS LIS</p>
        </div>

        <nav>
          <ul className="flex flex-col gap-2 p-2">
            <li
              className={`flex flex-row items-center gap-2 cursor-pointer p-2
                rounded transition-colors duration-300 hover:bg-sky-100 ${
                tab === 0 ? 'text-white bg-gradient-to-l  from-sky-300 to-sky-500' : ''
              }`}
              onClick={() => handleSetTab(0)}
            >
              <i className="bi bi-person text-lg"></i>
              <p className={`${poppins.className} text-sm`}>Profile</p>
              
            </li>
            <li
              className={`flex flex-row items-center gap-2 cursor-pointer p-2
                hover:bg-sky-100 rounded transition-colors duration-300 ${
                tab === 1 ? 'text-white bg-gradient-to-l  from-sky-300 to-sky-500' : ''
              }`}
              onClick={() => handleSetTab(1)}
            >
              <i className="bi bi-file-earmark-text text-lg"></i>
              <p className={`${poppins.className} text-sm`}>Masterlist</p>
            </li>
          </ul>


        </nav>
      </div>

      
      {/* Main Content */}
      <div className='grid grid-rows-[50px_1fr] w-full'>
        <nav className='bg-sky-100 flex flex-row justify-between items-center p-4 relative'>
          <button onClick={() => setShowTooltip(!showTooltip)}>
            <i className="bi bi-list lg:hidden text-xl"></i>
          </button>
          <div className="flex items-center gap-4">
            {/* Welcome Text */}
            <p className={`${poppins.className} font-medium text-sm`}>
              Welcome, {userName || 'User'}
            </p>

            {/* Logout Button */}
            <button onClick={handleLogout} className='relative cursor-pointer group'>
              <i className="bi bi-box-arrow-right text-xl hover:text-gray-500"></i>
              <span className="absolute top-full mb-2 left-1/2 -translate-x-[60%]
                              opacity-0 group-hover:opacity-100
                              transition-opacity duration-300
                              bg-gray-500 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Logout
              </span>
            </button>
          </div>
        </nav>

        <div className='lg:p-2 overflow-auto' onClick={() => setShowTooltip(false)}>
          {dashboard()}
        </div>
      </div>
    </div>
  )
}
