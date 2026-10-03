import React from 'react';
import { DaySummary } from '../types/game';
import { soundManager } from '../utils/audio';
import { TrendingUp, Users, DollarSign, Award, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DaySummaryModalProps {
  summary: DaySummary | null;
  isOpen: boolean;
  onStartNextDay: () => void;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({
  summary,
  isOpen,
  onStartNextDay,
}) => {
  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-[#18110b] border border-[#3b2416] rounded-3xl p-6 sm:p-8 text-[#f5efe6] shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#c88d58] to-[#8d5427] flex items-center justify-center text-2xl shadow-lg">
            ☕
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Day {summary.day} Shift Closed</h2>
          <p className="text-xs text-[#a89281]">Daily ledger and guest satisfaction audit</p>
        </div>

        {/* Financial Metrics */}
        <div className="bg-[#120a05] rounded-2xl p-4 border border-[#2b170c] space-y-3">
          <div className="flex justify-between items-center py-1 text-xs">
            <span className="text-[#a89281] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Beverage Sales
            </span>
            <span className="font-mono text-white font-semibold">${summary.grossRevenue.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-1 text-xs">
            <span className="text-[#a89281] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#f5af65]" />
              Customer Gratuity / Tips
            </span>
            <span className="font-mono text-emerald-400 font-semibold">+${summary.totalTips.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-1 text-xs">
            <span className="text-[#a89281]">Barista &amp; Staff Wages</span>
            <span className="font-mono text-red-400 font-semibold">-${summary.wagesPaid.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-1 text-xs">
            <span className="text-[#a89281]">Ingredient Consumption</span>
            <span className="font-mono text-red-400 font-semibold">-${summary.suppliesUsedCost.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-[#29160c] flex justify-between items-center">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#f5af65]" />
              Net Shift Profit
            </span>
            <span
              className={`font-mono text-base font-bold ${
                summary.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {summary.netProfit >= 0 ? '+' : ''}${summary.netProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Guest satisfaction metrics */}
        <div className="grid grid-cols-2 gap-3 text-center text-xs">
          <div className="p-3 bg-[#130b06] border border-[#241308] rounded-xl">
            <span className="text-[10px] text-[#7a685b] block flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              Guests Served
            </span>
            <span className="font-mono text-base font-bold text-white mt-0.5 block">
              {summary.satisfiedCustomers} / {summary.totalCustomers}
            </span>
          </div>

          <div className="p-3 bg-[#130b06] border border-[#241308] rounded-xl">
            <span className="text-[10px] text-[#7a685b] block">Avg Satisfaction</span>
            <span className="font-mono text-base font-bold text-[#f5af65] mt-0.5 block">
              {(summary.avgSatisfaction).toFixed(1)} / 5.0 ★
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            soundManager.playClick();
            confetti({
              particleCount: 30,
              spread: 50,
              origin: { y: 0.6 },
              colors: ['#f5af65', '#d98943'],
            });
            onStartNextDay();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#d98943] to-[#ad6527] hover:from-[#e59b58] hover:to-[#be7230] text-[#1a0f08] font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.99]"
        >
          <span>Open Doors for Day {summary.day + 1}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
