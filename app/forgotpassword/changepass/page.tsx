'use client'

import { useRef, useState, useEffect } from 'react'
import { Poppins } from 'next/font/google'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import bcrypt from 'bcryptjs'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function page() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [strength, setStrength] = useState<'' | 'Poor' | 'Good' | 'Strong'>('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const email = localStorage.getItem('email')
        if (email) setEmail(email)
    }, [])

    // Function to calculate password strength
    const checkPasswordStrength = (pass: string): '' | 'Poor' | 'Good' | 'Strong' => {
        if (!pass) return ''
        if (pass.length < 6) return 'Poor'
        if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) ) {
            if (/[^A-Za-z0-9]/.test(pass) && pass.length >= 10) return 'Strong'
            return 'Good'
        }
        return 'Poor'
    }

    useEffect(() => {
        setStrength(checkPasswordStrength(password))
    }, [password])

    // Optional: color based on strength
    const strengthColor = {
        Poor: 'bg-red-500',
        Good: 'bg-yellow-400',
        Strong: 'bg-green-500'
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (strength === 'Poor') {
            setError('Password is too weak. Please choose a stronger password.')
            return
        }
        setLoading(true)
        try {
            const hashedPassword = await bcrypt.hash(password, 10)
            const { data, error } = await supabase.from('teachers').update({ password: hashedPassword }).eq('email', email).select()
            if (error) throw error
            if (!data || data.length === 0) throw new Error('Email not found in teachers table')
            localStorage.removeItem('email')
            router.push('/login')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

  return (
    <div
      className={`${poppins.className} fixed bg-white w-screen h-screen text-black flex flex-col justify-center items-center`}
    >
      <div className="flex flex-col justify-center items-center lg:shadow-[4px_4px_10px_0_rgba(0,0,0,0.5)] p-8 lg:rounded-md">
        <i className="bi bi-unlock2-fill text-5xl text-blue-600 mb-3"></i>

        <label className="font-extrabold text-[clamp(14px,24px,28px)]">
          Enter New Password
        </label>

        <p className="text-sm text-gray-500 mb-4 w-full text-center border-b border-gray-200 py-2">
          <b>{email}</b>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5 justify-center items-center">

            <span className="relative w-64 border-b border-gray-400">
                <label>Enter New Password</label>
                <input 
                    type="password" 
                    placeholder=' '
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="peer w-full focus:border-blue-500 outline-none" 
                    required
                />
                <span className="absolute left-0 bottom-0 h-0.5 w-full bg-blue-500
                                scale-x-0 origin-center transition-transform duration-300
                                peer-focus:scale-x-100 peer-not-placeholder-shown:scale-x-100" />
            </span>

            <span className="relative w-64 border-b border-gray-400">
                <label>Confirm Password</label>
                <input 
                    type="password" 
                    placeholder=' '
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="peer w-full focus:border-blue-500 outline-none" 
                    required
                />
                <span className="absolute left-0 bottom-0 h-0.5 w-full bg-blue-500
                                scale-x-0 origin-center transition-transform duration-300
                                peer-focus:scale-x-100 peer-not-placeholder-shown:scale-x-100" />
            </span>

            {/* Password strength indicator */}
            {strength && <p className="text-sm mt-1">{strength} password</p>}

          
            {strength && (
                <div className="relative w-64 h-2 rounded-full">
                    <div className='absolute h-1 w-full top-0 left-0 rounded-full bg-gray-300 z-4'></div>
                    <div className={`h-1 absolute top-0 rounded-full ${strengthColor[strength]} z-5`} style={{ width: strength === 'Poor' ? '33%' : strength === 'Good' ? '66%' : '100%' }}></div>
                </div>
            )}

            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
            text-white font-semibold py-2 px-4 rounded focus:outline-none
            focus:shadow-outline w-full"
            >
                {loading ? 'Updating...' : 'Submit'}
            </button>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  )
}
