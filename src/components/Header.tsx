import React, { useState } from 'react';
import { Volume2, VolumeX, Download, Apple } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: 'floor' | 'brew' | 'recipes' | 'equipment' | 'staff' | 'inventory';
  onTabChange: (tab: 'floor' | 'brew' | 'recipes' | 'equipment' | 'staff' | 'inventory') => void;
  cash: number;
  starRating: number;
  day: number;
  onOpenIpaModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  cash,
  starRating,
  day,
  onOpenIpaModal,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playClick();
  };

  const navItems = [
    { id: 'floor', label: 'Counter & Floor' },
    { id: 'brew', label: 'Barista Lab' },
    { id: 'recipes', label: 'Drink Menu' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'staff', label: 'Staff Team' },
    { id: 'inventory', label: 'Supplies' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#140d08]/95 backdrop-blur-md border-b border-[#2d1b11] px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('floor');
            }}
            className="text-lg font-bold tracking-tight text-white font-display hover:text-[#f5af65] transition-colors flex items-center gap-2"
          >
            <span>☕</span>
            <span>BrewCraft</span>
          </a>
          <span className="hidden md:inline text-xs text-[#a89281] font-mono">
            Day {day}
          </span>
        </div>

        {/* Zone 2: 4-6 text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                onTabChange(item.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                currentTab === item.id
                  ? 'bg-[#2b180d] text-[#f5af65] font-semibold'
                  : 'text-[#a89281] hover:text-white hover:bg-[#1f130a]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary actions & Balance */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Unboxed live metrics */}
          <div className="flex items-center gap-2 text-xs font-mono bg-[#1c120a] px-3 py-1.5 rounded-xl border border-[#331f13]">
            <span className="text-[#f5af65] font-bold">${cash.toFixed(2)}</span>
            <span className="text-[#593d2b]">·</span>
            <span className="text-amber-400 font-bold">{starRating.toFixed(1)} ★</span>
          </div>

          <PWAInstallButton />

          {/* Export iOS IPA Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenIpaModal();
            }}
            title="Download iOS .ipa file"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#d98943] to-[#ad6527] hover:brightness-110 text-[#1a0f08] font-bold text-xs shadow-md transition-all whitespace-nowrap"
          >
            <Apple className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Export .IPA</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg text-[#a89281] hover:text-white hover:bg-[#241710] transition-colors"
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer / Horizontal Subnav for Small Screens */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto pt-2 pb-0.5 border-t border-[#24150b] mt-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              soundManager.playClick();
              onTabChange(item.id);
            }}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
              currentTab === item.id
                ? 'bg-[#2b180d] text-[#f5af65] font-semibold'
                : 'text-[#8c786a] hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
