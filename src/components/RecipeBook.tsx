import React, { useState } from 'react';
import { Recipe } from '../types/game';
import { soundManager } from '../utils/audio';
import { BookOpen, Sparkles, Star, Plus, Coffee, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecipeBookProps {
  recipes: Recipe[];
  cash: number;
  onUpdateRecipePrice: (id: string, newPrice: number) => void;
  onUnlockRecipe: (id: string) => void;
  onOpenBrewLabWithRecipe?: (recipe: Recipe) => void;
  onStartCustomBrew: () => void;
}

export const RecipeBook: React.FC<RecipeBookProps> = ({
  recipes,
  cash,
  onUpdateRecipePrice,
  onUnlockRecipe,
  onOpenBrewLabWithRecipe,
  onStartCustomBrew,
}) => {
  const [filter, setFilter] = useState<'all' | 'espresso' | 'milk_specialty' | 'iced_cold' | 'artisan_custom'>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(5.0);

  const filtered = recipes.filter((r) => filter === 'all' || r.category === filter);

  const handleStartEditPrice = (r: Recipe) => {
    soundManager.playClick();
    setEditingPriceId(r.id);
    setTempPrice(r.price);
  };

  const handleSavePrice = (id: string) => {
    soundManager.playCashRegister();
    onUpdateRecipePrice(id, Math.max(1.0, Number(tempPrice.toFixed(2))));
    setEditingPriceId(null);
  };

  const handleUnlock = (recipe: Recipe) => {
    const unlockFee = 150;
    if (cash < unlockFee) return;
    soundManager.playCashRegister();
    soundManager.playSuccessChime();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f5af65', '#d98943', '#ffffff'],
    });
    onUnlockRecipe(recipe.id);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#21150e] to-[#140d08] border border-[#3b2416] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-[#f5af65]" />
            <h2 className="text-xl font-bold font-display text-white">Artisanal Drink Menu &amp; Recipe Ledger</h2>
          </div>
          <p className="text-xs text-[#a89281]">
            Calibrate retail margins, unlock specialty single-origin recipes, and brew custom customer favorites.
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onStartCustomBrew();
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d98943] to-[#ad6527] text-white font-semibold text-xs flex items-center gap-2 shadow-lg hover:brightness-110 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Formulate Custom Recipe</span>
        </button>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1.5 p-1 bg-[#140d08] border border-[#26150a] rounded-xl overflow-x-auto text-xs">
        {[
          { id: 'all', label: 'All Recipes' },
          { id: 'espresso', label: 'Pure Espresso' },
          { id: 'milk_specialty', label: 'Milk & Microfoam' },
          { id: 'iced_cold', label: 'Iced & Cold Brew' },
          { id: 'artisan_custom', label: 'Custom Creations' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundManager.playClick();
              setFilter(tab.id as typeof filter);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === tab.id
                ? 'bg-[#2d1b11] text-[#f5af65] border border-[#4a2e1c] shadow-sm'
                : 'text-[#9c8979] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((r) => {
          const isLocked = !r.unlocked;

          return (
            <div
              key={r.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-md ${
                isLocked
                  ? 'bg-[#140c07]/80 border-[#261409] opacity-85'
                  : 'bg-[#160e09] border-[#2d1b11] hover:border-[#42291a]'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-1.5 bg-[#23150c] rounded-2xl border border-[#3b2315]">
                      {r.icon || '☕'}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-snug">{r.name}</h3>
                      <div className="text-[11px] text-[#f5af65] capitalize">
                        {r.category.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  {r.isCustom && (
                    <span className="px-2 py-0.5 rounded-md bg-[#29170c] border border-[#482b17] text-[#f5af65] text-[10px] font-semibold">
                      Custom
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#a89281] mb-4 leading-relaxed line-clamp-2">
                  {r.description}
                </p>

                {/* Recipe Blueprint details */}
                <div className="p-3 bg-[#0d0704] rounded-xl border border-[#241308] space-y-1.5 text-xs text-[#b8a291] mb-4">
                  <div className="flex justify-between">
                    <span className="text-[11px] text-[#7a685b]">Bean Origin:</span>
                    <span className="font-medium text-white capitalize">{r.ingredients.beanType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] text-[#7a685b]">Grind &amp; Method:</span>
                    <span className="font-medium text-white capitalize">{r.ingredients.brewMethod} ({r.ingredients.grindLevel.split('_')[0]})</span>
                  </div>
                  {r.ingredients.milkType !== 'none' && (
                    <div className="flex justify-between">
                      <span className="text-[11px] text-[#7a685b]">Dairy / Foam:</span>
                      <span className="font-medium text-white capitalize">{r.ingredients.milkType} · {r.ingredients.milkFroth}</span>
                    </div>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between text-xs text-[#8c786a] mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-mono font-bold text-white">{r.avgRating.toFixed(1)}</span>
                  </div>
                  <span>Brewed {r.timesBrewed} times</span>
                  <span className="font-mono text-emerald-400">Margin: ${Math.max(0, r.price - r.cost).toFixed(2)}</span>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-3 border-t border-[#241409]">
                {isLocked ? (
                  <button
                    onClick={() => handleUnlock(r)}
                    disabled={cash < 150}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      cash >= 150
                        ? 'bg-[#c88d58] hover:bg-[#d99b66] text-[#1c120a] cursor-pointer'
                        : 'bg-[#20140c] text-[#7a685b] border border-[#2d1b11] cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock Secret Recipe ($150)</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    {editingPriceId === r.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="number"
                          step="0.25"
                          min="1.0"
                          max="20.0"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(Number(e.target.value))}
                          className="w-20 py-1.5 px-2.5 bg-[#0d0704] border border-[#482b17] rounded-lg text-white font-mono text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => handleSavePrice(r.id)}
                          className="py-1.5 px-3 bg-[#c88d58] text-[#1c120a] font-bold rounded-lg text-xs hover:bg-[#d99b66]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <div
                          onClick={() => handleStartEditPrice(r)}
                          className="cursor-pointer group/price flex items-center gap-1.5 text-xs text-[#b8a291] hover:text-white"
                          title="Click to adjust menu price"
                        >
                          <span className="font-mono text-base font-bold text-[#f5af65]">${r.price.toFixed(2)}</span>
                          <span className="text-[10px] text-[#8c786a] underline">edit</span>
                        </div>

                        {onOpenBrewLabWithRecipe && (
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              onOpenBrewLabWithRecipe(r);
                            }}
                            className="py-1.5 px-3 rounded-lg bg-[#241710] hover:bg-[#332015] border border-[#3b2518] text-[#e8ded4] text-xs font-medium flex items-center gap-1.5 transition"
                          >
                            <Coffee className="w-3.5 h-3.5 text-[#f5af65]" />
                            <span>Brew in Lab</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
