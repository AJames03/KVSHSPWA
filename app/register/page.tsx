'use client'
import { useState } from 'react'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import bcrypt from 'bcryptjs'

const poppins = Poppins({
  weight: ['400', '600', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function Page() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [surname, setSurname] = useState('');
    const [firstname, setFirstname] = useState('');
    const [middlename, setMiddlename] = useState('');
    const [suffix, setSuffix] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        try {
            const { data: existingUser } = await supabase
                .from('teachers')
                .select('email')
                .eq('email', email)
                .single();

            if (existingUser) {
                alert('Email already exists');
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const { error } = await supabase
                .from('teachers')
                .insert([{ 
                    email, 
                    password: hashedPassword, 
                    surname, 
                    firstname, 
                    middlename, 
                    suffix, 
                    status: 'Pending' 
                }]);

            if (error) {
                alert('Error registering: ' + error.message);
            } else {
                alert('Registered successfully');
                router.push('/login');
            }
        } catch (err) {
            alert('An unexpected error occurred');
        }
    };

    return (
        <div className={`${poppins.className} min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 p-4`}>
            
            {/* Main Card Container */}
            <div className='flex flex-col items-center p-8 rounded-[2.5rem] w-full max-w-[450px] bg-white shadow-2xl shadow-blue-200/50 text-black'>
                
                <div className='flex flex-col items-center w-full mb-6'>
                    <h1 className='text-3xl font-bold text-slate-800 tracking-tight'>Register</h1>
                    <p className='text-gray-500 text-sm mt-1'>Please register to login</p>
                </div>

                <form onSubmit={handleRegister} className='flex flex-col w-full gap-3'>
                    
                    {/* Name Fields Section */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className='border border-gray-200 rounded-xl bg-gray-50/50 px-3 py-2'>
                            <input type="text" placeholder='First Name' value={firstname} onChange={(e) => setFirstname(e.target.value)} className='bg-transparent outline-none w-full text-sm' required/>
                        </div>
                        <div className='border border-gray-200 rounded-xl bg-gray-50/50 px-3 py-2'>
                            <input type="text" placeholder='Last Name' value={surname} onChange={(e) => setSurname(e.target.value)} className='bg-transparent outline-none w-full text-sm' required/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className='border border-gray-200 rounded-xl bg-gray-50/50 px-3 py-2'>
                            <input type="text" placeholder='Middle Name' value={middlename} onChange={(e) => setMiddlename(e.target.value)} className='bg-transparent outline-none w-full text-sm' required/>
                        </div>
                        <div className='border border-gray-200 rounded-xl bg-gray-50/50 px-3 py-2'>
                            <input type="text" placeholder='Suffix' value={suffix} onChange={(e) => setSuffix(e.target.value)} className='bg-transparent outline-none w-full text-sm' />
                        </div>
                    </div>

                    <div className='w-full h-[1px] bg-gray-100 my-2' />

                    {/* Account Fields Section */}
                    <div className='flex items-center gap-3 border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-3'>
                        <i className="bi bi-person-circle text-gray-400"></i>
                        <input type="email" placeholder='Email Address' value={email} onChange={(e) => setEmail(e.target.value)} className='bg-transparent outline-none w-full text-sm' required/>
                    </div>

                    <div className='flex items-center gap-3 border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-3'>
                        <i className="bi bi-lock-fill text-gray-400"></i>
                        <input type="password" placeholder='Create Password' value={password} onChange={(e) => setPassword(e.target.value)} className='bg-transparent outline-none w-full text-sm' required/>
                    </div>

                    <div className='flex items-center gap-3 border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-3'>
                        <i className="bi bi-shield-lock-fill text-gray-400"></i>
                        <input type="password" placeholder='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className='bg-transparent outline-none w-full text-sm' required/>
                    </div>

                    {/* Gradient Register Button */}
                    <button type='submit' className='w-full mt-4 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-bold py-4 rounded-full shadow-lg shadow-blue-200 transition-all active:scale-[0.98]'>
                        Register
                    </button>

                    <button 
                        type="button"
                        className='text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors text-center mt-4'
                        onClick={() => router.push("/login")}
                    >
                        Already have an account? Back to login
                    </button>
                </form>
            </div>
        </div>
    )
}