/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SceneId = 'intro' | 'beach' | 'forest' | 'ruins' | 'city' | 'final-boss' | 'ending';

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
}

export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  type: 'basic' | 'boss';
  image?: string;
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
  },
  monstersDefeated: 0,
  hasPet: false,
  hasLion: false,
  bestFriendStatus: 'alive',
  inventory: ['potion'],
  defeatedMonsters: {
    'intro': [], 'beach': [], 'forest': [], 'ruins': [], 'city': [], 'final-boss': [], 'ending': [],
  },
  plannedEncounters: {
    'intro': [], 'beach': [], 'forest': [], 'ruins': [], 'city': [], 'final-boss': [], 'ending': [],
  },
  currentEncounterId: 0,
};


