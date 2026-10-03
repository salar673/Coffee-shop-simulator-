import React from 'react';
import { EquipmentItem } from '../types/game';
import { soundManager } from '../utils/audio';
import { Wrench, Check, ArrowUpRight, Zap, Award, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EquipmentShopProps {
  equipment: EquipmentItem[];
  cash: number;
  onUpgradeEquipment: (id: string) => void;
}

export const EquipmentShop: React.FC<EquipmentShopProps> = ({
  equipment,
  cash,
  onUpgradeEquipment,
}) => {
  const getLevelTierName = (category: string, level: number) => {
    switch (category) {
      case 'grinder':
        return ['Vintage Blade Grinder', 'Commercial Conical Burr Grinder', 'Precision Flat 83mm Burr Grinder', 'Smart Laser Particle Micron Grinder'][level - 1] || 'Apex Grinder';
      case 'espresso_machine':
        return ['Single-Boiler Starter Unit', 'Dual-Boiler Commercial 2-Group', 'Italian Multi-Group Volumetric', 'Synesso Pressure Profiling Titan'][level - 1] || 'Legendary Espresso Machine';
      case 'steamer':
        return ['Standard Steam Arm', 'Rapid Dual-Steam Thermoblock', 'Commercial Cool-Touch High Bar Wand', 'Smart Auto-Microfoam Induction Wand'][level - 1] || 'Master Steamer';
      case 'cold_tap':
        return ['Manual Pitcher & Ice Bin', 'Rapid Countertop Cube Dispenser', 'Draft Nitrogen Keg Tap System', 'Cryogenic Rapid Steep Nitro Tower'][level - 1] || 'Nitro Tap Master';
      case 'interior':
        return ['Bistro Wood Tables & Stools', 'Cozy Oak Booths & Lush Potted Ferns', 'Velvet Banquettes & Warm Acoustic Jazz', 'Botanical Boutique Luxury Lounge'][level - 1] || 'Luxury Sanctuary';
      case 'pos':
        return ['Mechanical Cash Box', 'Touchscreen Tablet POS & Card Reader', 'Dual-Screen High-Speed Cashier Terminal', 'Self-Serve Smart Order Kiosks'][level - 1] || 'AI POS Kiosk';
      default:
        return `Level ${level} Unit`;
    }
  };

  const handleUpgrade = (item: EquipmentItem) => {
    if (cash < item.upgradeCost || item.level >= item.maxLevel) return;
    soundManager.playCashRegister();
    soundManager.playSuccessChime();
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#f5af65', '#d98943', '#e8ded4'],
    });
    onUpgradeEquipment(item.id);
  };

  return (
    <div className="space-y-6">
      {/* Shop Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#21150e] to-[#140d08] border border-[#3b2416] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-[#f5af65]" />
            <h2 className="text-xl font-bold font-display text-white">Commercial Barista Equipment &amp; Cafe Outfitting</h2>
          </div>
          <p className="text-xs text-[#a89281]">
            Upgrade high-precision grinders, multi-boiler Italian espresso machines, and lounge seating to maximize throughput and guest happiness.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-[#0f0905] border border-[#2b180d] shrink-0 text-right">
          <span className="text-[10px] text-[#8c786a] block">Available Budget</span>
          <span className="font-mono text-base font-bold text-[#f5af65]">${cash.toFixed(2)}</span>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipment.map((item) => {
          const isMax = item.level >= item.maxLevel;
          const canAfford = cash >= item.upgradeCost && !isMax;
          const currentTitle = getLevelTierName(item.category, item.level);
          const nextTitle = !isMax ? getLevelTierName(item.category, item.level + 1) : null;

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#160e09] border border-[#2d1b11] hover:border-[#42291a] transition-all flex flex-col justify-between shadow-md group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-[#a89281] block">
                      {item.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold font-display text-white group-hover:text-[#f5af65] transition-colors">
                      {item.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-md bg-[#24160e] text-[#f5af65] border border-[#3d2417]">
                    <span>Tier {item.level}</span>
                    <span className="text-[#8c786a]">/ {item.maxLevel}</span>
                  </div>
                </div>

                {/* Current Unit Badge */}
                <div className="p-3 rounded-xl bg-[#0e0804] border border-[#24140a] mb-4 space-y-1">
                  <div className="text-xs font-semibold text-[#f5efe6]">{currentTitle}</div>
                  <p className="text-[11px] text-[#8c786a] leading-relaxed">{item.description}</p>
                </div>

                {/* Tier Progress dots */}
                <div className="flex gap-1.5 mb-4">
                  {Array.from({ length: item.maxLevel }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full ${
                        idx < item.level ? 'bg-gradient-to-r from-[#d98943] to-[#f5af65]' : 'bg-[#29170d]'
                      }`}
                    />
                  ))}
                </div>

                {/* Stat Perks list */}
                <div className="space-y-1.5 text-xs mb-4">
                  {item.speedBonus > 0 && (
                    <div className="flex items-center justify-between text-[#b8a291]">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Brew &amp; Service Speed
                      </span>
                      <span className="font-mono text-emerald-400">+{item.speedBonus}%</span>
                    </div>
                  )}

                  {item.qualityBonus > 0 && (
                    <div className="flex items-center justify-between text-[#b8a291]">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#f5af65]" />
                        Extraction &amp; Flavor Score
                      </span>
                      <span className="font-mono text-emerald-400">+{item.qualityBonus}%</span>
                    </div>
                  )}

                  {item.patienceBonus > 0 && (
                    <div className="flex items-center justify-between text-[#b8a291]">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        Customer Patience Extension
                      </span>
                      <span className="font-mono text-emerald-400">+{item.patienceBonus}s</span>
                    </div>
                  )}
                </div>

                {/* Next Tier Preview */}
                {!isMax && (
                  <div className="p-2.5 rounded-lg bg-[#20140c]/60 border border-[#362113] text-[11px] text-[#a89281] mb-4">
                    <span className="text-[#f5af65] font-medium block">Next: {nextTitle}</span>
                    <span className="text-[10px] text-[#7a685b]">+15% performance boost</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div>
                {isMax ? (
                  <div className="w-full py-2.5 rounded-xl bg-[#21150e] border border-[#3b2518] text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Max Tier Mastered</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(item)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                      canAfford
                        ? 'bg-[#c88d58] hover:bg-[#d99b66] text-[#1c120a] cursor-pointer'
                        : 'bg-[#241710] text-[#7a685b] border border-[#331f13] cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>Upgrade to Tier {item.level + 1}</span>
                    <span className="font-mono font-bold">(${item.upgradeCost})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
