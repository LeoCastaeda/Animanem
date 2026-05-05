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
  bestFriendStatus: 'alive' | 'dead' | 'revived';
  inventory: string[];
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
  },
  monstersDefeated: 0,
  hasPet: false,
  bestFriendStatus: 'alive',
  inventory: [],
};
