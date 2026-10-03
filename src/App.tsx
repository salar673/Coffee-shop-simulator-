/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Customer,
  StaffMember,
  EquipmentItem,
  Recipe,
  Inventory,
  CustomerReview,
  DaySummary,
  WorkStation,
  CustomerPersonality,
} from './types/game';
import {
  INITIAL_RECIPES,
  INITIAL_EQUIPMENT,
  INITIAL_STAFF,
  INITIAL_INVENTORY,
} from './data/initialData';
import { Header } from './components/Header';
import { FloorAndCounter } from './components/FloorAndCounter';
import { BrewingStation } from './components/BrewingStation';
import { RecipeBook } from './components/RecipeBook';
import { EquipmentShop } from './components/EquipmentShop';
import { StaffManager } from './components/StaffManager';
import { InventoryManager } from './components/InventoryManager';
import { DaySummaryModal } from './components/DaySummaryModal';
import { IpaExportModal } from './components/IpaExportModal';
import { soundManager } from './utils/audio';
import confetti from 'canvas-confetti';
import { Play, Pause, FastForward, CheckCircle2 } from 'lucide-react';

const CUSTOMER_NAMES = [
  'Elena Rostova',
  'Julian Vance',
  'Maya Lin',
  'Liam Becker',
  'Amara Diallo',
  'Felix Sterling',
  'Chloe Bennett',
  'Kai Takahashi',
  'Zoe Morales',
  'Marcus Thorne',
  'Aria Montgomery',
  'Noah Fischer',
];

const CUSTOMER_AVATARS = ['🧑‍💼', '👩‍🎨', '👨‍💻', '👩‍🏫', '🧑‍🔬', '👩‍🌾', '🧑‍🎓', '👩‍💻'];

const PERSONALITIES: CustomerPersonality[] = [
  'coffee_connoisseur',
  'busy_commuter',
  'studious_regular',
  'trendy_influencer',
  'sweet_tooth',
];

