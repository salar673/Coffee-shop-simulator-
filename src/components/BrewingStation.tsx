import React, { useState, useEffect } from 'react';
import {
  BeanType,
  GrindLevel,
  BrewMethod,
  MilkType,
  MilkFroth,
  SyrupType,
  ToppingType,
  LatteArtType,
  Recipe,
  Customer,
  Inventory,
} from '../types/game';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Play, Check, RotateCcw, Sparkles, Flame, CheckCircle2 } from 'lucide-react';

interface BrewingStationProps {
  activeCustomer?: Customer | null;
  onCompleteCustomerOrder?: (score: number, brewedRecipe: Partial<Recipe>) => void;
  onSaveCustomRecipe?: (newRecipe: Recipe) => void;
  inventory: Inventory;
  onUseIngredients?: (recipe: Partial<Recipe>) => void;
  onCancelBrew?: () => void;
}

export const BrewingStation: React.FC<BrewingStationProps> = ({
  activeCustomer,
  onCompleteCustomerOrder,
  onSaveCustomRecipe,
  inventory,
  onUseIngredients,
  onCancelBrew,
}) => {
  // Step navigation
  const [step, setStep] = useState<'beans' | 'extract' | 'milk' | 'finish' | 'result'>('beans');

  // Brewing configuration
  const [bean, setBean] = useState<BeanType>('dark_roast');
  const [grind, setGrind] = useState<GrindLevel>('fine_espresso');
  const [method, setMethod] = useState<BrewMethod>('espresso');

  // Extraction Minigame State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0); // 0 to 100
  const [extractionResult, setExtractionResult] = useState<'pending' | 'under' | 'perfect' | 'over'>('pending');
  const [extractionScore, setExtractionScore] = useState(85);

  // Milk & Steaming
  const [milk, setMilk] = useState<MilkType>('whole');
  const [froth, setFroth] = useState<MilkFroth>('microfoam');
  const [steamingTemp, setSteamingTemp] = useState(65); // 65C is sweet spot

  // Finish
  const [syrup, setSyrup] = useState<SyrupType>('none');
  const [toppings, setToppings] = useState<ToppingType[]>([]);
  const [latteArt, setLatteArt] = useState<LatteArtType>('none');

  // Custom Recipe details
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState(5.0);
  const [isSaved, setIsSaved] = useState(false);

  // Pre-fill target recipe if fulfilling a customer
  useEffect(() => {
    if (activeCustomer) {
      const order = activeCustomer.order;
      setBean(order.ingredients.beanType);
      setGrind(order.ingredients.grindLevel);
      setMethod(order.ingredients.brewMethod);
      setMilk(order.ingredients.milkType);
      setFroth(order.ingredients.milkFroth);
      setSyrup(order.ingredients.syrup);
      setToppings(order.ingredients.toppings);
      setLatteArt(order.ingredients.latteArt);
    } else {
      setCustomName('Artisan Blend No. ' + Math.floor(Math.random() * 90 + 10));
    }
  }, [activeCustomer]);

  // Extraction animation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExtracting) {
      soundManager.playSteamHiss();
      interval = setInterval(() => {
        setExtractionProgress((prev) => {
          if (prev >= 100) {
            setIsExtracting(false);
            setExtractionResult('over');
            setExtractionScore(55);
            return 100;
          }
          return prev + 2.2;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isExtracting]);

  const handleStartExtraction = () => {
    soundManager.playClick();
    setExtractionProgress(0);
    setIsExtracting(true);
    setExtractionResult('pending');
  };

  const handleStopExtraction = () => {
    if (!isExtracting) return;
    setIsExtracting(false);
    soundManager.playClick();

    // Sweet spot is between 60 and 80 progress
    if (extractionProgress < 50) {
      setExtractionResult('under');
      setExtractionScore(65);
    } else if (extractionProgress >= 50 && extractionProgress <= 82) {
      setExtractionResult('perfect');
      setExtractionScore(100);
      soundManager.playSuccessChime();
    } else {
      setExtractionResult('over');
      setExtractionScore(60);
    }
  };

  const toggleTopping = (t: ToppingType) => {
    soundManager.playClick();
    setToppings((prev) => (prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]));
  };

  // Calculate final score
  const calculateFinalScore = () => {
    let score = extractionScore;
    // Temp penalty if not close to 65C
    const tempDelta = Math.abs(steamingTemp - 65);
    score -= tempDelta * 0.5;

    if (activeCustomer) {
      // Check ingredient fidelity
      const target = activeCustomer.order.ingredients;
      if (bean !== target.beanType) score -= 12;
      if (milk !== target.milkType) score -= 15;
      if (syrup !== target.syrup) score -= 10;
      if (froth !== target.milkFroth) score -= 8;
    }
    return Math.max(40, Math.min(100, Math.round(score)));
  };

  const handleFinishBrew = () => {
    const finalScore = calculateFinalScore();
    soundManager.playSuccessChime();
    if (finalScore >= 90) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f5af65', '#d98943', '#ffffff'],
      });
    }
    setStep('result');
  };

  const handleDeliverToCustomer = () => {
    const finalScore = calculateFinalScore();
    if (onCompleteCustomerOrder) {
      onCompleteCustomerOrder(finalScore, {
        name: activeCustomer ? activeCustomer.order.name : customName,
        ingredients: {
          beanType: bean,
          grindLevel: grind,
          brewMethod: method,
          milkType: milk,
          milkFroth: froth,
          syrup: syrup,
          toppings: toppings,
          latteArt: latteArt,
        },
      });
    }
  };

  const handleSaveRecipeToMenu = () => {
    if (!onSaveCustomRecipe) return;
    const finalScore = calculateFinalScore();
    const newRecipe: Recipe = {
      id: `custom_${Date.now()}`,
      name: customName || 'Custom Reserve Cup',
      description: `Crafted with ${bean.replace('_', ' ')} beans, ${milk} milk, and ${syrup !== 'none' ? syrup + ' syrup' : 'pure finish'}.`,
      category: milk === 'none' ? 'espresso' : 'artisan_custom',
      ingredients: {
        beanType: bean,
        grindLevel: grind,
        brewMethod: method,
        milkType: milk,
        milkFroth: froth,
        syrup: syrup,
        toppings: toppings,
        latteArt: latteArt,
      },
      price: customPrice,
      cost: 1.2,
      unlocked: true,
      isCustom: true,
      timesBrewed: 1,
      avgRating: Number((finalScore / 20).toFixed(1)),
      icon: milk === 'none' ? '☕' : '✨',
    };
    onSaveCustomRecipe(newRecipe);
    setIsSaved(true);
    soundManager.playSuccessChime();
  };

  return (
    <div className="bg-[#140d08] border border-[#2e1d13] rounded-2xl overflow-hidden shadow-xl text-[#f5efe6] max-w-4xl mx-auto">
      {/* Station Banner Header */}
      <div className="relative px-6 py-4 bg-[#1c120a] border-b border-[#2d1c12] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">☕</span>
            <h2 className="text-lg font-bold font-display text-white">
              {activeCustomer ? `Serving Order for ${activeCustomer.name}` : 'Barista Lab & Custom Recipe Studio'}
            </h2>
          </div>
          <div className="text-xs text-[#a89281] flex items-center gap-2 mt-0.5">
            {activeCustomer ? (
              <span>Customer Order: <strong className="text-[#f5af65]">{activeCustomer.order.name}</strong></span>
            ) : (
              <span>Brew, calibrate extraction pressure, and publish custom creations to your cafe menu</span>
            )}
          </div>
        </div>

        {onCancelBrew && (
          <button
            onClick={() => {
              soundManager.playClick();
              onCancelBrew();
            }}
            className="text-xs text-[#a89281] hover:text-white px-3 py-1.5 rounded-lg border border-[#3b2416] hover:bg-[#2b180d] transition"
          >
            Cancel / Back
          </button>
        )}
      </div>

      {/* Progress Wizard Tabs */}
      <div className="flex border-b border-[#2d1c12] bg-[#100905] text-xs font-medium">
        <button
          onClick={() => setStep('beans')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            step === 'beans' ? 'border-[#c88d58] text-[#f5af65]' : 'border-transparent text-[#8a7667]'
          }`}
        >
          1. Beans &amp; Grind
        </button>
        <button
          onClick={() => setStep('extract')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            step === 'extract' ? 'border-[#c88d58] text-[#f5af65]' : 'border-transparent text-[#8a7667]'
          }`}
        >
          2. Extraction Pull
        </button>
        <button
          onClick={() => setStep('milk')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            step === 'milk' ? 'border-[#c88d58] text-[#f5af65]' : 'border-transparent text-[#8a7667]'
          }`}
        >
          3. Steaming &amp; Foam
        </button>
        <button
          onClick={() => setStep('finish')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            step === 'finish' ? 'border-[#c88d58] text-[#f5af65]' : 'border-transparent text-[#8a7667]'
          }`}
        >
          4. Flavor &amp; Latte Art
        </button>
        <button
          onClick={() => setStep('result')}
          disabled={step !== 'result'}
          className={`flex-1 py-3 text-center border-b-2 transition-colors ${
            step === 'result' ? 'border-[#c88d58] text-[#f5af65]' : 'border-transparent text-[#5c4a3e]'
          }`}
        >
          5. Final Cup
        </button>
      </div>

      {/* Step Body */}
      <div className="p-6">
        {/* STEP 1: BEANS & GRIND */}
        {step === 'beans' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Select Coffee Origin &amp; Roast</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { id: 'dark_roast', name: 'Italian Dark Roast', note: 'Rich cocoa, bold body, smoky finish', stock: inventory.beans.dark_roast },
                  { id: 'colombian_medium', name: 'Colombian Supremo', note: 'Balanced caramel, roasted pecan', stock: inventory.beans.colombian_medium },
                  { id: 'ethiopian_light', name: 'Ethiopian Yirgacheffe', note: 'Floral jasmine, bright citrus acidity', stock: inventory.beans.ethiopian_light },
                  { id: 'decaf_swiss', name: 'Swiss Water Decaf', note: 'Clean mellow notes without caffeine', stock: inventory.beans.decaf_swiss },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      soundManager.playGrinder();
                      setBean(b.id as BeanType);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      bean === b.id
                        ? 'border-[#d98943] bg-[#291a10] shadow-md'
                        : 'border-[#2d1b11] bg-[#180f09] hover:bg-[#20140c]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white text-xs">{b.name}</span>
                      {bean === b.id && <Check className="w-3.5 h-3.5 text-[#f5af65]" />}
                    </div>
                    <p className="text-[11px] text-[#a89281] mb-2">{b.note}</p>
                    <div className="text-[10px] text-[#7a685b]">Stock: {b.stock} doses</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Burr Grinder Particle Size</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'fine_espresso', label: 'Fine Espresso (200µm)', desc: 'Ideal for 9-bar high-pressure machines' },
                  { id: 'medium_drip', label: 'Medium Drip (600µm)', desc: 'Balanced extraction for V60 pour-over' },
                  { id: 'coarse_coldbrew', label: 'Coarse Cold Brew (1000µm)', desc: 'Optimized for 18-hour cold steeping' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      soundManager.playGrinder();
                      setGrind(g.id as GrindLevel);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      grind === g.id
                        ? 'border-[#d98943] bg-[#291a10]'
                        : 'border-[#2d1b11] bg-[#180f09] hover:bg-[#20140c]'
                    }`}
                  >
                    <div className="font-semibold text-white text-xs">{g.label}</div>
                    <p className="text-[11px] text-[#a89281] mt-0.5">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setStep('extract');
                }}
                className="px-6 py-2.5 rounded-xl bg-[#c88d58] text-[#1c120a] font-semibold text-xs hover:bg-[#d99b66] transition shadow-md"
              >
                Proceed to Extraction →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: EXTRACTION MINIGAME */}
        {step === 'extract' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-center max-w-md mx-auto space-y-2">
              <h3 className="text-base font-bold font-display text-white">Commercial Pressure Profiling</h3>
              <p className="text-xs text-[#a89281]">
                Tap &quot;Start Pull&quot; to begin 9-bar extraction. Stop the shot when the needle enters the{' '}
                <span className="text-[#f5af65] font-semibold">Golden Crema Zone (60% - 80%)</span> for optimal flavor!
              </p>
            </div>

            {/* Visual Espresso Gauge Container */}
            <div className="relative max-w-md mx-auto bg-[#1b1008] border border-[#3b2315] rounded-2xl p-6 shadow-inner text-center">
              {/* Pressure Dial Display */}
              <div className="flex items-center justify-between text-xs text-[#8c786a] mb-2 font-mono">
                <span>0 Bar (Pre-infusion)</span>
                <span className="text-[#f5af65] font-bold">9 Bar Target</span>
                <span>12 Bar (Choked)</span>
              </div>

              {/* Progress Meter Bar */}
              <div className="relative w-full h-8 bg-[#0d0704] rounded-xl overflow-hidden border border-[#2d1b11] mb-4">
                {/* Under zone */}
                <div className="absolute left-0 top-0 bottom-0 w-[50%] bg-blue-950/40 border-r border-blue-800/30" />
                {/* Golden Zone */}
                <div className="absolute left-[50%] top-0 bottom-0 w-[32%] bg-gradient-to-r from-amber-600/50 to-[#d98943]/60 border-x border-[#f5af65]/80 flex items-center justify-center">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-200">Sweet Spot</span>
                </div>
                {/* Over zone */}
                <div className="absolute left-[82%] top-0 bottom-0 w-[18%] bg-red-950/40" />

                {/* Needle indicator */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_10px_#ffffff] transition-all duration-75"
                  style={{ left: `${extractionProgress}%` }}
                />
              </div>

              {/* Extraction Stream animation */}
              <div className="h-16 flex flex-col items-center justify-center">
                {isExtracting ? (
                  <div className="space-y-1 flex flex-col items-center">
                    <div className="w-2 h-10 bg-gradient-to-b from-[#40220c] to-[#d98943] rounded-full animate-steam" />
                    <span className="text-xs text-[#f5af65] font-mono animate-pulse">Extracting Crema... ({Math.round(extractionProgress)}%)</span>
                  </div>
                ) : extractionResult === 'perfect' ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Flawless 9-Bar Extraction! (+100 Score)</span>
                  </div>
                ) : extractionResult === 'under' ? (
                  <div className="text-blue-400 text-xs font-medium">Under-extracted (Sour &amp; watery). Try pulling longer.</div>
                ) : extractionResult === 'over' ? (
                  <div className="text-red-400 text-xs font-medium">Over-extracted (Burnt &amp; bitter). Pulled too long.</div>
                ) : (
                  <span className="text-xs text-[#7a685b]">Ready to pull shot.</span>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {!isExtracting && extractionResult === 'pending' && (
                  <button
                    onClick={handleStartExtraction}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d98943] to-[#ad6527] text-white font-semibold text-xs flex items-center gap-2 shadow-lg hover:brightness-110"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Shot Pull
                  </button>
                )}

                {isExtracting && (
                  <button
                    onClick={handleStopExtraction}
                    className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider animate-pulse shadow-lg"
                  >
                    Stop Shot!
                  </button>
                )}

                {extractionResult !== 'pending' && (
                  <button
                    onClick={handleStartExtraction}
                    className="px-4 py-2 rounded-xl border border-[#3d2416] text-[#b8a291] hover:text-white text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Retry Pull
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                onClick={() => setStep('beans')}
                className="px-4 py-2 rounded-xl border border-[#3b2416] text-[#a89281] text-xs hover:text-white"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setStep('milk');
                }}
                className="px-6 py-2.5 rounded-xl bg-[#c88d58] text-[#1c120a] font-semibold text-xs hover:bg-[#d99b66] transition shadow-md"
              >
                Proceed to Steaming &amp; Milk →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: STEAMING & MILK */}
        {step === 'milk' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Dairy &amp; Plant Milks</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'none', label: 'No Milk (Black)', sub: 'Espresso / Americano' },
                  { id: 'whole', label: 'Organic Whole Milk', sub: 'Classic velvety sweetness' },
                  { id: 'oat', label: 'Barista Oat Milk', sub: 'Toasty grain notes' },
                  { id: 'almond', label: 'Unsweetened Almond', sub: 'Nutty & light mouthfeel' },
                  { id: 'sweet_cream', label: 'Vanilla Sweet Cream', sub: 'Decadent rich foam' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundManager.playClick();
                      setMilk(m.id as MilkType);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      milk === m.id
                        ? 'border-[#d98943] bg-[#291a10] shadow-md'
                        : 'border-[#2d1b11] bg-[#180f09] hover:bg-[#20140c]'
                    }`}
                  >
                    <div className="font-semibold text-white text-xs">{m.label}</div>
                    <div className="text-[10px] text-[#8c786a] mt-0.5">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {milk !== 'none' && (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Microfoam Texture &amp; Density</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'flat', label: 'Flat / Light Steamed', desc: 'Minimal foam, smooth liquid' },
                      { id: 'microfoam', label: 'Silky Microfoam', desc: 'Glossy wet paint texture for latte art' },
                      { id: 'dense_cap', label: 'Dense Cappuccino Foam', desc: 'Thick, airy cloud cushion' },
                      { id: 'cold_foam', label: 'Cold Whipped Foam', desc: 'Aerated topping for iced drinks' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          soundManager.playSteamHiss();
                          setFroth(f.id as MilkFroth);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          froth === f.id
                            ? 'border-[#d98943] bg-[#291a10]'
                            : 'border-[#2d1b11] bg-[#180f09] hover:bg-[#20140c]'
                        }`}
                      >
                        <div className="font-semibold text-white text-xs">{f.label}</div>
                        <div className="text-[10px] text-[#8c786a] mt-0.5">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-[#180f09] rounded-xl border border-[#2b180d]">
                  <div className="flex items-center justify-between text-xs text-white mb-2">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#f5af65]" />
                      Steam Wand Temperature:
                    </span>
                    <span className="font-mono text-[#f5af65] font-bold">{steamingTemp}°C {steamingTemp === 65 ? '(Sweet Spot)' : ''}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="80"
                    value={steamingTemp}
                    onChange={(e) => setSteamingTemp(Number(e.target.value))}
                    className="w-full accent-[#d98943] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#7a685b] mt-1 font-mono">
                    <span>50°C (Lukewarm)</span>
                    <span>65°C (Perfect Microfoam)</span>
                    <span>80°C (Scalded Milk)</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between pt-3">
              <button
                onClick={() => setStep('extract')}
                className="px-4 py-2 rounded-xl border border-[#3b2416] text-[#a89281] text-xs hover:text-white"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setStep('finish');
                }}
                className="px-6 py-2.5 rounded-xl bg-[#c88d58] text-[#1c120a] font-semibold text-xs hover:bg-[#d99b66] transition shadow-md"
              >
                Proceed to Finishes &amp; Flavors →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FLAVOR, TOPPING & LATTE ART */}
        {step === 'finish' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Syrup Infusion</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'none', label: 'Pure (No Syrup)' },
                  { id: 'vanilla', label: 'Madagascar Vanilla' },
                  { id: 'caramel', label: 'Salted Butter Caramel' },
                  { id: 'hazelnut', label: 'Toasted Hazelnut' },
                  { id: 'lavender', label: 'Wild French Lavender' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSyrup(s.id as SyrupType);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      syrup === s.id
                        ? 'border-[#d98943] bg-[#291a10] text-[#f5af65]'
                        : 'border-[#2d1b11] bg-[#180f09] text-[#b8a291] hover:bg-[#20140c]'
                    }`}
                  >
                    <span className="font-medium text-xs">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Spices, Garnishes &amp; Ice</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'cinnamon', label: 'Ceylon Cinnamon Dust' },
                  { id: 'cocoa_dust', label: 'Dutch Cocoa Powder' },
                  { id: 'caramel_drizzle', label: 'Caramel Swirl Drizzle' },
                  { id: 'whipped_cream', label: 'Whipped Sweet Cream' },
                  { id: 'ice', label: 'Solid Clear Ice Cubes' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTopping(t.id as ToppingType)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      toppings.includes(t.id as ToppingType)
                        ? 'border-[#d98943] bg-[#291a10] text-[#f5af65]'
                        : 'border-[#2d1b11] bg-[#180f09] text-[#a89281] hover:bg-[#20140c]'
                    }`}
                  >
                    <span className="font-medium text-xs">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Barista Latte Art Pour</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'none', label: 'Standard Pour', icon: '☕' },
                  { id: 'heart', label: 'Artisan Heart', icon: '🤍' },
                  { id: 'tulip', label: 'Stacked Tulip', icon: '🌷' },
                  { id: 'rosetta', label: 'Feather Rosetta', icon: '🌿' },
                ].map((art) => (
                  <button
                    key={art.id}
                    onClick={() => {
                      soundManager.playClick();
                      setLatteArt(art.id as LatteArtType);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      latteArt === art.id
                        ? 'border-[#d98943] bg-[#291a10] text-[#f5af65]'
                        : 'border-[#2d1b11] bg-[#180f09] text-[#a89281] hover:bg-[#20140c]'
                    }`}
                  >
                    <span className="text-lg block mb-1">{art.icon}</span>
                    <span className="font-medium text-xs">{art.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                onClick={() => setStep('milk')}
                className="px-4 py-2 rounded-xl border border-[#3b2416] text-[#a89281] text-xs hover:text-white"
              >
                ← Back
              </button>
              <button
                onClick={handleFinishBrew}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#d98943] to-[#ad6527] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Finish &amp; Evaluate Cup
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: FINAL RESULT EVALUATION & ACTIONS */}
        {step === 'result' && (
          <div className="space-y-6 text-center max-w-lg mx-auto py-2 animate-in fade-in duration-300">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#d98943] to-[#593414] p-0.5 shadow-2xl flex items-center justify-center text-4xl">
              {milk === 'none' ? '☕' : latteArt === 'heart' ? '🤍' : latteArt === 'tulip' ? '🌷' : '🥛'}
            </div>

            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#29170c] border border-[#4d2d18] text-[#f5af65] text-xs font-semibold uppercase tracking-wider mb-2">
                Craft Quality Score: {calculateFinalScore()}/100
              </div>
              <h3 className="text-xl font-bold font-display text-white">
                {activeCustomer ? activeCustomer.order.name : customName || 'Custom Reserve Coffee'}
              </h3>
              <p className="text-xs text-[#a89281] mt-1 max-w-sm mx-auto">
                Brewed with {bean.replace('_', ' ')} beans, {grind.replace('_', ' ')} grind, {milk} milk with {froth} froth.
              </p>
            </div>

            {/* Score breakdown metrics */}
            <div className="grid grid-cols-3 gap-2 bg-[#170e08] p-3 rounded-xl border border-[#2b180d] text-xs">
              <div>
                <span className="text-[#8c786a] block text-[10px]">Extraction</span>
                <span className="font-bold text-[#f5af65]">{extractionResult === 'perfect' ? '100% (9-Bar)' : extractionResult === 'under' ? '70% (Under)' : '65% (Over)'}</span>
              </div>
              <div>
                <span className="text-[#8c786a] block text-[10px]">Temperature</span>
                <span className="font-bold text-[#f5af65]">{steamingTemp}°C</span>
              </div>
              <div>
                <span className="text-[#8c786a] block text-[10px]">Art Finish</span>
                <span className="font-bold text-[#f5af65] capitalize">{latteArt !== 'none' ? latteArt : 'Clean'}</span>
              </div>
            </div>

            {/* Action branch: Deliver to active customer OR Save to Cafe Menu */}
            {activeCustomer ? (
              <div className="pt-2">
                <button
                  onClick={handleDeliverToCustomer}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#d98943] to-[#ad6527] text-white font-bold text-sm shadow-xl hover:brightness-110 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Deliver Cup to {activeCustomer.name}
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2 text-left bg-[#1a100a] p-4 rounded-xl border border-[#3b2315]">
                <h4 className="font-semibold text-white text-xs">Publish Custom Recipe to Cafe Menu</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-[#a89281] block mb-1">Recipe Name</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Vanilla Cloud Cortado"
                      className="w-full px-3 py-2 bg-[#120a05] border border-[#3b2315] rounded-lg text-white text-xs focus:outline-none focus:border-[#d98943]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#a89281] block mb-1">Menu Retail Price ($)</label>
                    <input
                      type="number"
                      step="0.25"
                      min="2.0"
                      max="15.0"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#120a05] border border-[#3b2315] rounded-lg text-white text-xs focus:outline-none focus:border-[#d98943]"
                    />
                  </div>

                  <button
                    onClick={handleSaveRecipeToMenu}
                    disabled={isSaved}
                    className="w-full py-2.5 rounded-xl bg-[#c88d58] text-[#1c120a] font-semibold text-xs hover:bg-[#d99b66] transition shadow disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-950" />
                        <span>Added to Official Menu!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Add Custom Recipe to Menu</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
