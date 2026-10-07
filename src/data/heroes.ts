/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeroCharacter, HeroAbility } from '../types';

// ==========================================
// HABILIDADES DE HÉROE (Patas de Pájaro)
// ==========================================
const heroAbilities: HeroAbility[] = [
  {
    id: 'hero-dash-strike',
    name: 'Embestida Rápida',
    description: 'Usa tus patas de ave para lanzarte contra el enemigo. Daño x1.5 + ignora 20% defensa.',
    energyCost: 30,
    cooldown: 2,
    effect: 'damage',
  },
  {
    id: 'hero-feather-shield',
    name: 'Escudo de Plumas',
    description: 'Despliega un aura protectora. Absorbe el próximo ataque completamente.',
    energyCost: 40,
    cooldown: 3,
    effect: 'buff',
  },
  {
    id: 'hero-sky-dive',
    name: 'Picado Celestial',
    description: 'Saltas y ejecutas un ataque aéreo devastador. Daño x2.5 pero consume 50 energía.',
    energyCost: 50,
    cooldown: 4,
    effect: 'damage',
  },
];

// ==========================================
// HABILIDADES DE ZAIGO (Pelo Amarillo)
// ==========================================
const zaigoAbilities: HeroAbility[] = [
  {
    id: 'zaigo-thunder-fist',
    name: 'Puño del Trueno',
    description: 'Canaliza electricidad en tu puño. Daño x1.8 + paraliza al enemigo 1 turno (50% chance).',
    energyCost: 35,
    cooldown: 2,
    effect: 'damage',
  },
  {
    id: 'zaigo-volt-heal',
    name: 'Chispa Vital',
    description: 'Usa energía eléctrica para regenerarte. Recupera 40% HP máximo.',
    energyCost: 45,
    cooldown: 3,
    effect: 'heal',
  },
  {
    id: 'zaigo-lightning-storm',
    name: 'Tormenta Eléctrica',
    description: 'Libera una descarga masiva. Daño x3 + restaura 20 energía si mata al objetivo.',
    energyCost: 60,
    cooldown: 5,
    effect: 'special',
  },
];

// ==========================================
// HABILIDADES DE WIKU (Pelo Azul)
// ==========================================
const wikuAbilities: HeroAbility[] = [
  {
    id: 'wiku-frost-blade',
    name: 'Hoja de Escarcha',
    description: 'Congela tu arma y la lanzas. Daño x1.6 + reduce ataque enemigo 15% por 2 turnos.',
    energyCost: 30,
    cooldown: 2,
    effect: 'debuff',
  },
  {
    id: 'wiku-ice-barrier',
    name: 'Barrera de Hielo',
    description: 'Crea un muro gélido. Absorbe 50% del daño recibido por 3 turnos.',
    energyCost: 40,
    cooldown: 3,
    effect: 'buff',
  },
  {
    id: 'wiku-blizzard',
    name: 'Ventisca Polar',
    description: 'Invoca un blizzard devastador. Daño x2.8 + cura 30 HP al usuario.',
    energyCost: 55,
    cooldown: 4,
    effect: 'special',
  },
];

// ==========================================
// HABILIDADES DE SCRAP
// ==========================================
const scrapAbilities: HeroAbility[] = [
  {
    id: 'scrap-scavenge',
    name: 'Recolectar Chatarra',
    description: 'Busca entre los restos del combate. 30% chance de obtener un objeto aleatorio.',
    energyCost: 20,
    cooldown: 3,
    effect: 'special',
  },
  {
    id: 'scrap-overdrive',
    name: 'Sobrecarga',
    description: 'Fuerza tus sistemas al límite. +50% ataque por 3 turnos pero pierdes 10 HP/turno.',
    energyCost: 35,
    cooldown: 4,
    effect: 'buff',
  },
  {
    id: 'scrap-emp-blast',
    name: 'Pulso EMP',
    description: 'Libera un pulso electromagnético. Daño x2.2 + silencia habilidades enemigas 2 turnos.',
    energyCost: 50,
    cooldown: 5,
    effect: 'damage',
  },
];

// ==========================================
// DEFINICIÓN COMPLETA DE PERSONAJES
// ==========================================
export const HEROES: Record<string, HeroCharacter> = {
  hero: {
    id: 'hero',
    name: 'hero',
    displayName: 'HÉROE',
    description: 'El guerrero con patas de pájaro. Ágil y versátil, equilibrado en ataque y defensa.',
    modelPath: '/models/hero.glb',
    baseHp: 100,
    baseAttack: 15,
    specialStat: 'Velocidad: Alta',
    abilities: heroAbilities,
    passive: 'Reflejos Aviares: +10 energía extra al esquivar ataques (20% chance)',
  },
  
  zaigo: {
    id: 'zaigo',
    name: 'zaigo',
    displayName: 'ZAIGO',
    description: 'El guerrero del pelo amarillo. Maestro del rayo, alto daño explosivo.',
    modelPath: '/models/hero_zaigo.glb',
    baseHp: 90,
    baseAttack: 18,
    specialStat: 'Poder Mágico: Muy Alto',
    abilities: zaigoAbilities,
    passive: 'Sobrecarga Eléctrica: Cada ataque tiene 15% chance de infligir daño doble',
  },
  
  wiku: {
    id: 'wiku',
    name: 'wiku',
    displayName: 'WIKU',
    description: 'La guerrera del pelo azul. Especialista en hielo, control y defensa superiores.',
    modelPath: '/models/hero_wiku.glb',
    baseHp: 110,
    baseAttack: 13,
    specialStat: 'Resistencia: Muy Alta',
    abilities: wikuAbilities,
    passive: 'Aura Gélida: Reduce el daño recibido en 10% permanentemente',
  },
  
  scrap: {
    id: 'scrap',
    name: 'scrap',
    displayName: 'SCRAP',
    description: 'El ingeniero mecánico. Adaptable y astuto, utiliza tecnología y objetos.',
    modelPath: '/models/hero_scrapy.glb',
    baseHp: 95,
    baseAttack: 16,
    specialStat: 'Ingenio: Máximo',
    abilities: scrapAbilities,
    passive: 'Reciclaje Eficiente: Los objetos consumidos tienen 25% chance de no gastarse',
  },
};

export function getHeroById(heroId: string): HeroCharacter {
  return HEROES[heroId] || HEROES.hero;
}
