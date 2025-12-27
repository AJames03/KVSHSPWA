'use client'
// Using public icon path instead
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['400', '600', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function about() {
  return (
    <div className='flex flex-col items-center text-center space-y-6'>
        <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
          <img src="/icon-192.png" className='w-16 h-16 rounded-xl' alt="kshslogo" />
        </div>

        <div>
          <h2 className={`${poppins.className} text-2xl font-bold text-gray-800 mb-2`}>About KVSHS LIS</h2>
          <p className={`${poppins.className} text-gray-600`}>Learning Information System</p>
        </div>

        <div className="space-y-4 text-left w-full">
          <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl">
            <i className="bi bi-phone text-2xl text-sky-600 flex-shrink-0"></i>
            <div>
              <h3 className={`${poppins.className} font-semibold text-gray-800 mb-1`}>Mobile-First Design</h3>
              <p className="text-sm text-gray-600">Install this app on your phone for quick access to student records and school data.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
            <i className="bi bi-wifi-off text-2xl text-green-600 flex-shrink-0"></i>
            <div>
              <h3 className={`${poppins.className} font-semibold text-gray-800 mb-1`}>Works Offline</h3>
              <p className="text-sm text-gray-600">Access your data even without an internet connection after initial load.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">
            <i className="bi bi-lightning-charge text-2xl text-orange-600 flex-shrink-0"></i>
            <div>
              <h3 className={`${poppins.className} font-semibold text-gray-800 mb-1`}>Fast & Efficient</h3>
              <p className="text-sm text-gray-600">Optimized for speed and performance on all devices.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 w-full">
          <p className="text-sm text-gray-500">Version 1.0.0</p>
        </div>
    </div>
  )
}
