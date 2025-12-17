'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/app/favicon.ico'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'
import Profile from '@/app/dashboard/pages/profile'
import Master_List from '@/app/dashboard/pages/masterlist'
import ALSMasterList from '@/app/dashboard/pages/alsmasterlist'
import Schedules from '@/app/dashboard/pages/schedules'
import Grading from '@/app/dashboard/pages/grading'
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from '@/app/loading/page'

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
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState(0);
  const [masterlistDropdownOpen, setMasterlistDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSetTab = (newTab: number) => {
    setTab(newTab);
    localStorage.setItem('currentTab', newTab.toString());
  };

  // 🔥 UPDATED LOGOUT FUNCTION (LOCALSTORAGE + SUPABASE)
  const handleLogout = async () => {
    setTimeout(() => {
      setLoading(true);
    }, 100);
    const email = localStorage.getItem("userEmail");

    if (email) {
      await supabase
        .from("teachers")
        .update({ is_logged_in: false })
        .eq("email", email);
    }

    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");

    router.replace("/login");
  };

  // PAGES TAB NAVIGATION
  const dashboard = () => {
    switch (tab) {
      case 0:
        return <Profile />;
      case 1:
        return <Master_List />;
      case 2:
        return <ALSMasterList />;
      case 3:
        return <Schedules />;
      case 4:
        return <Grading />;
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
    if (!mounted) return;

    const email = localStorage.getItem('userEmail');
    if (!email) return;

    // Initial fetch of user name
    const fetchUserName = async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('firstname, surname, profile_pic')
        .eq('email', email)
        .single();

      if (!error && data) {
        setUserName(`${data.firstname} ${data.surname}`);

        // Set profile picture URL (already stored as full URL)
        setProfilePicUrl(data.profile_pic || null)
      }
    };

    fetchUserName();

    // Auto-refresh: Subscribe to real-time changes on the teachers table for this user
    // This ensures the profile picture and name update automatically when changed in the database
    const channel = supabase
      .channel('user-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'teachers',
        filter: `email=eq.${email}`
      }, (payload) => {
        // When data changes, update the userName state to reflect the new values
        if (payload.new) {
          setUserName(`${payload.new.firstname} ${payload.new.surname}`);

          // Update profile picture URL (already stored as full URL)
          setProfilePicUrl(payload.new.profile_pic || null)
        }
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [mounted]);

  return (
    <div className="fixed flex flex-row lg:grid lg:grid-cols-[200px_1fr] text-black w-screen h-screen 
    bg-gradient-to-b from-sky-50 to-sky-200">
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static top-0 left-0 h-full w-[200px] bg-white shadow-[4px_0_6px_-1px_rgba(0,0,0,0.3)]
        transform transition-transform duration-300 z-50 p-2
        ${showTooltip ? 'translate-x-0 w-[250px]' : '-translate-x-[200px]'}
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
              onClick={() => { handleSetTab(0); setMasterlistDropdownOpen(false); }} 
            >
              <i className="bi bi-person text-lg"></i>
              <p className={`${poppins.className} text-sm`}>Profile</p>
            </li>

            <li className="relative">
              <div
                className={`flex flex-row items-center gap-2 cursor-pointer p-2
                  hover:bg-sky-100 rounded transition-colors duration-300 ${
                  tab === 1 ? 'text-white bg-gradient-to-l from-sky-300 to-sky-500' : ''
                } ${tab === 2 ? 'text-white bg-gradient-to-l from-sky-300 to-sky-500' : ''}`}
                onClick={() => setMasterlistDropdownOpen(!masterlistDropdownOpen)}
              >
                <i className="bi bi-file-earmark-text text-lg"></i>
                <p className={`${poppins.className} text-sm`}>Masterlist</p>
                <i className={`bi bi-chevron-down transition-transform duration-200 ${masterlistDropdownOpen ? "rotate-180" : ""}`}></i>
              </div>

              <AnimatePresence>
                {masterlistDropdownOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0, y: -10 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="ml-4 mt-1 z-10 border-l-4 border-sky-500 overflow-hidden origin-top"
                  >
                    <motion.li
                      className={`${poppins.className} p-2 cursor-pointer hover:bg-gray-100 ml-1
                        ${tab === 1 ? 'text-black bg-gray-200 hover:bg-gray-200' : ''}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => { handleSetTab(1); }}
                    >
                      Regular Student
                    </motion.li>

                    <motion.li
                      className={`${poppins.className} p-2 cursor-pointer hover:bg-gray-100 ml-1
                        ${tab === 2 ? 'text-black bg-gray-200 hover:bg-gray-200' : ''}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => { handleSetTab(2); }}
                    >
                      ALS Student
                    </motion.li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>

            <li
              className={`flex flex-row items-center gap-2 cursor-pointer p-2
                rounded transition-colors duration-300 hover:bg-sky-100 ${
                tab === 3 ? 'text-white bg-gradient-to-l  from-sky-300 to-sky-500' : ''
              }`}
              onClick={() => { handleSetTab(3); setMasterlistDropdownOpen(false); }} 
            >
              <i className="bi bi-person text-lg"></i>
              <p className={`${poppins.className} text-sm`}>Schedule</p>
            </li>

            <li
              className={`flex flex-row items-center gap-2 cursor-pointer p-2
                rounded transition-colors duration-300 hover:bg-sky-100 ${
                tab === 4 ? 'text-white bg-gradient-to-l  from-sky-300 to-sky-500' : ''
              }`}
              onClick={() => { handleSetTab(4); setMasterlistDropdownOpen(false); }} 
            >
              <i className="bi bi-file-text"></i>
              <p className={`${poppins.className} text-sm`}>Grading</p>
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
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <i className="bi bi-person-circle text-2xl"></i>
            )}

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
      {loading && 
        <div className='z-1000'>
          <LoadingScreen />
        </div>
      }
    </div>
  )
}
