'use client';

import { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // 1. I-save ang Event
    const handler = (e: any) => {
      // Pigilan ang browser na awtomatikong magpakita ng prompt
      e.preventDefault();

      // I-save ang event reference para magamit mamaya
      setDeferredPrompt(e);

      // Ipakita ang button
      setShowInstallButton(true);
    };

    // Pakinggan ang event na ito sa window
    window.addEventListener('beforeinstallprompt', handler);

    // Linisin ang event listener kapag nawala ang component
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // 2. Itago ang button (opsyonal)
      setShowInstallButton(false);

      // 3. I-trigger ang installation prompt
      deferredPrompt.prompt();

      // Hintayin ang tugon ng user
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`User response to the install prompt: ${outcome}`);

      // I-reset ang deferredPrompt (opsyonal)
      setDeferredPrompt(null);
    }
  };

  if (!showInstallButton) {
    return null; // Huwag ipakita kung hindi pa handa ang browser
  }

  return (
    <button
      onClick={handleInstallClick}
      style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      {/* 4. I-display ang Button (Gamit ang iyong icon o text) */}
      📥 Install App (PWA)
    </button>
  );
};

export default InstallPrompt;