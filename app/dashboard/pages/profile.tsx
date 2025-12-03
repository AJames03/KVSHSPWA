'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/app/favicon.ico'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'

const poppins = Poppins({
    weight: ['400', '700'],
    style: ['normal'],
    subsets: ['latin'],
    display: 'swap',
})

export default function Profile() {
  const [userName, setUserName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted to true once the component loads
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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
    <div className='flex justify-start items-start w-full h-full text-black bg-white lg:p-4'>
      <p className={`${poppins.className} text-xl font-black`}>{userName || 'User'}</p>
    </div>
  )
}
