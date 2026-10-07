/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameState, SaveSlot } from '../types.ts';

const SAVE_KEY_PREFIX = 'animanem_save_slot_';
const MAX_SAVE_SLOTS = 5;

/**
 * Guarda el estado actual del juego en un slot específico de localStorage.
 */
export function saveGame(state: GameState, slotId: number = 0): void {
  try {
    if (slotId < 0 || slotId >= MAX_SAVE_SLOTS) {
      throw new Error(`SlotId debe estar entre 0 y ${MAX_SAVE_SLOTS - 1}`);
    }

    const saveSlot: SaveSlot = {
      slotId,
      timestamp: Date.now(),
      gameState: state,
      playerName: `Slot ${slotId + 1}`,
    };

    const serializedState = JSON.stringify(saveSlot);
    localStorage.setItem(`${SAVE_KEY_PREFIX}${slotId}`, serializedState);
  } catch (error) {
    console.error('Error al guardar el estado del juego en localStorage:', error);
  }
}

/**
 * Carga el estado guardado del juego desde un slot específico de localStorage.
 * Retorna null si no hay datos guardados o si hay algún error.
 */
export function loadGame(slotId: number = 0): GameState | null {
  try {
    if (slotId < 0 || slotId >= MAX_SAVE_SLOTS) {
      throw new Error(`SlotId debe estar entre 0 y ${MAX_SAVE_SLOTS - 1}`);
    }

    const serializedState = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotId}`);
    if (!serializedState) return null;
    
    const saveSlot = JSON.parse(serializedState) as SaveSlot;
    return saveSlot.gameState;
  } catch (error) {
    console.error('Error al cargar el estado del juego desde localStorage:', error);
    return null;
  }
}

/**
 * Obtiene todos los slots de guardado disponibles.
 */
export function getAllSaveSlots(): (SaveSlot | null)[] {
  const slots: (SaveSlot | null)[] = [];
  
  for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
    try {
      const serializedState = localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`);
      if (serializedState) {
        slots.push(JSON.parse(serializedState) as SaveSlot);
      } else {
        slots.push(null);
      }
    } catch (error) {
      console.error(`Error al cargar el slot ${i}:`, error);
      slots.push(null);
    }
  }
  
  return slots;
}

/**
 * Comprueba si hay una partida guardada en un slot específico.
 */
export function hasSaveData(slotId: number = 0): boolean {
  try {
    if (slotId < 0 || slotId >= MAX_SAVE_SLOTS) return false;
    return localStorage.getItem(`${SAVE_KEY_PREFIX}${slotId}`) !== null;
  } catch {
    return false;
  }
}

/**
 * Comprueba si hay alguna partida guardada en cualquier slot.
 */
export function hasAnySaveData(): boolean {
  for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
    if (hasSaveData(i)) return true;
  }
  return false;
}

/**
 * Elimina la partida guardada en un slot específico de localStorage.
 */
export function clearSaveData(slotId: number = 0): void {
  try {
    if (slotId < 0 || slotId >= MAX_SAVE_SLOTS) {
      throw new Error(`SlotId debe estar entre 0 y ${MAX_SAVE_SLOTS - 1}`);
    }
    localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotId}`);
  } catch (error) {
    console.error('Error al eliminar los datos de guardado en localStorage:', error);
  }
}

/**
 * Elimina todos los slots de guardado.
 */
export function clearAllSaveData(): void {
  for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
    clearSaveData(i);
  }
}

/**
 * Obtiene el número máximo de slots de guardado.
 */
export function getMaxSaveSlots(): number {
  return MAX_SAVE_SLOTS;
}
