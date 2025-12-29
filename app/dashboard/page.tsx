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
import Logo from '@/app/favicon.ico'

const poppins = Poppins({
  weight: ['400', '600', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function Page() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSetTab = (newTab: number) => {
    setTab(newTab);
    localStorage.setItem('currentTab', newTab.toString());
  };

  const handleLogout = async () => {
    setLoading(true);
    const email = localStorage.getItem("userEmail");
    if (email) {
      await supabase.from("teachers").update({ is_logged_in: false }).eq("email", email);
    }
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");
    router.replace("/login");
  };

  const renderContent = () => {
    switch (tab) {
      case 0: return <Profile />;
      case 1: return <Master_List />;
      case 2: return <ALSMasterList />;
      case 3: return <Schedules />;
      case 4: return <Grading />;
      default: return <Profile />;
    }
  }

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const savedTab = localStorage.getItem('currentTab');
    if (savedTab) setTab(Number(savedTab));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    const fetchUser = async () => {
      const { data } = await supabase.from('teachers').select('firstname, surname, profile_pic').eq('email', email).single();
      if (data) {
        setUserName(`${data.firstname} ${data.surname}`);
        setProfilePicUrl(data.profile_pic || null);
      }
    };
    fetchUser();
  }, [mounted]);

  return (
    <div className={`${poppins.className} flex h-screen w-screen bg-gradient-to-tr from-blue-100 via-white to-blue-200 text-black overflow-hidden`}>
      
      {/* SIDEBAR - Desktop Only (Hidden on Mobile) */}
      <aside className="hidden lg:flex flex-col w-72 bg-white/70 backdrop-blur-xl border-r border-white/50 p-6 shadow-xl">
        <div className="flex items-center gap-4 mb-10 p-2 bg-white rounded-2xl shadow-sm border border-blue-50">
            <img src={Logo.src} alt="logo" className="w-10 h-10 object-contain" />
            <div>
                <h1 className="text-lg font-bold text-slate-800 leading-none">KVSHS LIS</h1>
                <p className="text-[10px] text-sky-600 font-bold uppercase mt-1">Teacher Hub</p>
            </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
            <DesktopNavItem icon="person" label="Profile" active={tab === 0} onClick={() => handleSetTab(0)} />
            <DesktopNavItem icon="file-earmark-text" label="Regular Masterlist" active={tab === 1} onClick={() => handleSetTab(1)} />
            <DesktopNavItem icon="journal-text" label="ALS Masterlist" active={tab === 2} onClick={() => handleSetTab(2)} />
            <DesktopNavItem icon="calendar3" label="Schedule" active={tab === 3} onClick={() => handleSetTab(3)} />
            <DesktopNavItem icon="mortarboard" label="Grading" active={tab === 4} onClick={() => handleSetTab(4)} />
        </nav>

        <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 p-4 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all font-semibold"
        >
            <i className="bi bi-box-arrow-right text-xl"></i>
            <span>Logout Account</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        
        {/* MOBILE HEADER (Hidden on Desktop) */}
        <header className="flex lg:hidden items-center justify-between px-6 pt-10 pb-4 bg-transparent">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center p-2 border border-blue-50">
                    <img src={Logo.src} alt="logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-sm font-bold text-slate-800">KVSHS LIS</h1>
            </div>
            <button onClick={() => setShowLogoutConfirm(true)} className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm border border-white">
                <i className="bi bi-box-arrow-right text-lg"></i>
            </button>
        </header>

        {/* DESKTOP TOP BAR (Hidden on Mobile) */}
        <header className="hidden lg:flex items-center justify-between px-10 py-6 bg-transparent">
            <h2 className="text-2xl font-bold text-slate-800">
                {tab === 0 ? "My Profile" : tab === 1 ? "Regular Masterlist" : tab === 2 ? "ALS Masterlist" : tab === 3 ? "Class Schedule" : "Grading Portal"}
            </h2>
            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 pl-4 rounded-full border border-white">
                <p className="text-sm font-semibold text-slate-700">{userName || "Teacher"}</p>
                <div className="w-10 h-10 bg-sky-500 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    {profilePicUrl ? <img src={profilePicUrl} className="w-full h-full object-cover" /> : <i className="bi bi-person-fill text-white flex items-center justify-center h-full"></i>}
                </div>
            </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-10 pb-24 lg:pb-10">
            <motion.div
                key={tab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
            >
                {renderContent()}
            </motion.div>
        </main>
      </div>

      {/* BOTTOM NAV (Hidden on Desktop) */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] h-18 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-200/50 rounded-[2rem] flex items-center justify-around px-4 z-[40]">
        <NavItem icon="person" label="Profile" active={tab === 0} onClick={() => handleSetTab(0)} />
        <NavItem icon="file-earmark-text" label="Regular" active={tab === 1} onClick={() => handleSetTab(1)} />
        <NavItem icon="journal-text" label="ALS" active={tab === 2} onClick={() => handleSetTab(2)} />
        <NavItem icon="calendar3" label="Sched" active={tab === 3} onClick={() => handleSetTab(3)} />
        <NavItem icon="mortarboard" label="Grading" active={tab === 4} onClick={() => handleSetTab(4)} />
      </nav>

      {/* LOGOUT CONFIRMATION (Shared) */}
      <AnimatePresence>
        {showLogoutConfirm && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-end lg:items-center justify-center"
            >
                <motion.div 
                    initial={{ y: "100%", scale: 1 }} 
                    animate={{ y: 0, scale: 1 }} 
                    exit={{ y: "100%", scale: 0.9 }}
                    className="bg-white w-full lg:w-[400px] rounded-t-[2.5rem] lg:rounded-[2.5rem] p-8 pb-10 shadow-2xl"
                >
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 lg:hidden" />
                    <h3 className="text-xl font-bold text-center mb-2 lg:text-left lg:px-2">Logging Out?</h3>
                    <p className="text-gray-500 text-center lg:text-left lg:px-2 mb-8 italic">Are you sure you want to end your session?</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setShowLogoutConfirm(false)} className="py-4 rounded-2xl font-bold bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                        <button onClick={handleLogout} className="py-4 rounded-2xl font-bold bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-200 hover:brightness-110 transition-all">Logout</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {loading && <LoadingScreen />}
    </div>
  )
}

// Mobile Nav Item
function NavItem({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center transition-all duration-300 relative">
            {active && <motion.div layoutId="nav-pill" className="absolute -top-1 w-12 h-1 bg-sky-500 rounded-full" />}
            <i className={`bi bi-${icon}${active ? '-fill' : ''} text-xl ${active ? 'text-sky-600' : 'text-slate-400'}`}></i>
            <span className={`text-[10px] mt-1 font-bold ${active ? 'text-sky-600' : 'text-slate-400'}`}>{label}</span>
        </button>
    )
}

// Desktop Nav Item
function DesktopNavItem({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick} 
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-semibold ${
                active ? 'bg-sky-500 text-white shadow-lg shadow-sky-200 scale-[1.02]' : 'text-slate-500 hover:bg-white hover:text-sky-600'
            }`}
        >
            <i className={`bi bi-${icon}${active ? '-fill' : ''} text-xl`}></i>
            <span className="text-sm">{label}</span>
        </button>
    )
}
