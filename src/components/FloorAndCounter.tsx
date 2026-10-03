import React from 'react';
import { Customer, StaffMember, Recipe, CustomerReview } from '../types/game';
import { Coffee, UserCheck, Star, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface FloorAndCounterProps {
  customers: Customer[];
  staff: StaffMember[];
  cleanliness: number;
  onManualBrewOrder: (customer: Customer) => void;
  onStaffServeOrder: (customer: Customer, staffId: string) => void;
  onCleanCafe: () => void;
  reviews: CustomerReview[];
}

export const FloorAndCounter: React.FC<FloorAndCounterProps> = ({
  customers,
  staff,
  cleanliness,
  onManualBrewOrder,
  onStaffServeOrder,
  onCleanCafe,
  reviews,
}) => {
  const activeBaristas = staff.filter((s) => s.hired && s.station === 'espresso_bar');
  const activeCashiers = staff.filter((s) => s.hired && s.station === 'counter');
  const activeCleaners = staff.filter((s) => s.hired && s.station === 'floor_clean');

  return (
    <div className="space-y-6">
      {/* Visual Cafe Counter Panorama Header */}
      <div className="relative rounded-2xl overflow-hidden border border-[#3b2416] bg-[#1a110a] shadow-xl">
        <div className="relative h-44 sm:h-52 w-full overflow-hidden">
          <img
            src="/src/assets/images/coffee_shop_interior_1791039919763.jpg"
            alt="Artisanal Cafe Interior"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
            referrerPolicy="no-referrer"
          />
          {/* Contrast scrim gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#140d08] via-[#140d08]/50 to-transparent" />

          {/* Overlay Status Bar */}
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-lg bg-[#140d08]/85 backdrop-blur-md border border-[#3d2719] text-[#f5efe6] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Cafe Open &amp; Brewing</span>
              </div>

              <div className="px-3 py-1 rounded-lg bg-[#140d08]/85 backdrop-blur-md border border-[#3d2719] text-[#f5efe6] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#f5af65]" />
                <span>Shop Cleanliness:</span>
                <span className={`font-mono font-bold ${cleanliness > 70 ? 'text-emerald-400' : cleanliness > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                  {cleanliness}%
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                onCleanCafe();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#2d1b11]/90 hover:bg-[#3d2719] border border-[#523320] text-[#f5af65] font-medium transition shadow flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              <span>Clean Bar &amp; Tables (+15%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Waiting Customers Queue & Floor Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Customer Order Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-display text-white">Customer Service Counter</h3>
              <span className="text-xs text-[#8c786a] font-mono">({customers.length} in line)</span>
            </div>
            <span className="text-xs text-[#a89281]">Patience drops over time · Fast service earns bigger tips</span>
          </div>

          {customers.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#140d08] border border-[#2b180d] text-center space-y-2">
              <div className="text-3xl">☕</div>
              <h4 className="font-semibold text-white text-sm">Quiet Between Rush Hours</h4>
              <p className="text-xs text-[#8c786a] max-w-sm mx-auto">
                Next customers are arriving shortly. You can prep custom recipes in the Brewing Lab or upgrade equipment in the meantime!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.map((c) => {
                const patiencePercent = Math.max(0, Math.min(100, (c.patience / c.maxPatience) * 100));
                const patienceColor =
                  patiencePercent > 60 ? 'bg-emerald-500' : patiencePercent > 30 ? 'bg-amber-500' : 'bg-red-500';

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-[#160e09] border border-[#2d1b12] hover:border-[#42281a] transition-all shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {/* Customer Info row */}
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-1 bg-[#23140c] rounded-xl border border-[#382114]">{c.avatar}</span>
                          <div>
                            <div className="font-semibold text-white text-xs leading-tight">{c.name}</div>
                            <div className="text-[10px] text-[#8c786a] capitalize">
                              {c.personality.replace('_', ' ')}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[#f5af65]">${c.order.price.toFixed(2)}</span>
                          <span className="block text-[10px] text-[#7a685b]">Ticket Price</span>
                        </div>
                      </div>

                      {/* Order Ticket Card */}
                      <div className="p-2.5 rounded-lg bg-[#0e0804] border border-[#241309] mb-3">
                        <div className="flex items-center justify-between text-xs font-medium text-white mb-1">
                          <span className="flex items-center gap-1.5">
                            <span>{c.order.icon || '☕'}</span>
                            <span className="text-[#f5af65] font-semibold">{c.order.name}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-[#a89281] line-clamp-1 leading-snug">
                          {c.order.description}
                        </p>
                      </div>

                      {/* Patience Timer Meter */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-[10px] text-[#8c786a] font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Patience
                          </span>
                          <span>{Math.round(patiencePercent)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0d0704] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${patienceColor} transition-all duration-300 rounded-full`}
                            style={{ width: `${patiencePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#24150c]">
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          onManualBrewOrder(c);
                        }}
                        className="py-2 px-3 rounded-lg bg-[#c88d58] hover:bg-[#d99b66] text-[#1c120a] font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                      >
                        <Coffee className="w-3.5 h-3.5" />
                        <span>Manual Brew</span>
                      </button>

                      <button
                        disabled={activeBaristas.length === 0}
                        onClick={() => {
                          if (activeBaristas.length > 0) {
                            soundManager.playClick();
                            onStaffServeOrder(c, activeBaristas[0].id);
                          }
                        }}
                        className="py-2 px-3 rounded-lg bg-[#241710] hover:bg-[#311f15] border border-[#3b2518] text-[#e8ded4] font-medium text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#f5af65]" />
                        <span>Staff Serve</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Active Staff & Recent Customer Reviews */}
        <div className="space-y-6">
          {/* Active Station Roster */}
          <div className="p-4 rounded-2xl bg-[#140d08] border border-[#2b180d] space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center justify-between">
              <span>On-Duty Cafe Staff</span>
              <span className="text-[11px] text-[#8c786a] font-normal">{staff.filter(s => s.hired).length} Hired</span>
            </h3>

            <div className="space-y-2">
              {staff
                .filter((s) => s.hired && s.station !== 'break_room')
                .map((member) => (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-xl bg-[#1a100a] border border-[#2e1d13] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{member.avatar}</span>
                      <div>
                        <div className="font-semibold text-white">{member.name}</div>
                        <div className="text-[10px] text-[#8c786a] capitalize">
                          Station: {member.station.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-400">⚡ {member.speedSkill}% Spd</span>
                    </div>
                  </div>
                ))}

              {staff.filter((s) => s.hired && s.station !== 'break_room').length === 0 && (
                <div className="p-3 text-center text-xs text-[#7a685b]">
                  No staff on station. Head to Staff Manager to deploy your team!
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews & Feedback Feed */}
          <div className="p-4 rounded-2xl bg-[#140d08] border border-[#2b180d] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>Customer Bulletin Board</span>
              </h3>
              <span className="text-[10px] text-[#7a685b]">{reviews.length} total</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {reviews.slice(0, 4).map((rev) => (
                <div
                  key={rev.id}
                  className="p-2.5 rounded-xl bg-[#180f09] border border-[#2d1b11] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <span>{rev.avatar}</span>
                      <span>{rev.customerName}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400 font-mono text-[11px]">
                      {'★'.repeat(rev.rating)}
                      <span className="text-[#5c4a3e]">{'★'.repeat(5 - rev.rating)}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#b8a291] italic">&quot;{rev.comment}&quot;</p>
                  <div className="flex justify-between text-[10px] text-[#7a685b]">
                    <span>Drink: {rev.recipeName}</span>
                    <span className="text-emerald-400 font-mono">+${rev.tipPaid.toFixed(2)} tip</span>
                  </div>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="p-4 text-center text-xs text-[#7a685b]">
                  Serve your first customers to collect ratings and feedback!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
