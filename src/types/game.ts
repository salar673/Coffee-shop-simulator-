export type BeanType = 'dark_roast' | 'ethiopian_light' | 'colombian_medium' | 'decaf_swiss';
export type GrindLevel = 'fine_espresso' | 'medium_drip' | 'coarse_coldbrew';
export type BrewMethod = 'espresso' | 'pourover' | 'coldbrew' | 'frenchpress';
export type MilkType = 'none' | 'whole' | 'oat' | 'almond' | 'sweet_cream';
export type MilkFroth = 'none' | 'flat' | 'microfoam' | 'dense_cap' | 'cold_foam';
export type SyrupType = 'none' | 'vanilla' | 'caramel' | 'hazelnut' | 'lavender';
export type ToppingType = 'cinnamon' | 'cocoa_dust' | 'caramel_drizzle' | 'whipped_cream' | 'ice';
export type LatteArtType = 'none' | 'heart' | 'tulip' | 'rosetta';

export interface RecipeIngredients {
  beanType: BeanType;
  grindLevel: GrindLevel;
  brewMethod: BrewMethod;
  milkType: MilkType;
  milkFroth: MilkFroth;
  syrup: SyrupType;
  toppings: ToppingType[];
  latteArt: LatteArtType;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'espresso' | 'milk_specialty' | 'iced_cold' | 'artisan_custom';
  ingredients: RecipeIngredients;
  price: number;
  cost: number;
  unlocked: boolean;
  isCustom: boolean;
  timesBrewed: number;
  avgRating: number;
  icon: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'grinder' | 'espresso_machine' | 'steamer' | 'cold_tap' | 'interior' | 'pos';
  level: number;
  maxLevel: number;
  title: string;
  description: string;
  upgradeCost: number;
  speedBonus: number; // percentage speedup
  qualityBonus: number; // boost to extraction score & customer satisfaction
  patienceBonus: number; // interior patience boost
  slots: number; // concurrent drinks
}

export type StaffRole = 'barista' | 'cashier' | 'cleaner' | 'manager';
export type WorkStation = 'counter' | 'espresso_bar' | 'pourover_bar' | 'floor_clean' | 'break_room';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  avatar: string;
  level: number;
  speedSkill: number; // 1-100
  craftSkill: number; // 1-100
  dailyWage: number;
  energy: number; // 0-100
  station: WorkStation;
  hired: boolean;
  hireCost: number;
  quote: string;
}

export type CustomerPersonality = 'coffee_connoisseur' | 'busy_commuter' | 'studious_regular' | 'trendy_influencer' | 'sweet_tooth';

export interface Customer {
  id: string;
  name: string;
  avatar: string;
  personality: CustomerPersonality;
  order: Recipe;
  patience: number; // 0 to 100
  maxPatience: number;
  state: 'arriving' | 'ordering' | 'waiting' | 'drinking' | 'served' | 'left_unhappy';
  entryTime: number;
  waitTime: number;
  tipMultiplier: number;
  specialPreference?: string;
  customNote?: string;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  personality: CustomerPersonality;
  avatar: string;
  rating: number; // 1 to 5
  comment: string;
  recipeName: string;
  tipPaid: number;
  day: number;
  timeAgo: string;
}

export interface Inventory {
  beans: {
    dark_roast: number;
    ethiopian_light: number;
    colombian_medium: number;
    decaf_swiss: number;
  };
  milks: {
    whole: number;
    oat: number;
    almond: number;
    sweet_cream: number;
  };
  syrups: {
    vanilla: number;
    caramel: number;
    hazelnut: number;
    lavender: number;
  };
  cups: number;
  ice: number;
}

export interface DaySummary {
  day: number;
  totalCustomers: number;
  satisfiedCustomers: number;
  unhappyCustomers: number;
  grossRevenue: number;
  totalTips: number;
  wagesPaid: number;
  suppliesUsedCost: number;
  netProfit: number;
  avgSatisfaction: number;
  bestSellingRecipe: string;
}

export interface ActiveBrewSession {
  targetCustomer?: Customer;
  recipeId?: string;
  // Steps
  currentStep: 'grind' | 'extract' | 'milk' | 'finish' | 'result';
  selectedBean: BeanType;
  selectedGrind: GrindLevel;
  selectedMethod: BrewMethod;
  extractionProgress: number; // 0-100
  extractionScore: number; // calculated by player timing
  selectedMilk: MilkType;
  steamedTemp: number; // ideal 65C
  frothTexture: MilkFroth;
  selectedSyrup: SyrupType;
  selectedToppings: ToppingType[];
  selectedLatteArt: LatteArtType;
  finalScore: number; // 0-100
  brewNotes: string[];
}
