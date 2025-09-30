export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  currency: number;
  isBoss: boolean;
}

export interface PlayerProgress {
  current_stage: number;
  current_level: number;
  damage_per_click: number;
  currency: number;
  upgrades: any;
}
