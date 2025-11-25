"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Logo from '@/app/favicon.ico';
import { useRouter } from "next/navigation";


export default function Form() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const forgetPassword = () => {
    router.push("/login/otp");
  }

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard"); // redirect to dashboard if logged in
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Query sa Supabase table
    const { data: user, error } = await supabase
      .from("AppUsers")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      alert("Invalid email");
      console.log(error);
      return;
    }

    // Compare password (plain text version)
    if (user.password !== password) {
      alert("Invalid password");
      return;
    }

    // Optional: set session in Supabase (if not using Supabase auth directly)
    await supabase.auth.setSession({ access_token: "dummy-token" });

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userEmail", email); 
    router.replace("/dashboard");
  };

  return (
    <div className='flex flex-col justify-center items-center sm:p-5 sm:rounded-lg w-screen h-screen
    sm:w-[50%] sm:h-[80%] lg:w-[30%] lg:h-[70%] bg-gradient-to-b from-gray-50 via-sky-50 to-sky-100
    sm:shadow-[0_5px_10px_0_rgba(0,0,0,0.5)] text-black'>
      
      <img src={Logo.src} className='w-20 h-20 self-center' alt="kshslogo" />
      <label className='text-2xl font-bold text-sky-700'>KVSHS LIS</label>

      <form onSubmit={handleLogin} className='flex flex-col w-screen sm:w-full gap-3 p-2'>
        
        <div className='relative w-full lg:w-full'>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='peer w-full border border-gray-400 rounded-md px-3 py-2 bg-white outline-none focus:border-blue-500'
            required
          />
          <label className='absolute left-3 top-2 text-gray-500 transition-all
            peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
            peer-focus:-top-2 peer-focus:bg-white peer-focus:text-xs peer-focus:text-gray-700
            peer-valid:-top-2 peer-valid:bg-white peer-valid:text-xs peer-valid:text-gray-700'>
            Email
          </label>
        </div>

        <div className='relative lg:w-full'>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='peer w-full border border-gray-400 rounded-md px-3 py-2 bg-white outline-none focus:border-blue-500'
            required
          />
          <label className='absolute left-3 top-2 text-gray-500 transition-all
            peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
            peer-focus:-top-2 peer-focus:bg-white peer-focus:text-xs peer-focus:text-gray-700
            peer-valid:-top-2 peer-valid:bg-white peer-valid:text-xs peer-valid:text-gray-700'>
            Password
          </label>
        </div>

        <button type="submit" className='w-full bg-sky-600 hover:bg-sky-700 text-white 
          font-semibold py-2 rounded-md cursor-pointer'>Login</button>
      </form>
      <label className="text-sky-500 hover:text-sky-700 cursor-pointer" onClick={forgetPassword}>Forget Password</label>
    </div>
  );
}
