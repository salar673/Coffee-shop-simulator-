import React from 'react';
import { StaffMember, WorkStation } from '../types/game';
import { soundManager } from '../utils/audio';
import { Users, UserPlus, Zap, Coffee, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StaffManagerProps {
  staff: StaffMember[];
  cash: number;
  onHireStaff: (id: string) => void;
  onFireStaff: (id: string) => void;
  onTrainStaff: (id: string) => void;
  onAssignStation: (id: string, station: WorkStation) => void;
}

export const StaffManager: React.FC<StaffManagerProps> = ({
  staff,
  cash,
  onHireStaff,
  onFireStaff,
  onTrainStaff,
  onAssignStation,
}) => {
  const hiredStaff = staff.filter((s) => s.hired);
  const candidates = staff.filter((s) => !s.hired);

  const totalWages = hiredStaff.reduce((sum, s) => sum + s.dailyWage, 0);

  const handleHire = (candidate: StaffMember) => {
    if (cash < candidate.hireCost) return;
    soundManager.playCashRegister();
    soundManager.playSuccessChime();
    confetti({
      particleCount: 35,
      spread: 45,
      origin: { y: 0.6 },
      colors: ['#f5af65', '#d98943', '#ffffff'],
    });
    onHireStaff(candidate.id);
  };

  const handleTrain = (member: StaffMember) => {
    const trainCost = member.level * 50;
    if (cash < trainCost) return;
    soundManager.playCashRegister();
    soundManager.playSuccessChime();
    onTrainStaff(member.id);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#21150e] to-[#140d08] border border-[#3b2416] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#f5af65]" />
            <h2 className="text-xl font-bold font-display text-white">Barista Team &amp; Shift Management</h2>
          </div>
          <p className="text-xs text-[#a89281]">
            Skilled baristas craft velvety latte art and pull faster shots, keeping queue wait times short and customer reviews high.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3.5 py-2 rounded-xl bg-[#0f0905] border border-[#2b180d]">
            <span className="text-[#8c786a] block text-[10px]">Team Size</span>
            <span className="text-white font-bold">{hiredStaff.length} Members</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#0f0905] border border-[#2b180d]">
            <span className="text-[#8c786a] block text-[10px]">Daily Payroll</span>
            <span className="text-amber-400 font-bold">${totalWages}/day</span>
          </div>
        </div>
      </div>

      {/* Hired Staff Section */}
      <div className="space-y-3">
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <span>Active Roster</span>
          <span className="text-xs font-mono text-[#8c786a]">({hiredStaff.length} on payroll)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hiredStaff.map((member) => {
            const trainCost = member.level * 50;
            const canAffordTrain = cash >= trainCost && member.level < 5;

            return (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-[#160e09] border border-[#2d1b11] hover:border-[#42291a] transition-all flex flex-col justify-between shadow-md"
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl p-1.5 bg-[#23150c] rounded-2xl border border-[#3b2315]">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{member.name}</h4>
                        <div className="text-[11px] text-[#f5af65] font-medium capitalize">
                          {member.role} · Tier {member.level}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-[#8c786a]">${member.dailyWage}/day</span>
                  </div>

                  {/* Quote */}
                  <p className="text-[11px] text-[#a89281] italic mb-4 leading-relaxed bg-[#0d0704] p-2.5 rounded-xl border border-[#241308]">
                    &quot;{member.quote}&quot;
                  </p>

                  {/* Skill meters */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-[#b8a291] mb-1">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          Service Speed Skill
                        </span>
                        <span className="font-mono text-emerald-400">{member.speedSkill}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0d0704] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                          style={{ width: `${member.speedSkill}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-[#b8a291] mb-1">
                        <span className="flex items-center gap-1">
                          <Coffee className="w-3 h-3 text-[#f5af65]" />
                          Craft &amp; Flavor Precision
                        </span>
                        <span className="font-mono text-[#f5af65]">{member.craftSkill}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0d0704] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#d98943] to-[#f5af65] rounded-full"
                          style={{ width: `${member.craftSkill}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Station Selector */}
                  <div className="mb-4">
                    <label className="text-[10px] uppercase font-semibold text-[#8c786a] block mb-1.5">
                      Assigned Station
                    </label>
                    <select
                      value={member.station}
                      onChange={(e) => {
                        soundManager.playClick();
                        onAssignStation(member.id, e.target.value as WorkStation);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#0f0905] border border-[#331e11] text-xs text-white focus:outline-none focus:border-[#d98943]"
                    >
                      <option value="espresso_bar">☕ Espresso &amp; Milk Bar (Brews Drinks)</option>
                      <option value="counter">🛎️ Register Counter (Speeds Up Orders)</option>
                      <option value="floor_clean">✨ Floor &amp; Table Cleaning (Boosts Hygiene)</option>
                      <option value="break_room">🛋️ Break Room (Resting)</option>
                    </select>
                  </div>
                </div>

                {/* Training and Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#26150b]">
                  <button
                    onClick={() => handleTrain(member)}
                    disabled={!canAffordTrain}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      canAffordTrain
                        ? 'bg-[#2b190f] hover:bg-[#3d2416] text-[#f5af65] border border-[#4d2f1c]'
                        : 'bg-[#180f0a] text-[#6b584b] border border-[#24150b] cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Train Tier {member.level + 1} (${trainCost})</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onFireStaff(member.id);
                    }}
                    className="py-2 px-2.5 rounded-xl border border-[#3b2315] hover:bg-red-950/40 text-red-400 hover:text-red-300 text-xs transition"
                    title="Release from team"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Candidates Pool */}
      {candidates.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <span>Barista Talent Marketplace</span>
            <span className="text-xs font-mono text-[#8c786a]">({candidates.length} candidates available)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((cand) => {
              const canAffordHire = cash >= cand.hireCost;

              return (
                <div
                  key={cand.id}
                  className="p-5 rounded-2xl bg-[#160e09]/70 border border-[#2b180d] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl p-1.5 bg-[#23150c] rounded-2xl border border-[#3b2315]">
                          {cand.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{cand.name}</h4>
                          <div className="text-[11px] text-[#f5af65] capitalize">
                            Specialist {cand.role}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-white font-bold">${cand.hireCost}</span>
                        <span className="block text-[10px] text-[#7a685b]">Sign-on Fee</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#9c8979] italic mb-4 leading-relaxed">
                      &quot;{cand.quote}&quot;
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#0d0704] p-2.5 rounded-xl border border-[#211207] mb-4">
                      <div>
                        <span className="text-[10px] text-[#7a685b] block">Speed</span>
                        <span className="font-mono text-emerald-400 font-bold">{cand.speedSkill}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7a685b] block">Craft Skill</span>
                        <span className="font-mono text-[#f5af65] font-bold">{cand.craftSkill}%</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleHire(cand)}
                    disabled={!canAffordHire}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow ${
                      canAffordHire
                        ? 'bg-[#c88d58] hover:bg-[#d99b66] text-[#1c120a]'
                        : 'bg-[#20140c] text-[#6b584b] border border-[#2d1b11] cursor-not-allowed opacity-50'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Hire for Cafe (${cand.hireCost})</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
