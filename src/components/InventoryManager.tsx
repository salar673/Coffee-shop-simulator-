import React from 'react';
import { Inventory } from '../types/game';
import { soundManager } from '../utils/audio';
import { Package, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface InventoryManagerProps {
  inventory: Inventory;
  cash: number;
  onRestock: (category: 'beans' | 'milks' | 'syrups' | 'cups', itemKey: string, amount: number, cost: number) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  inventory,
  cash,
  onRestock,
}) => {
  const handleBuy = (category: 'beans' | 'milks' | 'syrups' | 'cups', itemKey: string, amount: number, cost: number) => {
    if (cash < cost) return;
    soundManager.playCashRegister();
    soundManager.playSuccessChime();
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.6 },
      colors: ['#f5af65', '#d98943'],
    });
    onRestock(category, itemKey, amount, cost);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#21150e] to-[#140d08] border border-[#3b2416] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-[#f5af65]" />
            <h2 className="text-xl font-bold font-display text-white">Supply Inventory &amp; Wholesale Purchasing</h2>
          </div>
          <p className="text-xs text-[#a89281]">
            Source green coffee beans, organic dairy &amp; oat cartons, pure cane syrups, and compostable cups.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-[#0f0905] border border-[#2b180d] shrink-0 text-right">
          <span className="text-[10px] text-[#8c786a] block">Supply Funds</span>
          <span className="font-mono text-base font-bold text-[#f5af65]">${cash.toFixed(2)}</span>
        </div>
      </div>

      {/* Grid: 4 Wholesale Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coffee Beans Supply */}
        <div className="p-5 rounded-2xl bg-[#160e09] border border-[#2d1b11] space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center justify-between">
            <span>Specialty Whole Bean Roasts</span>
            <span className="text-xs text-[#8c786a]">Wholesale 50-dose sacks</span>
          </h3>

          <div className="space-y-3">
            {[
              { key: 'dark_roast', name: 'Italian Dark Roast', stock: inventory.beans.dark_roast, cost: 25 },
              { key: 'colombian_medium', name: 'Colombian Supremo', stock: inventory.beans.colombian_medium, cost: 30 },
              { key: 'ethiopian_light', name: 'Ethiopian Blonde Single Origin', stock: inventory.beans.ethiopian_light, cost: 35 },
              { key: 'decaf_swiss', name: 'Swiss Water Decaf', stock: inventory.beans.decaf_swiss, cost: 28 },
            ].map((b) => (
              <div
                key={b.key}
                className="p-3 bg-[#0e0804] border border-[#241308] rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{b.name}</div>
                  <div className="text-[11px] text-[#8c786a]">Current Stock: {b.stock} doses</div>
                </div>

                <button
                  onClick={() => handleBuy('beans', b.key, 50, b.cost)}
                  disabled={cash < b.cost}
                  className={`py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition ${
                    cash >= b.cost
                      ? 'bg-[#c88d58] hover:bg-[#d99b66] text-[#1c120a]'
                      : 'bg-[#20140c] text-[#7a685b] border border-[#2d1b11] cursor-not-allowed opacity-50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+50 Doses (${b.cost})</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Milks Supply */}
        <div className="p-5 rounded-2xl bg-[#160e09] border border-[#2d1b11] space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center justify-between">
            <span>Dairy &amp; Plant Milk Cartons</span>
            <span className="text-xs text-[#8c786a]">Case of 40 pours</span>
          </h3>

          <div className="space-y-3">
            {[
              { key: 'whole', name: 'Organic Whole Milk', stock: inventory.milks.whole, cost: 20 },
              { key: 'oat', name: 'Barista Edition Oat Milk', stock: inventory.milks.oat, cost: 26 },
              { key: 'almond', name: 'Artisan Almond Milk', stock: inventory.milks.almond, cost: 24 },
              { key: 'sweet_cream', name: 'Sweet Heavy Cream', stock: inventory.milks.sweet_cream, cost: 25 },
            ].map((m) => (
              <div
                key={m.key}
                className="p-3 bg-[#0e0804] border border-[#241308] rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{m.name}</div>
                  <div className="text-[11px] text-[#8c786a]">Current Stock: {m.stock} pours</div>
                </div>

                <button
                  onClick={() => handleBuy('milks', m.key, 40, m.cost)}
                  disabled={cash < m.cost}
                  className={`py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition ${
                    cash >= m.cost
                      ? 'bg-[#c88d58] hover:bg-[#d99b66] text-[#1c120a]'
                      : 'bg-[#20140c] text-[#7a685b] border border-[#2d1b11] cursor-not-allowed opacity-50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+40 Pours (${m.cost})</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Syrups & Flavoring */}
        <div className="p-5 rounded-2xl bg-[#160e09] border border-[#2d1b11] space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center justify-between">
            <span>Artisanal Flavoring Syrups</span>
            <span className="text-xs text-[#8c786a]">Bottles (30 pumps)</span>
          </h3>

          <div className="space-y-3">
            {[
              { key: 'vanilla', name: 'Pure Bourbon Vanilla', stock: inventory.syrups.vanilla, cost: 18 },
              { key: 'caramel', name: 'Salted Caramel Syrup', stock: inventory.syrups.caramel, cost: 18 },
              { key: 'hazelnut', name: 'Roasted Hazelnut Syrup', stock: inventory.syrups.hazelnut, cost: 18 },
              { key: 'lavender', name: 'French Wild Lavender Infusion', stock: inventory.syrups.lavender, cost: 22 },
            ].map((s) => (
              <div
                key={s.key}
                className="p-3 bg-[#0e0804] border border-[#241308] rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{s.name}</div>
                  <div className="text-[11px] text-[#8c786a]">Current Stock: {s.stock} pumps</div>
                </div>

                <button
                  onClick={() => handleBuy('syrups', s.key, 30, s.cost)}
                  disabled={cash < s.cost}
                  className={`py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition ${
                    cash >= s.cost
                      ? 'bg-[#c88d58] hover:bg-[#d99b66] text-[#1c120a]'
                      : 'bg-[#20140c] text-[#7a685b] border border-[#2d1b11] cursor-not-allowed opacity-50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+30 Pumps (${s.cost})</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cups & Paper Goods */}
        <div className="p-5 rounded-2xl bg-[#160e09] border border-[#2d1b11] space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center justify-between">
            <span>Cups, Lids &amp; Ice Supplies</span>
            <span className="text-xs text-[#8c786a]">Bulk packaging</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-[#0e0804] border border-[#241308] rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-white">Compostable Cups &amp; Lids</div>
                <div className="text-[11px] text-[#8c786a]">Current Stock: {inventory.cups} units</div>
              </div>

              <button
                onClick={() => handleBuy('cups', 'cups', 100, 20)}
                disabled={cash < 20}
                className={`py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition ${
                  cash >= 20
                    ? 'bg-[#c88d58] hover:bg-[#d99b66] text-[#1c120a]'
                    : 'bg-[#20140c] text-[#7a685b] border border-[#2d1b11] cursor-not-allowed opacity-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+100 Cups ($20)</span>
              </button>
            </div>

            <div className="p-3 bg-[#0e0804] border border-[#241308] rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-white">Crystal Clear Ice Bags</div>
                <div className="text-[11px] text-[#8c786a]">Current Stock: {inventory.ice} scoops</div>
              </div>

              <button
                onClick={() => handleBuy('cups', 'ice', 80, 15)}
                disabled={cash < 15}
                className={`py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition ${
                  cash >= 15
                    ? 'bg-[#c88d58] hover:bg-[#d99b66] text-[#1c120a]'
                    : 'bg-[#20140c] text-[#7a685b] border border-[#2d1b11] cursor-not-allowed opacity-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+80 Ice ($15)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
