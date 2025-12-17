'use client'

import { useRef, useState, useEffect } from 'react'
import { Poppins } from 'next/font/google'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function OTPPage() {
  const router = useRouter()

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [email, setEmail] = useState('')
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  // ✅ Get email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('email')
    if (!storedEmail) {
      alert('Email not found. Please try again.')
      router.push('/forgotpassword')
      return
    }
    setEmail(storedEmail)
  }, [router])

  // 🔢 Numbers only + auto focus
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  // ⬅ Backspace behavior
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  // ✅ Verify OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      alert('Please complete the OTP')
      return
    }

    // 1️⃣ Check OTP
    const { data, error } = await supabase
      .from('teacher_resetpass_otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otpCode)
      .single()

    if (error || !data) {
      alert('Invalid or expired OTP')
      return
    }

    // 2️⃣ Clear OTP
    const { error: clearError } = await supabase
      .from('teacher_resetpass_otps')
      .update({ otp: null })
      .eq('email', email)

    if (clearError) {
      alert('OTP verified but failed to clear OTP')
      return
    }

    // 3️⃣ Success
    router.push('/forgotpassword/changepass')
  }

  return (
    <div
      className={`${poppins.className} fixed bg-white w-screen h-screen text-black flex flex-col justify-center items-center`}
    >
      <div className="flex flex-col justify-center items-center lg:shadow-[4px_4px_10px_0_rgba(0,0,0,0.5)] p-10 lg:rounded-md">
        <i className="bi bi-shield-fill-exclamation text-5xl text-green-600 mb-3"></i>

        <label className="font-extrabold text-[clamp(14px,24px,28px)]">
          Enter OTP Code
        </label>

        <p className="text-sm text-gray-500 mb-4 text-center">
          OTP sent to <b>{email}</b>
        </p>

        <form
          className="flex flex-col justify-center items-center"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-row gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el: HTMLInputElement | null) => {
                  inputsRef.current[index] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 rounded-md text-white p-2 mt-4"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  )
}
