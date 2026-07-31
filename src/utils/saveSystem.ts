/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameState } from '../types.ts';

const SAVE_KEY = 'animanem_save_data';

/**
 * Guarda el estado actual del juego en localStorage.
 */
export function saveGame(state: GameState): void {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(SAVE_KEY, serializedState);
  } catch (error) {
    console.error('Error al guardar el estado del juego en localStorage:', error);
  }
}

/**
 * Carga el estado guardado del juego desde localStorage.
 * Retorna null si no hay datos guardados o si hay algún error.
 */
export function loadGame(): GameState | null {
  try {
    const serializedState = localStorage.getItem(SAVE_KEY);
    if (!serializedState) return null;
    return JSON.parse(serializedState) as GameState;
  } catch (error) {
    console.error('Error al cargar el estado del juego desde localStorage:', error);
    return null;
  }
}

/**
 * Comprueba si hay una partida guardada en localStorage.
 */
export function hasSaveData(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Elimina la partida guardada en localStorage.
 */
export function clearSaveData(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error('Error al eliminar los datos de guardado en localStorage:', error);
  }
}
