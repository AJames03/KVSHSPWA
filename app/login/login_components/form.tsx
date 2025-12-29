"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
// Using public icon path instead
import { useRouter } from "next/navigation";
import LoadingScreen from '@/app/loading/page'
import { Poppins } from 'next/font/google'
import bcrypt from 'bcryptjs'

const poppins = Poppins({
  weight: ['400', '600', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function Form() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    const email = localStorage.getItem("userEmail");
    if (loggedIn === "true" && email) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        alert("User not found");
        setLoading(false);
        return;
      }

      if (data.status !== "Approved") {
        alert("Your account is not approved yet.");
        setLoading(false);
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, data.password);
      if (!isPasswordValid) {
        alert("Incorrect password");
        setLoading(false);
        return;
      }

      await supabase
        .from("teachers")
        .update({ is_logged_in: true })
        .eq("email", data.email);

      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userEmail", email);
      router.replace("/dashboard");

    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    // Main background with the soft blue gradient from the image
    <div className={`min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-200 ${poppins.className}`}>
      
      {/* Container styled as a floating mobile card */}
      <div className='flex flex-col justify-center items-center p-8 rounded-[2.5rem] w-[90%] max-w-[400px] bg-white shadow-2xl shadow-blue-200/50 text-black'>
        
        {/* Logo and Branding */}
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <img src={Logo.src} className='w-10 h-10' alt="logo" />
            </div>
            <h1 className='text-3xl font-bold text-slate-800 tracking-tight'>KVSHS LIS</h1>
        </div>

        <form onSubmit={handleLogin} className='flex flex-col w-full gap-5'>
          
          {/* Email Input */}
          <div className='relative w-full border border-gray-200 rounded-xl bg-gray-50/50'>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-4 bg-transparent outline-none text-sm'
              required
            />
          </div>

          {/* Password Input */}
          <div className='relative w-full border border-gray-200 rounded-xl bg-gray-50/50'>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-4 py-4 bg-transparent outline-none text-sm'
              required
            />
          </div>

          {/* Gradient Button from Design */}
          <button
            type="submit"
            disabled={loading}
            className='w-full mt-2 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white 
            font-bold py-4 rounded-full shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:bg-gray-300'>
              {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="flex flex-row justify-between w-full mt-8 px-2">
          <button 
            onClick={() => router.push("/forgotpassword")}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
          >
            Forget Password
          </button>

          <button 
            onClick={() => router.push("/register")}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
          >
            Create an Account
          </button>
        </div>

=======
    <div className='flex flex-col justify-center items-center p-6 sm:p-8 sm:rounded-2xl w-full max-w-md mx-auto
    sm:shadow-2xl sm:border sm:border-gray-100 bg-white text-gray-800'>

      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <img src="/icon-192.png" className='w-16 h-16 rounded-xl' alt="kshslogo" />
        </div>
        <h1 className={`${poppins.className} text-3xl font-bold text-gray-800 mb-1`}>Welcome Back</h1>
        <p className="text-sm text-gray-500">Sign in to continue to KVSHS LIS</p>
      </div>

      <form onSubmit={handleLogin} className='flex flex-col w-full gap-5'>

        <div className='relative w-full group'>
          <input
            type="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none
            transition-all duration-200 focus:bg-white focus:border-sky-500'
            required
          />
          <label className='absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none
            peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
            peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-xs peer-focus:text-sky-600
            peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-sky-600
            peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-2'>
            <i className="bi bi-envelope mr-1"></i>
            Email Address
          </label>
        </div>

        <div className='relative w-full group'>
          <input
            type="password"
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='peer w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none
            transition-all duration-200 focus:bg-white focus:border-sky-500'
            required
          />
          <label className='absolute left-4 top-3 text-gray-500 transition-all duration-200 pointer-events-none
            peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
            peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-xs peer-focus:text-sky-600
            peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-sky-600
            peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-2'>
            <i className="bi bi-lock mr-1"></i>
            Password
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className='w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700
          text-white font-semibold py-3.5 rounded-xl cursor-pointer disabled:from-gray-400 disabled:to-gray-400
          disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
          flex items-center justify-center gap-2'>
           {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
           ) : (
            <>
              Sign In
              <i className="bi bi-arrow-right"></i>
            </>
           )}
        </button>
      </form>

      <div className={`${poppins.className} flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 w-full`}>
        <button
          className="text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
          onClick={() => router.push("/forgotpassword")}
        >
          Forgot Password?
        </button>

        <span className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full" />

        <button
          className="text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
          onClick={() => router.push("/register")}>
          Create Account
        </button>
>>>>>>> ec1cb0481abbfd282cbd2a95b2d2c61c7266fb32
      </div>

      {loading && <LoadingScreen />}
    </div>
  );
}