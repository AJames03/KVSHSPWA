"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
// Using public icon path instead
import { useRouter } from "next/navigation";
import LoadingScreen from '@/app/loading/page'
import { Poppins } from 'next/font/google'
import bcrypt from 'bcryptjs'
import Logo from '@/app/favicon.ico'

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

      </div>

      {loading && <LoadingScreen />}
    </div>
  );
}
