'use client'
import { useState, useEffect } from 'react'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import bcrypt from 'bcryptjs'
const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function page() {
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
            // Check if email already exists
            const { data: existingUser, error: checkError } = await supabase
                .from('teachers')
                .select('email')
                .eq('email', email)
                .single();

            if (existingUser) {
                alert('Email already exists');
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const { data, error } = await supabase
                .from('teachers')
                .insert([{ email, password: hashedPassword, surname, firstname, middlename, suffix, status: 'Pending' }]);
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
    <div className={`${poppins.className} flex flex-col justify-center items-center
            lg:bg-gray-50 text-black
            w-screen h-screen bg-white`}>
        <div className='flex flex-col items-center p-5 sm:p-5 sm:rounded-lg w-screen h-150
                sm:h-auto sm:w-[50%] lg:w-[30%] bg-white
                sm:shadow-[0_5px_10px_0_rgba(0,0,0,0.5)] text-black'>
            <div className='flex flex-col items-center w-full mb-5'>
                <h1 className='text-2xl font-bold w-full'>Register</h1>
                <label className='w-full'>Please register to login</label>
            </div>
            <form onSubmit={handleRegister} className='grid grid-rows-[1fr_50px] grid-cols-1 justify-center items-center w-full h-full gap-2  '>
                <div className='flex flex-col items-center gap-2 w-full h-full '>
                    
                    <span className='w-[90%] bg-gray-50 p-2 flex flex-rows gap-5 rounded-lg'>
                        <input type="text" placeholder='First Name' value={firstname} onChange={(e) => setFirstname(e.target.value)} className='outline-none w-full' required/>
                    </span>
                    <span className='w-[90%] bg-gray-50 p-2 flex flex-rows gap-5 rounded-lg'>
                        <input type="text" placeholder='Middle Name' value={middlename} onChange={(e) => setMiddlename(e.target.value)} className='outline-none w-full' required/>
                    </span>
                    <span className='w-[90%] bg-gray-50 p-2 flex flex-rows gap-5 rounded-lg'>
                        <input type="text" placeholder='Last Name' value={surname} onChange={(e) => setSurname(e.target.value)} className='outline-none w-full' required/>
                    </span>
                    <span className='w-[90%] bg-gray-50 p-2 flex flex-rows gap-5 rounded-lg'>
                        <input type="text" placeholder='Suffix' value={suffix} onChange={(e) => setSuffix(e.target.value)} className='outline-none w-full' />
                    </span>

                    <span className='w-[95%] h-1 bg-gray-200 rounded-full' />

                    <span className='w-[90%] bg-gray-50 p-2 flex flex-rows gap-5 rounded-lg'>
                        <i className="bi bi-person-circle text-center"></i>
                        <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} className='outline-none w-full' required/>
                    </span>
                    <span className='w-[90%] bg-gray-50 p-2 flex flex-rows gap-5 rounded-lg'>
                        <i className="bi bi-lock-fill text-center"></i>
                        <input type="password" placeholder='Create Password' value={password} onChange={(e) => setPassword(e.target.value)} className='outline-none w-full' required/>
                    </span>
                    <span className='w-[90%] bg-gray-50 p-2 flex flex-rows gap-5 rounded-lg'>
                        <i className="bi bi-shield-lock-fill text-center"></i>
                        <input type="password" placeholder='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className='outline-none w-full' required/>
                    </span>
                </div>
                <button type='submit' className='w-full bg-sky-600 hover:bg-sky-700 text-white 
                         py-2 rounded-md cursor-pointer'
                >
                    Register
                </button>
                <label className='text-sm text-center text-blue-700 
                hover:text-blue-900 cursor-pointer'
                onClick={() => router.push("/login")}>
                    Back to login
                </label>
            </form>
        </div>
    </div>
  )
}