export default function App() {
  // Cafe Core State
  const [cafeName] = useState('Velvet Roast Coffeehouse');
  const [cash, setCash] = useState(480);
  const [day, setDay] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(120); // 120s shift
  const [isShiftActive, setIsShiftActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState<1 | 2>(1);

  const [starRating, setStarRating] = useState(4.8);
  const [cleanliness, setCleanliness] = useState(92);

  // Entities
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [equipment, setEquipment] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [inventory, setInventory] = useState<Inventory>(INITIAL_INVENTORY);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);

  // Shift Ledger Tracking
  const [dayStats, setDayStats] = useState({
    grossRevenue: 0,
    totalTips: 0,
    suppliesCost: 0,
    servedCount: 0,
    unhappyCount: 0,
    ratingsSum: 0,
  });

  const [daySummary, setDaySummary] = useState<DaySummary | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Navigation & Modals
  const [currentTab, setCurrentTab] = useState<'floor' | 'brew' | 'recipes' | 'equipment' | 'staff' | 'inventory'>('floor');
  const [activeBrewCustomer, setActiveBrewCustomer] = useState<Customer | null>(null);
  const [isIpaModalOpen, setIsIpaModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Keep a ref to staff and equipment for ticker closures
  const staffRef = useRef(staff);
  staffRef.current = staff;
  const equipmentRef = useRef(equipment);
  equipmentRef.current = equipment;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  // Equipment Stat Helpers
  const getEquipmentBonus = (category: string) => {
    const item = equipment.find((e) => e.category === category);
    return item ? { speed: item.speedBonus, quality: item.qualityBonus, patience: item.patienceBonus } : { speed: 0, quality: 0, patience: 0 };
  };

  // Generate Customer
  const generateCustomer = (): Customer => {
    const unlockedRecipes = recipes.filter((r) => r.unlocked);
    const chosenOrder = unlockedRecipes[Math.floor(Math.random() * unlockedRecipes.length)];
    const personality = PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
    const interiorBonus = getEquipmentBonus('interior').patience;

    // Base patience around 55s
    const basePatience = personality === 'busy_commuter' ? 35 : personality === 'coffee_connoisseur' ? 50 : 65;
    const maxPatience = basePatience + interiorBonus;

    return {
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
      avatar: CUSTOMER_AVATARS[Math.floor(Math.random() * CUSTOMER_AVATARS.length)],
      personality,
      order: chosenOrder,
      patience: maxPatience,
      maxPatience,
      state: 'ordering',
      entryTime: Date.now(),
      waitTime: 0,
      tipMultiplier: personality === 'trendy_influencer' ? 1.4 : 1.0,
    };
  };

  // Main Simulation Loop
  useEffect(() => {
    if (!isShiftActive || isPaused) return;

    const interval = setInterval(() => {
      // 1. Decrement Day Clock
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endCurrentDay();
          return 0;
        }
        return prev - 1;
      });

      // 2. Customer Spawning
      setCustomers((prevCustomers) => {
        const interiorItem = equipmentRef.current.find((e) => e.category === 'interior');
        const maxCapacity = (interiorItem ? interiorItem.slots : 4) + 2;

        // Chance to spawn customer if under capacity
        if (prevCustomers.length < maxCapacity && Math.random() < 0.35) {
          return [...prevCustomers, generateCustomer()];
        }
        return prevCustomers;
      });

      // 3. Customer Patience Decay
      setCustomers((prevCustomers) => {
        const nextCustomers: Customer[] = [];

        prevCustomers.forEach((cust) => {
          const decayed = cust.patience - 1;

          if (decayed <= 0) {
            // Customer walked away frustrated!
            soundManager.playClick();
            handleCustomerWalkout(cust);
          } else {
            nextCustomers.push({ ...cust, patience: decayed, waitTime: cust.waitTime + 1 });
          }
        });

        return nextCustomers;
      });

      // 4. Autonomous Staff Actions (Baristas brew, Cleaners clean)
      const currentStaff = staffRef.current;
      const baristas = currentStaff.filter((s) => s.hired && s.station === 'espresso_bar');
      const cleaners = currentStaff.filter((s) => s.hired && s.station === 'floor_clean');

      // Cleaning action
      if (cleaners.length > 0) {
        setCleanliness((prev) => Math.min(100, prev + 0.4 * cleaners.length));
      } else {
        // Slow hygiene decay
        setCleanliness((prev) => Math.max(20, Number((prev - 0.05).toFixed(1))));
      }

      // Barista autonomous preparation tick
      if (baristas.length > 0 && Math.random() < 0.28) {
        setCustomers((prevCustomers) => {
          if (prevCustomers.length === 0) return prevCustomers;
          // Serve the first customer in line!
          const [servingCust, ...rest] = prevCustomers;
          const leadBarista = baristas[0];
          setTimeout(() => {
            fulfillOrder(servingCust, leadBarista.craftSkill, leadBarista.name);
          }, 0);
          return rest;
        });
      }
    }, 1000 / gameSpeed);

    return () => clearInterval(interval);
  }, [isShiftActive, isPaused, gameSpeed]);

  // Handle unhappy customer walkout
  const handleCustomerWalkout = (cust: Customer) => {
    setDayStats((prev) => ({
      ...prev,
      unhappyCount: prev.unhappyCount + 1,
      ratingsSum: prev.ratingsSum + 1,
    }));

    const walkoutReview: CustomerReview = {
      id: `rev_${Date.now()}`,
      customerName: cust.name,
      personality: cust.personality,
      avatar: cust.avatar,
      rating: 1,
      comment: 'Waited over 10 minutes in line and walked out empty handed. Disappointing.',
      recipeName: cust.order.name,
      tipPaid: 0,
      day,
      timeAgo: 'Just now',
    };
    setReviews((prev) => [walkoutReview, ...prev]);
    showNotification(`${cust.name} left due to long wait time!`);
  };

  // Fulfill an order (manual or staff)
  const fulfillOrder = (cust: Customer, qualityScore: number, serverName?: string) => {
    soundManager.playCashRegister();

    // Calculate Tip & Pricing
    const basePrice = cust.order.price;
    const patienceRatio = cust.patience / cust.maxPatience;
    const qualityRatio = qualityScore / 100;
    const tip = Math.max(0.25, Number((basePrice * 0.2 * patienceRatio * qualityRatio * cust.tipMultiplier).toFixed(2)));

    const earned = basePrice + tip;
    const ingredientCost = cust.order.cost || 0.9;

    setCash((prev) => Number((prev + earned).toFixed(2)));
    setDayStats((prev) => ({
      ...prev,
      grossRevenue: prev.grossRevenue + basePrice,
      totalTips: prev.totalTips + tip,
      suppliesCost: prev.suppliesCost + ingredientCost,
      servedCount: prev.servedCount + 1,
      ratingsSum: prev.ratingsSum + Math.round((qualityScore / 100) * 5),
    }));

    // Update recipe brewed count
    setRecipes((prev) =>
      prev.map((r) => (r.id === cust.order.id ? { ...r, timesBrewed: r.timesBrewed + 1 } : r))
    );

    // Deduct cups and ingredients from inventory
    setInventory((prev) => ({
      ...prev,
      cups: Math.max(0, prev.cups - 1),
      beans: {
        ...prev.beans,
        [cust.order.ingredients.beanType]: Math.max(0, prev.beans[cust.order.ingredients.beanType] - 1),
      },
    }));

    // Generate Review
    const stars = qualityScore >= 90 ? 5 : qualityScore >= 75 ? 4 : qualityScore >= 60 ? 3 : 2;
    const comments5Star = [
      'The crema was absolute perfection! Best specialty cup in town.',
      'Smooth microfoam and the espresso notes were vibrant and sweet.',
      'Incredible latte art and lightning-fast craft. A must-visit!',
      'Velvety texture. My new morning routine spot!',
    ];
    const comments4Star = [
      'Great coffee and lovely shop ambiance.',
      'Flavor was on point! Steaming could be slightly hotter, but delicious.',
      'Solid brew, definitely coming back for more.',
    ];
    const comments3Star = [
      'Decent cup, a bit rushed during the morning rush.',
      'A bit too bitter, but drinkable.',
    ];

    const commentPool = stars >= 5 ? comments5Star : stars >= 4 ? comments4Star : comments3Star;
    const chosenComment = commentPool[Math.floor(Math.random() * commentPool.length)];

    const newReview: CustomerReview = {
      id: `rev_${Date.now()}`,
      customerName: cust.name,
      personality: cust.personality,
      avatar: cust.avatar,
      rating: stars,
      comment: chosenComment,
      recipeName: cust.order.name,
      tipPaid: tip,
      day,
      timeAgo: 'Just now',
    };
    setReviews((prev) => [newReview, ...prev]);

    if (stars === 5) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#f5af65', '#d98943'],
      });
    }

    showNotification(`Served ${cust.name}! Earned $${earned.toFixed(2)} ($${tip.toFixed(2)} tip)`);
  };

  // Complete Order via Manual Barista Station
  const handleCompleteManualBrew = (score: number, brewedRecipe: Partial<Recipe>) => {
    if (activeBrewCustomer) {
      fulfillOrder(activeBrewCustomer, score, 'You (Master Barista)');
      setCustomers((prev) => prev.filter((c) => c.id !== activeBrewCustomer.id));
      setActiveBrewCustomer(null);
      setCurrentTab('floor');
    }
  };

  // Staff Serve Order button from Floor
  const handleStaffServeOrder = (customer: Customer, staffId: string) => {
    const staffMember = staff.find((s) => s.id === staffId);
    if (!staffMember) return;

    soundManager.playSteamHiss();
    setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    fulfillOrder(customer, staffMember.craftSkill, staffMember.name);
  };

  // Clean Cafe
  const handleCleanCafe = () => {
    soundManager.playClick();
    setCleanliness((prev) => Math.min(100, prev + 15));
    showNotification('Counter wiped & tables sanitized! Cleanliness boosted.');
  };

  // End of Day Shift Routine
  const endCurrentDay = () => {
    setIsShiftActive(false);
    soundManager.playSuccessChime();

    // Calculate Staff Wages
    const totalWages = staff.filter((s) => s.hired).reduce((sum, s) => sum + s.dailyWage, 0);

    const netProfit = Number(
      (dayStats.grossRevenue + dayStats.totalTips - totalWages - dayStats.suppliesCost).toFixed(2)
    );

    // Deduct wages from cash
    setCash((prev) => Math.max(0, Number((prev - totalWages).toFixed(2))));

    const totalCust = dayStats.servedCount + dayStats.unhappyCount;
    const avgSat = totalCust > 0 ? dayStats.ratingsSum / totalCust : 4.8;
    setStarRating(Number(((starRating * 0.7) + (avgSat * 0.3)).toFixed(1)));

    const summary: DaySummary = {
      day,
      totalCustomers: totalCust,
      satisfiedCustomers: dayStats.servedCount,
      unhappyCustomers: dayStats.unhappyCount,
      grossRevenue: dayStats.grossRevenue,
      totalTips: dayStats.totalTips,
      wagesPaid: totalWages,
      suppliesUsedCost: dayStats.suppliesCost,
      netProfit,
      avgSatisfaction: avgSat,
      bestSellingRecipe: 'Artisan Espresso',
    };

    setDaySummary(summary);
    setIsSummaryOpen(true);
  };

  // Start Next Day
  const handleStartNextDay = () => {
    setIsSummaryOpen(false);
    setDay((prev) => prev + 1);
    setTimeRemaining(120);
    setCustomers([]);
    setDayStats({
      grossRevenue: 0,
      totalTips: 0,
      suppliesCost: 0,
      servedCount: 0,
      unhappyCount: 0,
      ratingsSum: 0,
    });
    setIsShiftActive(true);
    setCurrentTab('floor');
    showNotification(`Day ${day + 1} has begun! Morning rush arriving.`);
  };

  // Upgrades
  const handleUpgradeEquipment = (id: string) => {
    setEquipment((prev) =>
      prev.map((item) => {
        if (item.id === id && item.level < item.maxLevel && cash >= item.upgradeCost) {
          setCash((c) => Number((c - item.upgradeCost).toFixed(2)));
          return {
            ...item,
            level: item.level + 1,
            speedBonus: item.speedBonus + 12,
            qualityBonus: item.qualityBonus + 10,
            patienceBonus: item.patienceBonus + (item.category === 'interior' ? 20 : 0),
            upgradeCost: Math.round(item.upgradeCost * 1.8),
          };
        }
        return item;
      })
    );
    showNotification('Equipment upgraded successfully!');
  };

  // Staff Management
  const handleHireStaff = (id: string) => {
    const member = staff.find((s) => s.id === id);
    if (!member || cash < member.hireCost) return;
    setCash((c) => Number((c - member.hireCost).toFixed(2)));
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, hired: true, station: 'espresso_bar' } : s))
    );
    showNotification(`Hired ${member.name}! Assigned to Espresso Bar.`);
  };

  const handleFireStaff = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, hired: false, station: 'break_room' } : s))
    );
    showNotification('Staff member dismissed.');
  };

  const handleTrainStaff = (id: string) => {
    const member = staff.find((s) => s.id === id);
    if (!member) return;
    const cost = member.level * 50;
    if (cash < cost) return;
    setCash((c) => Number((c - cost).toFixed(2)));
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              level: s.level + 1,
              speedSkill: Math.min(99, s.speedSkill + 12),
              craftSkill: Math.min(99, s.craftSkill + 10),
              dailyWage: s.dailyWage + 15,
            }
          : s
      )
    );
    showNotification(`${member.name} promoted to Tier ${member.level + 1}!`);
  };

  const handleAssignStation = (id: string, station: WorkStation) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, station } : s)));
  };

  // Custom Recipe creation
  const handleSaveCustomRecipe = (newRecipe: Recipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
    showNotification(`Published "${newRecipe.name}" to Cafe Menu!`);
  };

  const handleUpdateRecipePrice = (id: string, newPrice: number) => {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, price: newPrice } : r)));
    showNotification('Menu price updated.');
  };

  const handleUnlockRecipe = (id: string) => {
    if (cash < 150) return;
    setCash((c) => Number((c - 150).toFixed(2)));
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, unlocked: true } : r)));
    showNotification('Secret recipe unlocked!');
  };

  // Inventory Restock
  const handleRestock = (
    category: 'beans' | 'milks' | 'syrups' | 'cups',
    itemKey: string,
    amount: number,
    cost: number
  ) => {
    if (cash < cost) return;
    setCash((c) => Number((c - cost).toFixed(2)));
    setInventory((prev) => {
      if (category === 'beans') {
        const key = itemKey as keyof typeof prev.beans;
        return { ...prev, beans: { ...prev.beans, [key]: prev.beans[key] + amount } };
      } else if (category === 'milks') {
        const key = itemKey as keyof typeof prev.milks;
        return { ...prev, milks: { ...prev.milks, [key]: prev.milks[key] + amount } };
      } else if (category === 'syrups') {
        const key = itemKey as keyof typeof prev.syrups;
        return { ...prev, syrups: { ...prev.syrups, [key]: prev.syrups[key] + amount } };
      } else {
        if (itemKey === 'cups') return { ...prev, cups: prev.cups + amount };
        return { ...prev, ice: prev.ice + amount };
      }
    });
    showNotification(`Restocked ${amount} units of ${itemKey.replace('_', ' ')}!`);
  };

  return (
    <div className="min-h-screen bg-[#0f0b08] text-[#f5efe6] flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          setActiveBrewCustomer(null);
          setCurrentTab(tab);
        }}
        cash={cash}
        starRating={starRating}
        day={day}
        onOpenIpaModal={() => setIsIpaModalOpen(true)}
      />

      {/* Shift Controls Floating Banner */}
      <div className="bg-[#18100a] border-b border-[#2d1b11] px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Day {day} Active Shift
            </span>
            <span className="text-[#a89281]">·</span>
            <span className="font-mono text-[#f5af65]">
              Closing in: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setIsPaused((p) => !p);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#241710] hover:bg-[#332116] border border-[#3b2518] text-[#e8ded4] font-medium flex items-center gap-1.5 transition"
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
              <span>{isPaused ? 'Resume Shift' : 'Pause'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setGameSpeed((s) => (s === 1 ? 2 : 1));
              }}
              className={`px-2.5 py-1 rounded-lg border font-mono transition flex items-center gap-1 ${
                gameSpeed === 2
                  ? 'bg-[#c88d58] text-[#1c120a] font-bold border-[#e0a875]'
                  : 'bg-[#241710] border-[#3b2518] text-[#a89281]'
              }`}
              title="Fast Forward Simulation"
            >
              <FastForward className="w-3 h-3" />
              <span>{gameSpeed}x</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                endCurrentDay();
              }}
              className="px-3 py-1 rounded-lg bg-[#2b180d] hover:bg-[#3d2416] text-[#f5af65] font-semibold border border-[#4d2f1c] transition"
            >
              Close Shift Early
            </button>
          </div>
        </div>
      </div>

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'floor' && (
          <FloorAndCounter
            customers={customers}
            staff={staff}
            cleanliness={cleanliness}
            onManualBrewOrder={(c) => {
              setActiveBrewCustomer(c);
              setCurrentTab('brew');
            }}
            onStaffServeOrder={handleStaffServeOrder}
            onCleanCafe={handleCleanCafe}
            reviews={reviews}
          />
        )}

        {currentTab === 'brew' && (
          <BrewingStation
            activeCustomer={activeBrewCustomer}
            onCompleteCustomerOrder={handleCompleteManualBrew}
            onSaveCustomRecipe={handleSaveCustomRecipe}
            inventory={inventory}
            onCancelBrew={() => {
              setActiveBrewCustomer(null);
              setCurrentTab('floor');
            }}
          />
        )}

        {currentTab === 'recipes' && (
          <RecipeBook
            recipes={recipes}
            cash={cash}
            onUpdateRecipePrice={handleUpdateRecipePrice}
            onUnlockRecipe={handleUnlockRecipe}
            onOpenBrewLabWithRecipe={(r) => {
              setCurrentTab('brew');
            }}
            onStartCustomBrew={() => {
              setActiveBrewCustomer(null);
              setCurrentTab('brew');
            }}
          />
        )}

        {currentTab === 'equipment' && (
          <EquipmentShop
            equipment={equipment}
            cash={cash}
            onUpgradeEquipment={handleUpgradeEquipment}
          />
        )}

        {currentTab === 'staff' && (
          <StaffManager
            staff={staff}
            cash={cash}
            onHireStaff={handleHireStaff}
            onFireStaff={handleFireStaff}
            onTrainStaff={handleTrainStaff}
            onAssignStation={handleAssignStation}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryManager
            inventory={inventory}
            cash={cash}
            onRestock={handleRestock}
          />
        )}
      </main>

      {/* Shift End Day Summary Modal */}
      <DaySummaryModal
        summary={daySummary}
        isOpen={isSummaryOpen}
        onStartNextDay={handleStartNextDay}
      />

      {/* iOS IPA Export Modal */}
      <IpaExportModal
        isOpen={isIpaModalOpen}
        onClose={() => setIsIpaModalOpen(false)}
        cafeName={cafeName}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#23150d] border border-[#4a2e1b] text-white shadow-2xl text-xs font-medium animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#f5af65] shrink-0" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}
