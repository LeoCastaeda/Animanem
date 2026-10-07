/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SceneId = 'intro' | 'beach' | 'forest' | 'ruins' | 'city' | 'underground' | 'final-boss' | 'ending' | 'endgame';

// IDs de personajes jugables
export type HeroId = 'hero' | 'zaigo' | 'wiku' | 'scrap';

// Habilidades únicas de cada personaje
export interface HeroAbility {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cooldown: number;
  effect: 'damage' | 'heal' | 'buff' | 'debuff' | 'special';
}

export interface HeroCharacter {
  id: HeroId;
  name: string;
  displayName: string;
  description: string;
  modelPath: string;
  baseHp: number;
  baseAttack: number;
  specialStat: string; // "Velocidad", "Defensa", etc.
  abilities: HeroAbility[];
  passive: string; // Habilidad pasiva
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  level: number;
  exp: number;
  attack: number;
  transformationUnlocked: boolean;
  isTransformed: boolean;
  energy: number;
  maxEnergy: number;
  shieldActive: boolean;
  heroModelPath: string;
  selectedHero: HeroId; // Personaje seleccionado actualmente
  abilityCooldowns: Record<string, number>; // Cooldowns de habilidades
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  type: 'basic' | 'boss' | 'elite';
  image?: string;
  modelPath?: string;
}

export interface UndergroundFloor {
  floor: number;
  difficulty: number;
  encounters: string[];
  rewards: string[];
}

export interface SaveSlot {
  slotId: number;
  timestamp: number;
  gameState: GameState;
  playerName?: string;
  screenshot?: string;
}

export interface GameState {
  currentScene: SceneId;
  player: PlayerStats;
  monstersDefeated: number;
  hasPet: boolean;
  hasLion: boolean;
  bestFriendStatus: 'alive' | 'dead' | 'revived';
  inventory: string[];
  defeatedMonsters: Record<SceneId, string[]>; // Monstruos derrotados por escena
  plannedEncounters: Record<SceneId, string[]>; // Lista de monstruos planeados para la escena
  currentEncounterId: number; // Índice del monstruo actual en plannedEncounters
  
  // Nuevos sistemas
  campaignCompleted: boolean; // Si completó la campaña principal
  undergroundProgress: number; // Piso actual en subterráneos
  endgameLevel: number; // Nivel en modo infinito
  unlockedHeroes: HeroId[]; // Personajes desbloqueados
}

export const INITIAL_STATE: GameState = {
  currentScene: 'intro',
  player: {
    hp: 100,
    maxHp: 100,
    level: 1,
    exp: 0,
    attack: 15,
    transformationUnlocked: false,
    isTransformed: false,
    energy: 0,
    maxEnergy: 100,
    shieldActive: false,
    heroModelPath: '/models/hero.glb',
    selectedHero: 'hero',
    abilityCooldowns: {},
  },
  monstersDefeated: 0,
  hasPet: false,
  hasLion: false,
  bestFriendStatus: 'alive',
  inventory: ['potion'],
  defeatedMonsters: {
    'intro': [], 'beach': [], 'forest': [], 'ruins': [], 'city': [], 'underground': [], 'final-boss': [], 'ending': [], 'endgame': [],
  },
  plannedEncounters: {
    'intro': [], 'beach': [], 'forest': [], 'ruins': [], 'city': [], 'underground': [], 'final-boss': [], 'ending': [], 'endgame': [],
  },
  currentEncounterId: 0,
  campaignCompleted: false,
  undergroundProgress: 0,
  endgameLevel: 0,
  unlockedHeroes: ['hero'], // Héroe desbloqueado por defecto
};


