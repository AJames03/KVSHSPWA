'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// Using public icon path instead
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'
import Profile from '@/app/dashboard/pages/profile'
import Master_List from '@/app/dashboard/pages/masterlist'
import ALSMasterList from '@/app/dashboard/pages/alsmasterlist'
import Schedules from '@/app/dashboard/pages/schedules'
import Grading from '@/app/dashboard/pages/grading'
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from '@/app/loading/page'
import InstallPrompt from '@/components/InstallPrompt'

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    <div className="fixed flex flex-col lg:flex-row lg:grid lg:grid-cols-[240px_1fr] text-gray-800 w-screen h-screen bg-gray-50">

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
        <ul className="flex justify-around items-center h-16">
          <li onClick={() => { handleSetTab(0); setMasterlistDropdownOpen(false); setShowTooltip(false); }}
            className="flex flex-col items-center justify-center flex-1 cursor-pointer group">
            <i className={`bi ${tab === 0 ? 'bi-person-fill' : 'bi-person'} text-xl transition-all ${tab === 0 ? 'text-sky-600' : 'text-gray-600'}`}></i>
            <span className={`text-xs mt-1 ${tab === 0 ? 'text-sky-600 font-semibold' : 'text-gray-600'}`}>Profile</span>
          </li>

          <li onClick={() => setShowTooltip(true)}
            className="flex flex-col items-center justify-center flex-1 cursor-pointer">
            <i className={`bi ${(tab === 1 || tab === 2) ? 'bi-file-earmark-text-fill' : 'bi-file-earmark-text'} text-xl transition-all ${(tab === 1 || tab === 2) ? 'text-sky-600' : 'text-gray-600'}`}></i>
            <span className={`text-xs mt-1 ${(tab === 1 || tab === 2) ? 'text-sky-600 font-semibold' : 'text-gray-600'}`}>Lists</span>
          </li>

          <li onClick={() => { handleSetTab(3); setMasterlistDropdownOpen(false); setShowTooltip(false); }}
            className="flex flex-col items-center justify-center flex-1 cursor-pointer">
            <i className={`bi ${tab === 3 ? 'bi-calendar-check-fill' : 'bi-calendar-check'} text-xl transition-all ${tab === 3 ? 'text-sky-600' : 'text-gray-600'}`}></i>
            <span className={`text-xs mt-1 ${tab === 3 ? 'text-sky-600 font-semibold' : 'text-gray-600'}`}>Schedule</span>
          </li>

          <li onClick={() => { handleSetTab(4); setMasterlistDropdownOpen(false); setShowTooltip(false); }}
            className="flex flex-col items-center justify-center flex-1 cursor-pointer">
            <i className={`bi ${tab === 4 ? 'bi-file-text-fill' : 'bi-file-text'} text-xl transition-all ${tab === 4 ? 'text-sky-600' : 'text-gray-600'}`}></i>
            <span className={`text-xs mt-1 ${tab === 4 ? 'text-sky-600 font-semibold' : 'text-gray-600'}`}>Grading</span>
          </li>
        </ul>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showTooltip && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowTooltip(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-white shadow-2xl z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <img src="/icon-192.png" className="w-10 h-10 rounded-lg" alt="kshslogo" />
                    <p className={`${poppins.className} text-lg font-bold text-gray-800`}>KVSHS LIS</p>
                  </div>
                  <button onClick={() => setShowTooltip(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <i className="bi bi-x-lg text-xl text-gray-600"></i>
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4">
                  <ul className="flex flex-col gap-2">
                    <li
                      className={`flex flex-row items-center gap-3 cursor-pointer p-3 rounded-xl transition-all ${
                        tab === 0 ? 'bg-sky-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => { handleSetTab(0); setMasterlistDropdownOpen(false); setShowTooltip(false); }}
                    >
                      <i className="bi bi-person text-xl"></i>
                      <p className={`${poppins.className} text-base font-medium`}>Profile</p>
                    </li>

                    <li className="relative">
                      <div
                        className={`flex flex-row items-center justify-between gap-3 cursor-pointer p-3 rounded-xl transition-all ${
                          (tab === 1 || tab === 2) ? 'bg-sky-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setMasterlistDropdownOpen(!masterlistDropdownOpen)}
                      >
                        <div className="flex items-center gap-3">
                          <i className="bi bi-file-earmark-text text-xl"></i>
                          <p className={`${poppins.className} text-base font-medium`}>Masterlist</p>
                        </div>
                        <i className={`bi bi-chevron-down transition-transform duration-200 ${masterlistDropdownOpen ? "rotate-180" : ""}`}></i>
                      </div>

                      <AnimatePresence>
                        {masterlistDropdownOpen && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="ml-4 mt-2 overflow-hidden space-y-1"
                          >
                            <motion.li
                              className={`${poppins.className} p-3 pl-10 cursor-pointer rounded-lg transition-colors relative ${
                                tab === 1 ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={() => { handleSetTab(1); setShowTooltip(false); }}
                            >
                              {tab === 1 && <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-500 rounded-full"></div>}
                              Regular Student
                            </motion.li>

                            <motion.li
                              className={`${poppins.className} p-3 pl-10 cursor-pointer rounded-lg transition-colors relative ${
                                tab === 2 ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={() => { handleSetTab(2); setShowTooltip(false); }}
                            >
                              {tab === 2 && <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-500 rounded-full"></div>}
                              ALS Student
                            </motion.li>
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>

                    <li
                      className={`flex flex-row items-center gap-3 cursor-pointer p-3 rounded-xl transition-all ${
                        tab === 3 ? 'bg-sky-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => { handleSetTab(3); setMasterlistDropdownOpen(false); setShowTooltip(false); }}
                    >
                      <i className="bi bi-calendar-check text-xl"></i>
                      <p className={`${poppins.className} text-base font-medium`}>Schedule</p>
                    </li>

                    <li
                      className={`flex flex-row items-center gap-3 cursor-pointer p-3 rounded-xl transition-all ${
                        tab === 4 ? 'bg-sky-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => { handleSetTab(4); setMasterlistDropdownOpen(false); setShowTooltip(false); }}
                    >
                      <i className="bi bi-file-text text-xl"></i>
                      <p className={`${poppins.className} text-base font-medium`}>Grading</p>
                    </li>
                  </ul>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col h-full bg-white shadow-lg">
        <div className="p-4 flex flex-row justify-start items-center gap-3 border-b border-gray-200">
          <img src="/icon-192.png" className="w-12 h-12 rounded-lg" alt="kshslogo" />
          <p className={`${poppins.className} text-xl font-bold text-gray-800`}>KVSHS LIS</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="flex flex-col gap-2">
            <li
              className={`flex flex-row items-center gap-3 cursor-pointer p-3 rounded-xl transition-all ${
                tab === 0 ? 'bg-sky-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => { handleSetTab(0); setMasterlistDropdownOpen(false); }}
            >
              <i className="bi bi-person text-xl"></i>
              <p className={`${poppins.className} text-base font-medium`}>Profile</p>
            </li>

            <li className="relative">
              <div
                className={`flex flex-row items-center justify-between gap-3 cursor-pointer p-3 rounded-xl transition-all ${
                  (tab === 1 || tab === 2) ? 'bg-sky-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setMasterlistDropdownOpen(!masterlistDropdownOpen)}
              >
                <div className="flex items-center gap-3">
                  <i className="bi bi-file-earmark-text text-xl"></i>
                  <p className={`${poppins.className} text-base font-medium`}>Masterlist</p>
                </div>
                <i className={`bi bi-chevron-down transition-transform duration-200 ${masterlistDropdownOpen ? "rotate-180" : ""}`}></i>
              </div>

              <AnimatePresence>
                {masterlistDropdownOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="ml-4 mt-2 overflow-hidden space-y-1"
                  >
                    <motion.li
                      className={`${poppins.className} p-3 pl-10 cursor-pointer rounded-lg transition-colors relative ${
                        tab === 1 ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => { handleSetTab(1); }}
                    >
                      {tab === 1 && <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-500 rounded-full"></div>}
                      Regular Student
                    </motion.li>

                    <motion.li
                      className={`${poppins.className} p-3 pl-10 cursor-pointer rounded-lg transition-colors relative ${
                        tab === 2 ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => { handleSetTab(2); }}
                    >
                      {tab === 2 && <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-500 rounded-full"></div>}
                      ALS Student
                    </motion.li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>

            <li
              className={`flex flex-row items-center gap-3 cursor-pointer p-3 rounded-xl transition-all ${
                tab === 3 ? 'bg-sky-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => { handleSetTab(3); setMasterlistDropdownOpen(false); }}
            >
              <i className="bi bi-calendar-check text-xl"></i>
              <p className={`${poppins.className} text-base font-medium`}>Schedule</p>
            </li>

            <li
              className={`flex flex-row items-center gap-3 cursor-pointer p-3 rounded-xl transition-all ${
                tab === 4 ? 'bg-sky-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => { handleSetTab(4); setMasterlistDropdownOpen(false); }}
            >
              <i className="bi bi-file-text text-xl"></i>
              <p className={`${poppins.className} text-base font-medium`}>Grading</p>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className='flex flex-col w-full h-full'>
        <header className='bg-white border-b border-gray-200 flex flex-row justify-between items-center px-4 py-3 lg:px-6 lg:py-4 shadow-sm'>
          <div className="flex items-center gap-3">
            <button onClick={() => handleSetTab(0)} className="cursor-pointer hover:scale-105 transition-transform">
              {profilePicUrl ? (
                <img
                  src={profilePicUrl}
                  alt="Profile"
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover ring-2 ring-gray-200"
                />
              ) : (
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
                  <i className="bi bi-person-fill text-white text-xl lg:text-2xl"></i>
                </div>
              )}
            </button>
            <div className="hidden sm:block">
              <p className={`${poppins.className} text-sm text-gray-500`}>Welcome back</p>
              <p className={`${poppins.className} text-base font-semibold text-gray-800`}>{userName || 'Teacher'}</p>
            </div>
          </div>

          <button onClick={() => setShowLogoutConfirm(true)}
            className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all group'>
            <i className="bi bi-box-arrow-right text-lg group-hover:translate-x-1 transition-transform"></i>
            <span className="hidden sm:inline text-sm font-medium">Logout</span>
          </button>
        </header>

        <main className='flex-1 overflow-auto pb-20 lg:pb-4'>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {dashboard()}
          </motion.div>
        </main>
      </div>

      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='absolute bg-black/60 backdrop-blur-sm w-full h-full'
            onClick={() => setShowLogoutConfirm(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-2xl z-1 max-w-sm w-full">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <i className="bi bi-box-arrow-right text-3xl text-red-600"></i>
              </div>
              <h3 className={`${poppins.className} text-xl font-bold text-gray-800 mb-2`}>Logout</h3>
              <p className={`${poppins.className} text-gray-600 mb-6`}>Are you sure you want to log out?</p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <button onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleLogout}
                  className="px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors">
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      <InstallPrompt />
      {loading &&
        <div className='z-1000'>
          <LoadingScreen />
        </div>
      }
    </div>
  )
}
