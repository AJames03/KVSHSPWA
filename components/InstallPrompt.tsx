'use client';

import { useState, useEffect } from 'react';
import Logo from '@/app/favicon.ico'

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 1. I-save ang Event
    const handler = (e: any) => {
      // Pigilan ang browser na awtomatikong magpakita ng prompt
      e.preventDefault();

      // I-save ang event reference para magamit mamaya
      setDeferredPrompt(e);

      // Ipakita ang modal
      setShowModal(true);
    };

    // Pakinggan ang event na ito sa window
    window.addEventListener('beforeinstallprompt', handler);

    // Linisin ang event listener kapag nawala ang component
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Itago ang modal
      setShowModal(false);

      // 3. I-trigger ang installation prompt
      deferredPrompt.prompt();

      // Hintayin ang tugon ng user
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User response to the install prompt: ${outcome}`);

      // I-reset ang deferredPrompt (opsyonal)
      setDeferredPrompt(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (!showModal) {
    return null; // Huwag ipakita kung hindi pa handa ang browser
  }

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className='flex justify-center items-center w-full h-full bg-white z-0'>
        <img src={Logo.src} className='w-50 h-50 self-center' alt="kshslogo" />
      </div>
      <span className='bg-black/50 backdrop-blur-xs fixed inset-0 z-1'/>
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-lg z-2">
        <div className="text-center">
          <div className="mb-4">
            <i className="bi bi-download text-4xl text-blue-500"></i>
          </div>
          <h2 className="text-xl font-bold mb-2">Install KVSHS LIS</h2>
          <p className="text-gray-600 mb-6">
            Install our app for a better experience with offline access and quick launch from your home screen.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Not Now
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Install App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;