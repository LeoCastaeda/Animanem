/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameState, Monster } from '../types';
import { getHeroById } from './heroes';

/**
 * Sistema de ejecución de habilidades en combate
 */

export interface AbilityResult {
  damage?: number;
  healing?: number;
  energyGain?: number;
  specialEffect?: string;
  logMessage: string;
  playerHpChange?: number;
  playerEnergyChange?: number;
  monsterHpChange?: number;
  shieldActivated?: boolean;
  buffApplied?: string;
  debuffApplied?: string;
}

/**
 * Ejecuta una habilidad específica de un personaje
 */
export function executeAbility(
  abilityId: string,
  gameState: GameState,
  monster: Monster
): AbilityResult | null {
  const hero = getHeroById(gameState.player.selectedHero);
  const ability = hero.abilities.find(a => a.id === abilityId);
  
  if (!ability) return null;
  
  // Verificar cooldown
  const currentCooldown = gameState.player.abilityCooldowns[abilityId] || 0;
  if (currentCooldown > 0) {
    return {
      logMessage: `⏱️ ${ability.name} está en cooldown. Espera ${currentCooldown} turno(s).`,
    };
  }
  
  // Verificar energía
  if (gameState.player.energy < ability.energyCost) {
    return {
      logMessage: `⚡ No tienes suficiente energía para usar ${ability.name}. Necesitas ${ability.energyCost} AP.`,
    };
  }
  
  const result: AbilityResult = {
    logMessage: '',
    playerEnergyChange: -ability.energyCost,
  };
  
  // Ejecutar habilidad específica según el ID
  switch (abilityId) {
    // HÉROE - Embestida Rápida
    case 'hero-dash-strike': {
      const baseDamage = gameState.player.attack * 1.5;
      const finalDamage = Math.round(baseDamage * 1.2); // Ignora 20% defensa
      result.damage = finalDamage;
      result.monsterHpChange = -finalDamage;
      result.logMessage = `⚔️ ${hero.displayName} usa EMBESTIDA RÁPIDA causando ${finalDamage} de daño!`;
      break;
    }
    
    // HÉROE - Escudo de Plumas
    case 'hero-feather-shield': {
      result.shieldActivated = true;
      result.logMessage = `🛡️ ${hero.displayName} despliega ESCUDO DE PLUMAS. Bloqueará el próximo ataque.`;
      break;
    }
    
    // HÉROE - Picado Celestial
    case 'hero-sky-dive': {
      const finalDamage = Math.round(gameState.player.attack * 2.5);
      result.damage = finalDamage;
      result.monsterHpChange = -finalDamage;
      result.logMessage = `🦅 ${hero.displayName} ejecuta PICADO CELESTIAL con furia! ${finalDamage} de daño devastador!`;
      break;
    }
    
    // ZAIGO - Puño del Trueno
    case 'zaigo-thunder-fist': {
      const finalDamage = Math.round(gameState.player.attack * 1.8);
      result.damage = finalDamage;
      result.monsterHpChange = -finalDamage;
      const paralyzed = Math.random() < 0.5;
      result.debuffApplied = paralyzed ? 'paralizado' : undefined;
      result.logMessage = `⚡ ZAIGO lanza PUÑO DEL TRUENO! ${finalDamage} de daño eléctrico!${paralyzed ? ' ¡El enemigo está paralizado!' : ''}`;
      break;
    }
    
    // ZAIGO - Chispa Vital
    case 'zaigo-volt-heal': {
      const healing = Math.round(gameState.player.maxHp * 0.4);
      result.healing = healing;
      result.playerHpChange = healing;
      result.logMessage = `💚 ZAIGO usa CHISPA VITAL y se regenera ${healing} HP con electricidad!`;
      break;
    }
    
    // ZAIGO - Tormenta Eléctrica
    case 'zaigo-lightning-storm': {
      const finalDamage = Math.round(gameState.player.attack * 3);
      result.damage = finalDamage;
      result.monsterHpChange = -finalDamage;
      // Si mata al objetivo, recupera energía
      if (monster.hp - finalDamage <= 0) {
        result.energyGain = 20;
        result.playerEnergyChange = (result.playerEnergyChange || 0) + 20;
        result.logMessage = `⚡🌩️ ¡ZAIGO invoca TORMENTA ELÉCTRICA DEFINITIVA! ${finalDamage} de daño masivo y recupera 20 energía al eliminar al enemigo!`;
      } else {
        result.logMessage = `⚡🌩️ ¡ZAIGO invoca TORMENTA ELÉCTRICA! ${finalDamage} de daño catastrófico!`;
      }
      break;
    }
    
    // WIKU - Hoja de Escarcha
    case 'wiku-frost-blade': {
      const finalDamage = Math.round(gameState.player.attack * 1.6);
      result.damage = finalDamage;
      result.monsterHpChange = -finalDamage;
      result.debuffApplied = 'debilitado';
      result.logMessage = `❄️ WIKU lanza HOJA DE ESCARCHA! ${finalDamage} de daño gélido! El enemigo pierde 15% ataque por 2 turnos.`;
      break;
    }
    
    // WIKU - Barrera de Hielo
    case 'wiku-ice-barrier': {
      result.buffApplied = 'barrera-hielo';
      result.logMessage = `🧊 WIKU crea BARRERA DE HIELO. Reduce 50% del daño recibido por 3 turnos.`;
      break;
    }
    
    // WIKU - Ventisca Polar
    case 'wiku-blizzard': {
      const finalDamage = Math.round(gameState.player.attack * 2.8);
      const healing = 30;
      result.damage = finalDamage;
      result.monsterHpChange = -finalDamage;
      result.healing = healing;
      result.playerHpChange = healing;
      result.logMessage = `❄️🌨️ ¡WIKU conjura VENTISCA POLAR! ${finalDamage} de daño congelante y se cura ${healing} HP!`;
      break;
    }
    
    // SCRAP - Recolectar Chatarra
    case 'scrap-scavenge': {
      const foundItem = Math.random() < 0.3;
      if (foundItem) {
        const items = ['potion', 'elixir', 'crystal', 'shield'];
        const item = items[Math.floor(Math.random() * items.length)];
        result.specialEffect = `found-item:${item}`;
        result.logMessage = `🔧 SCRAP recolecta chatarra y encuentra un objeto: ${item}!`;
      } else {
        result.logMessage = `🔧 SCRAP recolecta chatarra pero no encuentra nada útil esta vez.`;
      }
      break;
    }
    
    // SCRAP - Sobrecarga
    case 'scrap-overdrive': {
      result.buffApplied = 'sobrecarga';
      result.logMessage = `⚙️ SCRAP activa SOBRECARGA! +50% ataque por 3 turnos (pero pierde 10 HP/turno).`;
      break;
    }
    
    // SCRAP - Pulso EMP
    case 'scrap-emp-blast': {
      const finalDamage = Math.round(gameState.player.attack * 2.2);
      result.damage = finalDamage;
      result.monsterHpChange = -finalDamage;
      result.debuffApplied = 'silenciado';
      result.logMessage = `⚡🔧 SCRAP libera PULSO EMP! ${finalDamage} de daño electromagnético! Enemigo silenciado por 2 turnos.`;
      break;
    }
    
    default:
      return null;
  }
  
  return result;
}

