'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import emailjs from '@emailjs/browser' 
import { supabase } from '@/lib/supabaseClient'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function Send() {

  const [email, setEmail] = useState('')       
  const [loading, setLoading] = useState(false) 
  const router = useRouter()                    

  const generateOTP = () => {                   
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // --- Upsert OTP in Supabase ---
  const handleSendDB = async (email: string, otp: string) => {
    const { error } = await supabase
      .from('teacher_resetpass_otps')
      .upsert(
        {
          email,
          otp,
          created_at: new Date().toISOString()
        },
        {
          onConflict: 'email' // updates the OTP if email exists
        }
      )

    if (error) {
      console.error('Supabase upsert error:', error)
      throw error
    }

    console.log(`OTP for ${email} saved/updated successfully.`)
  }

  // --- Form submit handler ---
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      alert("Please enter your email.")
      return
    }

    setLoading(true)
    const otp = generateOTP()

    try {
      // Send OTP email
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          email: email,
          passcode: otp,             
          time: new Date(Date.now() + 15*60*1000).toLocaleTimeString()
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );

      // Save OTP and email to localStorage
      localStorage.setItem('otp', otp)
      localStorage.setItem('email', email)

      // Upsert OTP into Supabase
      await handleSendDB(email, otp)

      router.push('/forgotpassword/otp')
    } catch (err: any) {
      console.error('Error sending OTP:', err)
      alert(
        `${err?.message || JSON.stringify(err) || 'Failed to send OTP'}\n` +
        `Email: ${email}\nOTP: ${otp}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${poppins.className} fixed bg-white w-screen h-screen text-black
        flex flex-col justify-center items-center`}
    >
        <div className='flex flex-col justify-center items-center 
          lg:shadow-[4px_4px_10px_0_rgba(0,0,0,0.5)] p-10 lg:rounded-md'>
          <i className="bi bi-envelope-fill text-5xl text-green-600"></i>

          <label className='font-extrabold text-[clamp(14px,24px,28px)] mb-5'>
            Enter Email Account
          </label>

          <form 
            className='flex flex-col justify-center items-center w-full'
            onSubmit={handleSendOTP}  // ✅ Form submission
          >
              <input 
                  type="email"
                  value={email}                     
                  onChange={(e) => setEmail(e.target.value)} 
                  required                          
                  className='text-[clamp(12px,18px,24px)] w-full bg-gray-100 rounded-md p-2 outline-none text-center' 
                  placeholder='Enter your email'
              />

              <button 
                className='w-full bg-blue-600 rounded-md text-white p-2 mt-4'
                disabled={loading}                 
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
          </form>
          <button
            className='w-full p-2 mt-4 cursor-pointer text-blue-500 hover:text-blue-700'
            onClick={() => router.push('/login')}
          >
            Back to Login
          </button>
        </div>
    </div>
  )
}
