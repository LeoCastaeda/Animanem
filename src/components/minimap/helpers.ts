/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VisualState, NodeType, MapElement } from './types';
import { NODE_COLOR_CLASSES, ICON_COLOR_CLASSES } from './constants';

/**
 * Determines the visual state of a path node based on its position relative to current progress
 * 
 * @param index - The index of the node in the pathPoints array
 * @param currentEncounterId - The current encounter ID (index in plannedEncounters)
 * @returns The visual state: 'completed', 'active', or 'pending'
 * 
 * Requirements: 1.2, 1.3, 1.4
 */
export function getPathNodeVisualState(index: number, currentEncounterId: number): VisualState {
  // TODO: Implement in Task 2.1
  if (index < currentEncounterId) return 'completed';
  if (index === currentEncounterId) return 'active';
  return 'pending';
}

/**
 * Returns the appropriate CSS classes for a node based on its type and visual state
 * 
 * @param type - The type of node (enemy, mission, rune, etc.)
 * @param state - The visual state (completed, active, pending)
 * @returns String of Tailwind CSS classes
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
export function getNodeColorClasses(type: NodeType, state: VisualState): string {
  // TODO: Implement in Task 2.3
  return NODE_COLOR_CLASSES[type]?.[state] || NODE_COLOR_CLASSES.unknown[state];
}

/**
 * Returns the appropriate icon color classes for a node based on its type and visual state
 * 
 * @param type - The type of node (enemy, mission, rune, etc.)
 * @param state - The visual state (completed, active, pending)
 * @returns String of Tailwind CSS color classes for icons
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
export function getIconColorClasses(type: NodeType, state: VisualState): string {
  return ICON_COLOR_CLASSES[type]?.[state] || ICON_COLOR_CLASSES.unknown[state];
}

/**
 * Determines whether a map element should be rendered based on completion status
 * 
 * @param element - The map element (building or NPC)
 * @param currentEncounterId - The current encounter ID
 * @returns true if element should be visible, false if it should be hidden
 * 
 * Requirements: 3.1, 3.2, 3.3
 */
export function shouldRenderMapElement(element: MapElement, currentEncounterId: number): boolean {
  if (element.linkedEncounterId === undefined) return true;
  if (element.linkedEncounterId < currentEncounterId) return false;
  return true;
}

/**
 * Generates an SVG path string for the visited portion of the route
 * 
 * @param pathPoints - Array of all path points (start, encounters, end)
 * @param currentEncounterId - The current encounter ID
 * @returns SVG path string (M...L...L...) or empty string if no progress
 * 
 * Requirements: 4.1, 4.2
 */
export function getVisitedPathSegment(
  pathPoints: Array<{ x: number; y: number }>,
  currentEncounterId: number
): string {
  // TODO: Implement in Task 8.1
  if (currentEncounterId === 0) return '';
  const visitedPoints = pathPoints.slice(0, currentEncounterId + 1);
  return `M ${visitedPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;
}