/**
 * Verifica si una habilidad está disponible
 */
export function isAbilityAvailable(
  abilityId: string,
  gameState: GameState
): { available: boolean; reason?: string } {
  const hero = getHeroById(gameState.player.selectedHero);
  const ability = hero.abilities.find(a => a.id === abilityId);
  
  if (!ability) {
    return { available: false, reason: 'Habilidad no encontrada' };
  }
  
  const cooldown = gameState.player.abilityCooldowns[abilityId] || 0;
  if (cooldown > 0) {
    return { available: false, reason: `Cooldown: ${cooldown} turno(s)` };
  }
  
  if (gameState.player.energy < ability.energyCost) {
    return { available: false, reason: `Requiere ${ability.energyCost} AP` };
  }
  
  return { available: true };
}

/**
 * Reduce cooldowns al final del turno
 */
export function tickCooldowns(cooldowns: Record<string, number>): Record<string, number> {
  const newCooldowns: Record<string, number> = {};
  
  for (const [abilityId, cooldown] of Object.entries(cooldowns)) {
    const newCooldown = Math.max(0, cooldown - 1);
    if (newCooldown > 0) {
      newCooldowns[abilityId] = newCooldown;
    }
  }
  
  return newCooldowns;
}

/**
 * Activa el cooldown de una habilidad
 */
export function setCooldown(
  cooldowns: Record<string, number>,
  abilityId: string,
  turns: number
): Record<string, number> {
  return {
    ...cooldowns,
    [abilityId]: turns,
  };
}

/**
 * Verifica y ejecuta habilidad pasiva
 */
export function checkPassiveAbility(
  heroId: string,
  trigger: 'on-attack' | 'on-damage' | 'on-dodge' | 'on-item-use',
  context: { damage?: number; isKill?: boolean }
): { triggered: boolean; effect?: string; value?: number } {
  const hero = getHeroById(heroId);
  
  switch (heroId) {
    case 'hero':
      // Reflejos Aviares: +10 energía al esquivar
      if (trigger === 'on-dodge' && Math.random() < 0.2) {
        return { triggered: true, effect: 'energy-gain', value: 10 };
      }
      break;
      
    case 'zaigo':
      // Sobrecarga Eléctrica: 15% chance daño doble
      if (trigger === 'on-attack' && Math.random() < 0.15) {
        return { triggered: true, effect: 'double-damage' };
      }
      break;
      
    case 'wiku':
      // Aura Gélida: -10% daño recibido (siempre activo)
      if (trigger === 'on-damage' && context.damage) {
        return { triggered: true, effect: 'damage-reduction', value: Math.round(context.damage * 0.1) };
      }
      break;
      
    case 'scrap':
      // Reciclaje Eficiente: 25% chance de no gastar objeto
      if (trigger === 'on-item-use' && Math.random() < 0.25) {
        return { triggered: true, effect: 'item-refund' };
      }
      break;
  }
  
  return { triggered: false };
}
