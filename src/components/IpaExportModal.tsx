import React, { useState } from 'react';
import { generateIpaBundle, downloadBlob } from '../utils/ipaGenerator';
import { Download, Smartphone, Apple, CheckCircle2, X, Terminal, HelpCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface IpaExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cafeName: string;
}

export const IpaExportModal: React.FC<IpaExportModalProps> = ({ isOpen, onClose, cafeName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'ipa' | 'sideload' | 'safari' | 'xcode'>('ipa');

  if (!isOpen) return null;

  const handleDownloadIpa = async () => {
    try {
      setIsGenerating(true);
      soundManager.playClick();
      const ipaBlob = await generateIpaBundle(cafeName || 'BrewCraft');
      const filename = `${(cafeName || 'BrewCraft').replace(/[^a-zA-Z0-9]/g, '')}.ipa`;
      downloadBlob(ipaBlob, filename);
      soundManager.playSuccessChime();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate IPA', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#18110b] border border-[#3d281a] rounded-2xl shadow-2xl overflow-hidden text-[#f4ece3] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d1c12] bg-[#1f150e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c88d58] to-[#8d5427] flex items-center justify-center text-white shadow-md">
              <Apple className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white tracking-tight">
                iOS Package & IPA Export
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#a89281]">
                <span>App Bundle: com.specialtycoffee.brewcraft</span>
                <span>·</span>
                <span>iOS 14.0+</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#a89281] hover:text-white hover:bg-[#2d1c12] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#2d1c12] px-6 bg-[#140d08]">
          <button
            onClick={() => setActiveTab('ipa')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'ipa'
                ? 'border-[#c88d58] text-[#f5af65]'
                : 'border-transparent text-[#9a8677] hover:text-[#e4d6c7]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Download .IPA
          </button>
          <button
            onClick={() => setActiveTab('sideload')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'sideload'
                ? 'border-[#c88d58] text-[#f5af65]'
                : 'border-transparent text-[#9a8677] hover:text-[#e4d6c7]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Sideload Guide
          </button>
          <button
            onClick={() => setActiveTab('safari')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'safari'
                ? 'border-[#c88d58] text-[#f5af65]'
                : 'border-transparent text-[#9a8677] hover:text-[#e4d6c7]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Safari 1-Tap Install
          </button>
          <button
            onClick={() => setActiveTab('xcode')}
            className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'xcode'
                ? 'border-[#c88d58] text-[#f5af65]'
                : 'border-transparent text-[#9a8677] hover:text-[#e4d6c7]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Xcode / Capacitor
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'ipa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#24170f] border border-[#3f291a] flex items-start gap-4">
                <div className="p-3 bg-[#332014] rounded-xl text-[#f5af65] shrink-0">
                  <Apple className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-white">Direct iOS Application Archive (.ipa)</h3>
                  <p className="text-xs text-[#b8a291] leading-relaxed">
                    This bundles the entire BrewCraft simulator into a standard Apple iOS IPA archive containing{' '}
                    <code className="bg-[#18110b] px-1.5 py-0.5 rounded text-[#e0a875]">Payload/BrewCraft.app/Info.plist</code>, icon assets, webview runtime wrapper, and configuration.
                  </p>
                </div>
              </div>

              <div className="bg-[#120a05] p-4 rounded-xl border border-[#26150b] space-y-2 text-xs text-[#a89281]">
                <div className="flex justify-between py-1 border-b border-[#24150c]">
                  <span>Package Type</span>
                  <span className="text-white font-mono">iOS App Archive (.ipa)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#24150c]">
                  <span>Bundle ID</span>
                  <span className="text-white font-mono">com.specialtycoffee.brewcraft</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#24150c]">
                  <span>Minimum iOS Target</span>
                  <span className="text-white font-mono">iOS 14.0+ / iPadOS</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Display Mode</span>
                  <span className="text-white font-mono">Standalone Fullscreen</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDownloadIpa}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#d98943] to-[#b36322] hover:from-[#e59b58] hover:to-[#c6742e] text-[#1a0f08] font-semibold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#1a0f08] border-t-transparent rounded-full animate-spin" />
                      <span>Compiling iOS Application Payload...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-950" />
                      <span>{cafeName || 'BrewCraft'}.ipa Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Generate & Download {cafeName || 'BrewCraft'}.ipa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sideload' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-base">How to install the .ipa on your iPhone / iPad</h3>
              <p className="text-xs text-[#b8a291]">
                Unsigned iOS apps (.ipa) can be loaded onto any physical iPhone or iPad using free, trusted sideloading tools:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#21140c] border border-[#3b2416] rounded-xl space-y-1.5">
                  <div className="font-semibold text-[#f5af65] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3d2516] flex items-center justify-center text-xs text-white">1</span>
                    Sideloadly (Recommended for PC & Mac)
                  </div>
                  <p className="text-xs text-[#b09d8e] pl-7">
                    1. Download Sideloadly from sideloadly.io.<br />
                    2. Connect iPhone via USB wire.<br />
                    3. Drag your downloaded <code className="text-[#f5af65]">.ipa</code> into Sideloadly and click Start.<br />
                    4. On iPhone: Go to <span className="text-white">Settings → General → VPN & Device Management</span> and tap Trust.
                  </p>
                </div>

                <div className="p-3.5 bg-[#21140c] border border-[#3b2416] rounded-xl space-y-1.5">
                  <div className="font-semibold text-[#f5af65] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#3d2516] flex items-center justify-center text-xs text-white">2</span>
                    AltStore / TrollStore
                  </div>
                  <p className="text-xs text-[#b09d8e] pl-7">
                    Open AltStore or TrollStore on iOS, tap the "+" button, select the downloaded <code className="text-[#f5af65]">.ipa</code> from your Files app to install directly on-device.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'safari' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#23160e] border border-[#3d2618] rounded-xl space-y-3">
                <h3 className="font-semibold text-[#f5af65] text-base">Instant Native iOS Experience (No PC Needed)</h3>
                <p className="text-xs text-[#bfaea0] leading-relaxed">
                  Apple Safari includes built-in PWA WebClip support that runs this exact application in 100% full-screen standalone mode with native iOS splash screen, app icon, and persistent offline storage:
                </p>

                <ol className="space-y-2.5 text-xs text-[#cfc0b3] list-decimal list-inside pl-2">
                  <li>Open this coffee shop app inside Safari on your iPhone or iPad.</li>
                  <li>Tap the <strong className="text-white">Share</strong> icon (the square with an arrow pointing up) in the Safari toolbar.</li>
                  <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</li>
                  <li>Tap <strong className="text-white">Add</strong> in the top-right corner.</li>
                </ol>
                <div className="p-3 bg-[#170e09] rounded-lg border border-[#2b170b] text-[11px] text-[#9c8979]">
                  💡 <em>Tip: This creates a permanent app icon on your iOS home screen that launches without browser address bars!</em>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'xcode' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-white">Capacitor / Xcode Native Build</h3>
              <p className="text-xs text-[#b8a291]">
                If you are a developer looking to sign this app for TestFlight or the Apple App Store, you can run Capacitor:
              </p>
              <div className="p-3 bg-[#0d0704] rounded-lg font-mono text-xs text-[#f5af65] space-y-1.5 overflow-x-auto border border-[#27150a]">
                <div>npm install @capacitor/core @capacitor/ios</div>
                <div>npx cap init &quot;{cafeName || 'BrewCraft'}&quot; com.specialtycoffee.brewcraft</div>
                <div>npm run build</div>
                <div>npx cap add ios &amp;&amp; npx cap open ios</div>
              </div>
              <p className="text-xs text-[#9a8677]">
                Then in Xcode, select your Apple Developer Team and build Archive to produce an App Store certified IPA.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#2d1c12] bg-[#160e09] text-xs text-[#9c8979]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#a89281]" />
            <span>Fully compliant with iOS Web App Manifest and App Store Bundle layout</span>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-[#2d1c12] hover:bg-[#3d2719] text-[#e8ded4] font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
