/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Visual state of a path node on the minimap
 * - completed: Node represents an encounter that has been finished
 * - active: Node represents the current encounter
 * - pending: Node represents an upcoming encounter
 */
export type VisualState = 'completed' | 'active' | 'pending';

/**
 * Type of node in the path
 * - start: Starting point of the scene
 * - end: Exit point of the scene
 * - enemy: Combat encounter with a monster
 * - mission: Event encounter (chest, shrine, etc.)
 * - rune: Rune alignment mini-game event
 * - unknown: Fallback for unrecognized encounters
 */
export type NodeType = 'start' | 'end' | 'enemy' | 'mission' | 'rune' | 'unknown';

/**
 * Data structure for tooltip information displayed on hover
 */
export interface TooltipData {
  name: string;
  desc: string;
  type: 'player' | 'enemy' | 'mission' | 'rune' | 'building' | 'npc' | 'start' | 'end';
  state?: VisualState; // Optional: for encounter nodes only
  x: number;
  y: number;
}

/**
 * Extended MapElement interface with optional encounter link
 * Used for buildings and NPCs that should be hidden/shown based on progress
 * 
 * Requirements: 3.4
 */
export interface MapElement {
  name: string;
  x: number; // 0-100 coordinate
  y: number; // 0-100 coordinate
  desc: string;
  linkedEncounterId?: number; // Optional: index of encounter this element is associated with
}
