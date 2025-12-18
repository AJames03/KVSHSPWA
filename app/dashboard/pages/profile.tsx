'use client'
import { useState, useEffect, ChangeEvent } from 'react'
import { Poppins } from 'next/font/google'
import { supabase } from '@/lib/supabaseClient'
import YourSched from '@/app/dashboard/pages/profile/yoursched'
import Information from '@/app/dashboard/pages/profile/setting/information'
import LoadingCircleSpinner from '@/components/LoadingCircleSpinner'
import { motion } from 'framer-motion'
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/lib/cropImage' // helper function to get cropped image
import bcrypt from 'bcryptjs'

const poppins = Poppins({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
})

export default function Profile() {
  const [userName, setUserName] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile')

  const [firstname, setFirstname] = useState('')
  const [displayedFirstname, setDisplayedFirstname] = useState('')
  const [middlename, setMiddlename] = useState('')
  const [surname, setSurname] = useState('')
  const [suffix, setSuffix] = useState('')
  const [honorific, setHonorific] = useState('')
  const [post_nominals, setPost_nominals] = useState('')
  const [greetings, setGreetings] = useState('')
  const [greetDesign, setGreetDesign] = useState('')

  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<'poor' | 'good' | 'strong'>('poor')

  const [showCropModal, setShowCropModal] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  // Helper function to check password strength
  const checkPasswordStrength = (password: string): 'poor' | 'good' | 'strong' => {
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const length = password.length

    if (length >= 10 && hasUpper && hasNumber && hasSpecial) return 'strong'
    if (length >= 8 && hasUpper && hasNumber) return 'good'
    return 'poor'
  }

  // Helper function to generate unique filename
  const getUniqueFileName = (baseName: string) => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `${timestamp}_${random}_${baseName}`
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // 🔹 Fetch teacher data
  const fetchUserName = async () => {
    const email = localStorage.getItem('userEmail')
    if (!email) return

    const { data, error } = await supabase
      .from('teachers')
      .select('surname, firstname, middlename, suffix, honorific, post_nominals, profile_pic')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching teacher:', error)
      return
    }

    if (data) {
      setFirstname(data.firstname ?? '')
      setDisplayedFirstname(data.firstname ?? '')
      setMiddlename(data.middlename ?? '')
      setSurname(data.surname ?? '')
      setSuffix(data.suffix ?? '')
      setHonorific(data.honorific ?? '')
      setPost_nominals(data.post_nominals ?? '')
      setProfilePic(data.profile_pic ?? null)

      const isAllNull =
        data.firstname === null &&
        data.middlename === null &&
        data.surname === null

      setUserName(
        isAllNull
          ? null
          : `${data.firstname ?? ''} ${data.middlename ?? ''} ${data.surname ?? ''}`.trim()
      )
    }
  }

  useEffect(() => {
    if (!mounted) return
    fetchUserName()
  }, [mounted])

  // 🔹 Image select
  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setSelectedImage(e.target.files[0])
    setShowCropModal(true)
  }

  // 🔹 Crop modal helpers
  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleCropSave = async () => {
    if (!selectedImage || !croppedAreaPixels) return

    const croppedBlob = await getCroppedImg(URL.createObjectURL(selectedImage), croppedAreaPixels)
    setCroppedImage(croppedBlob)

    // Auto-save the cropped image to profile_pic
    setUploading(true)
    try {
      const email = localStorage.getItem('userEmail')
      if (!email) return


    const file = new File([croppedBlob], selectedImage.name, { type: croppedBlob.type });

    const fileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');

    let uniqueFileName = getUniqueFileName(fileName)

    const { error: uploadError } = await supabase.storage
      .from('teacher-profiles')
      .upload(uniqueFileName, file, {
        upsert: false, // important para hindi ma-overwrite
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return
    }

    const { data } = supabase.storage
      .from('teacher-profiles')
      .getPublicUrl(uniqueFileName)

    const imageUrl = data.publicUrl

    const { error } = await supabase
      .from('teachers')
      .update({ profile_pic: imageUrl })
      .eq('email', email)

    if (error) {
      console.error('Save error:', error)
    } else {
      setProfilePic(imageUrl)
      setSelectedImage(null)
      setCroppedImage(null)
      setShowCropModal(false)
    }
    } finally {
      setUploading(false)
    }
  }


  // 🔹 Upload image to Supabase Storage
  const uploadProfilePic = async () => {
    if (!croppedImage && !selectedImage) return null

    setUploading(true)

    try {
      const email = localStorage.getItem('userEmail')
      if (!email) return null

      const file = croppedImage || selectedImage
      const fileExt = (file as File).name?.split('.').pop() || 'png'
      const fileName = `${email.replace(/[@.]/g, '_')}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('teacher-profiles')
        .upload(fileName, file as File, {
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data } = supabase.storage
        .from('teacher-profiles')
        .getPublicUrl(fileName)

      return data.publicUrl
    } finally {
      setUploading(false)
    }
  }

  // 🔹 Save profile info + picture
  const handleSave = async () => {
    setLoading(true)

    try {
      const email = localStorage.getItem('userEmail')
      if (!email) return

      let imageUrl = profilePic

      if (selectedImage) {
        const uploadedUrl = await uploadProfilePic()
        if (uploadedUrl) imageUrl = uploadedUrl
      }

      const { error } = await supabase
        .from('teachers')
        .update({
          firstname,
          middlename,
          surname,
          suffix,
          honorific,
          post_nominals,
        })
        .eq('email', email)

      if (error) {
        console.error('Save error:', error)
      } else {
        setSelectedImage(null)
        setCroppedImage(null)
        await fetchUserName()
      }
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Change password
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (passwordStrength === 'poor') {
      alert('Password is too weak. Please choose a stronger password.')
      return
    }

    setChangingPassword(true)

    try {
      const email = localStorage.getItem('userEmail')
      if (!email) return

      const hashedPassword = await bcrypt.hash(newPassword, 10)

      const { error } = await supabase
        .from('teachers')
        .update({ password: hashedPassword })
        .eq('email', email)

      if (error) {
        console.error('Error changing password:', error)
      } else {
        alert('Password changed successfully')
        setNewPassword('')
        setConfirmPassword('')
      }
    } finally {
      setChangingPassword(false)
    }
  }

  useEffect(() => {
    const hour = new Date().getHours()

    if(hour < 12){
      setGreetings('Good Morning')
      setGreetDesign('bg-gradient-to-br from-yellow-200 to-yellow-300')
    }
    else if(hour < 18){
      setGreetings('Good Afternoon')
      setGreetDesign('bg-gradient-to-br from-sky-400 to-blue-600')
    }
    else{
      setGreetings('Good Evening')
      setGreetDesign('bg-gradient-to-br from-indigo-700 to-purple-900')
    }
  }, [])

  return (
    <div className={`${poppins.className} w-full h-full bg-white p-2 lg:p-4`}>
      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-[1fr_500px] space-y-6">
        <div className='space-y-4'>

        {/* 🔹 Profile Picture */}
        <div className='relative w-full lg:w-120'>
          <div className={`absolute top-0 left-0 w-full h-full ${greetDesign} z-0 rounded-md`}>
          </div>
          <div className='flex flex-col items-center p-2 '>
            <div className='relative w-24 h-24  overflow-hidden '>
              {croppedImage || selectedImage || profilePic ? (
                <img
                  src={
                    croppedImage
                      ? URL.createObjectURL(croppedImage)
                      : selectedImage
                      ? URL.createObjectURL(selectedImage)
                      : profilePic || undefined
                  }
                  alt='Profile'
                  className='w-full h-full rounded-full object-cover'
                />
              ) : (
                <div className='w-full h-full rounded-full bg-gray-200 flex items-center justify-center'>
                  <i className="bi bi-person-fill text-4xl text-gray-500"></i>
                </div>
              )}

              <label className="absolute z-20 bottom-0 right-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer shadow-4xl">
                <i className="bi bi-camera-fill text-xl"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Profile Name*/}
            <p className='font-semibold text-white text-[clamp(1rem,2.5vw,1.5rem)] z-0'>
              {greetings + ', ' }{displayedFirstname ?? 'Please complete your information'}
            </p>
          </div>
        </div>
        <div className='h-auto w-auto'>
          <YourSched />
        </div>
      </div>
      <div className='flex flex-col gap-3 bg-white overflow-auto p-2 h-[clamp(300px,calc(100vh-120px),700px)]'>
        <span className='flex flex-row text-[clamp(1rem,2.5vw,1.3rem)] items-center gap-2 p-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)]
                        h-12 rounded-md'>
          <i className="bi bi-gear"></i>
          <p className="font-bold">Setting</p>
        </span>
        <div className='shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] p-5 lg:rounded-md'>
          <Information
            firstname={firstname}
            setFirstname={setFirstname}
            middlename={middlename}
            setMiddlename={setMiddlename}
            surname={surname}
            setSurname={setSurname}
            suffix={suffix}
            setSuffix={setSuffix}
            honorific={honorific}
            setHonorific={setHonorific}
            post_nominals={post_nominals}
            setPost_nominals={setPost_nominals}
            loading={loading}
            uploading={uploading}
            handleSave={handleSave}
          />
        </div>
        <div className='shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] p-5 lg:rounded-md mt-4'>
          <h3 className='text-lg font-semibold mb-4'>Change Password</h3>
          <div className='space-y-3'>
            <label>New Password</label>
            <input
              type='password'
              placeholder='Enter New Password'
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setPasswordStrength(checkPasswordStrength(e.target.value))
              }}
              className='w-full border p-2 rounded'
            />
            <label>Confirm Password</label>
            <input
              type='password'
              placeholder='Confirm Password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full border p-2 rounded'
            />
            <p className={`text-sm font-medium ${
              passwordStrength === 'strong' ? 'text-green-600' :
              passwordStrength === 'good' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              Password Strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
            </p>
            <div className='flex justify-center items-center w-full'>
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className='px-4 py-2 bg-blue-500 text-white rounded flex justify-center items-center gap-2 w-70 cursor-pointer'
              >
                {changingPassword ? <LoadingCircleSpinner /> : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden h-full overflow-auto grid-rows-[10px_1fr]">
        <div className="flex  mb-4 space-x-2 ">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <i
              className={`bi ${
                activeTab === 'profile' ? 'bi-person-fill' : 'bi-person'
              }`}
            ></i>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded ${activeTab === 'settings' ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            <i
              className={`bi ${
                activeTab === 'settings' ? 'bi-gear-fill' : 'bi-gear'
              }`}
            ></i>
          </button>
        </div>
        {activeTab === 'profile' && (
          <div className='space-y-4 '>
            {/* 🔹 Profile Picture */}
            <div className='relative w-full lg:w-120'>
              <div className={`absolute top-0 left-0 w-full h-full ${greetDesign} z-0 rounded-md`}>
              </div>
              <div className='flex flex-col items-center p-2 '>
                <div className='relative w-24 h-24  overflow-hidden '>
                  {croppedImage || selectedImage || profilePic ? (
                    <img
                      src={
                        croppedImage
                          ? URL.createObjectURL(croppedImage)
                          : selectedImage
                          ? URL.createObjectURL(selectedImage)
                          : profilePic || undefined
                      }
                      alt='Profile'
                      className='w-full h-full rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full rounded-full bg-gray-200 flex items-center justify-center'>
                      <i className="bi bi-person-fill text-4xl text-gray-500"></i>
                    </div>
                  )}

                  <label className="absolute z-20 bottom-0 right-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer shadow-4xl">
                    <i className="bi bi-camera-fill text-xl"></i>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Profile Name*/}
                <p className='font-semibold text-white text-[clamp(1rem,2.5vw,1.5rem)] z-0'>
                  {greetings + ', ' }{displayedFirstname ?? 'Please complete your information'}
                </p>
              </div>
            </div>
            <div className='h-auto w-auto'>
              <YourSched />
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className='w-full flex justify-center items-center'>
            <div className='flex flex-col gap-3 w-full md:w-[70%] p-1'>
              <span className='flex flex-row text-[clamp(1rem,2.5vw,1.3rem)] items-center gap-2 p-2 shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)]
                              h-12 rounded-md'>
                <i className="bi bi-gear"></i>
                <p className="font-bold">Setting</p>
              </span>
              <div className='shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] p-5 lg:rounded-md'>
                <Information
                  firstname={firstname}
                  setFirstname={setFirstname}
                  middlename={middlename}
                  setMiddlename={setMiddlename}
                  surname={surname}
                  setSurname={setSurname}
                  suffix={suffix}
                  setSuffix={setSuffix}
                  honorific={honorific}
                  setHonorific={setHonorific}
                  post_nominals={post_nominals}
                  setPost_nominals={setPost_nominals}
                  loading={loading}
                  uploading={uploading}
                  handleSave={handleSave}
                />
              </div>
              <div className='shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] p-5 lg:rounded-md mt-4'>
                <h3 className='text-lg font-semibold mb-4'>Change Password</h3>
                <div className='space-y-3'>
                  <label>New Password</label>
                  <input
                    type='password'
                    placeholder='Enter New Password'
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      setPasswordStrength(checkPasswordStrength(e.target.value))
                    }}
                    className='w-full border p-2 rounded'
                  />
                  <label>Confirm Password</label>
                  <input
                    type='password'
                    placeholder='Confirm Password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='w-full border p-2 rounded'
                  />
                  <p className={`text-sm font-medium ${
                    passwordStrength === 'strong' ? 'text-green-600' :
                    passwordStrength === 'good' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    Password Strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                  </p>
                  <div className='flex justify-center items-center w-full'>
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className='px-4 py-2 bg-blue-500 text-white rounded flex justify-center items-center gap-2 w-70 cursor-pointer'
                    >
                      {changingPassword ? <LoadingCircleSpinner /> : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🔹 Crop Modal */}
      {showCropModal && selectedImage && (
        <div className="fixed inset-0 bg-black/50 p-5 lg:p-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative flex flex-col items-center">
            {/* Cropper Area */}
            <div className="relative w-full h-80 bg-gray-100 rounded overflow-hidden">
              <Cropper
                image={URL.createObjectURL(selectedImage)}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom Slider */}
            <div className="w-full mt-4">
              <label className="block text-sm font-medium mb-1">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 w-full">
              <button
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCropSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {loading || uploading ? <LoadingCircleSpinner /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
