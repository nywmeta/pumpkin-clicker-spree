export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  currency: number;
  isBoss: boolean;
  attackPattern?: BossAttack[];
}

export interface BossAttack {
  id: string;
  direction: 'down' | 'down-left' | 'down-right';
  damage: number;
  dodgeWindow: number; // milliseconds to dodge
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  damageIncrease: number;
  owned: number;
}

export interface Weapon {
  id: string;
  name: string;
  damageBonus: number;
  rarity: number;
}

export type RarityTier = 
  | 'gray' 
  | 'light_blue' 
  | 'blue' 
  | 'green' 
  | 'yellow' 
  | 'orange' 
  | 'red' 
  | 'pink' 
  | 'violet' 
  | 'black';

export const RARITY_COLORS: Record<RarityTier, string> = {
  gray: '#9CA3AF',
  light_blue: '#7DD3FC',
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#EAB308',
  orange: '#F97316',
  red: '#EF4444',
  pink: '#EC4899',
  violet: '#A855F7',
  black: '#000000',
};

export const RARITY_NAMES: Record<RarityTier, string> = {
  gray: 'Common',
  light_blue: 'Uncommon',
  blue: 'Rare',
  green: 'Epic',
  yellow: 'Legendary',
  orange: 'Mythic',
  red: 'Ancient',
  pink: 'Divine',
  violet: 'Celestial',
  black: 'Primordial',
};

export interface InventoryItem {
  id: string;
  user_id: string;
  item_type: 'weapon' | 'upgrade';
  item_name: string;
  rarity: RarityTier;
  damage_bonus: number;
  materials: number;
  equipped: boolean;
  slot?: 'left_hand' | 'right_hand' | null;
  created_at: string;
}

export interface PlayerProgress {
  current_stage: number;
  current_level: number;
  damage_per_click: number;
  currency: number;
  upgrades: any;
  left_hand_weapon?: string | null;
  right_hand_weapon?: string | null;
  attack_damage: number;
  crafting_materials: number;
}
