'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear login info
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail"); // optional

    // Redirect to login
    router.replace("/login");
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  )
}
