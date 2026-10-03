import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    soundManager.playClick();
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Install app to your device"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2e1d13] border border-[#482c1b] text-[#f5af65] hover:bg-[#3d2719] hover:text-white text-xs font-medium transition-all shadow-sm"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#1b120c] border border-[#3b2416] p-6 text-[#f5efe6] shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#2d1c12] rounded-xl text-[#f5af65]">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-display text-white">Add to iPhone / iPad</h3>
            </div>
            <p className="text-xs text-[#b8a291] leading-relaxed mb-4">
              To install this cafe simulator directly on iOS:
            </p>
            <ol className="text-xs text-[#cfc0b3] space-y-2 list-decimal list-inside bg-[#130b06] p-3 rounded-xl border border-[#2b180d]">
              <li>Tap the <strong className="text-white">Share</strong> button in Safari (square with up arrow).</li>
              <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</li>
              <li>Tap <strong className="text-white">Add</strong> in top-right.</li>
            </ol>
            <button
              onClick={() => {
                soundManager.playClick();
                setShowIOSGuide(false);
              }}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#c88d58] text-[#1c120a] font-semibold text-xs hover:bg-[#d99b66] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
