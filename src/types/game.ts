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

export interface PlayerProgress {
  current_stage: number;
  current_level: number;
  damage_per_click: number;
  currency: number;
  upgrades: any;
  left_hand_weapon?: string | null;
  right_hand_weapon?: string | null;
  attack_damage: number;
}
