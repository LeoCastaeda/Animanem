/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Skull, Gift, Sparkles, User, Sparkle } from 'lucide-react';
import { NodeType, VisualState } from './types';

/**
 * Mapping of encounter types to their corresponding Lucide React icons
 * Used for consistent icon rendering across compact and expanded minimap views
 */
export const ENCOUNTER_ICON_MAP = {
  enemy: Skull,
  'event:chest': Gift,
  'event:shrine': Sparkles,
  'event:rune-alignment': Sparkles, // with cyan color class
  'event:pet': User, // with emerald color class
  'event:lion': User, // with orange color class
  'event:friend-relic': Sparkle
} as const;

/**
 * Color classes for each node type and visual state combination
 * Returns Tailwind CSS classes for fill, stroke, and other visual properties
 * 
 * Pattern: `fill-{color}-{shade}/{opacity} stroke-{color}-{shade} stroke-[width]`
 */
export const NODE_COLOR_CLASSES: Record<NodeType, Record<VisualState, string>> = {
  enemy: {
    completed: 'fill-red-950/80 stroke-red-900/30',
    active: 'fill-red-950/40 stroke-red-500 stroke-[1.5px]',
    pending: 'fill-red-950/40 stroke-red-500 stroke-[1.5px]'
  },
  mission: {
    completed: 'fill-purple-950/80 stroke-purple-900/30',
    active: 'fill-purple-950/40 stroke-purple-500 stroke-[1.5px]',
    pending: 'fill-purple-950/40 stroke-purple-500 stroke-[1.5px]'
  },
  rune: {
    completed: 'fill-cyan-950/80 stroke-cyan-900/30',
    active: 'fill-cyan-950/40 stroke-cyan-300 stroke-[1.5px]',
    pending: 'fill-cyan-950/40 stroke-cyan-300 stroke-[1.5px]'
  },
  start: {
    completed: 'fill-indigo-950/50 stroke-indigo-400',
    active: 'fill-indigo-950/50 stroke-indigo-400',
    pending: 'fill-indigo-950/50 stroke-indigo-400'
  },
  end: {
    completed: 'fill-emerald-950/50 stroke-emerald-400',
    active: 'fill-emerald-950/50 stroke-emerald-400',
    pending: 'fill-emerald-950/50 stroke-emerald-400'
  },
  unknown: {
    completed: 'fill-slate-700 stroke-slate-500',
    active: 'fill-slate-700 stroke-slate-500',
    pending: 'fill-slate-700 stroke-slate-500'
  }
};

/**
 * Icon color classes for each node type and visual state combination
 * Used for styling the Lucide icons rendered on path nodes
 */
export const ICON_COLOR_CLASSES: Record<NodeType, Record<VisualState, string>> = {
  enemy: {
    completed: 'text-red-500/30',
    active: 'text-red-400',
    pending: 'text-red-400'
  },
  mission: {
    completed: 'text-purple-500/30',
    active: 'text-purple-400',
    pending: 'text-purple-400'
  },
  rune: {
    completed: 'text-cyan-500/30',
    active: 'text-cyan-300',
    pending: 'text-cyan-300'
  },
  start: {
    completed: 'text-indigo-400',
    active: 'text-indigo-400',
    pending: 'text-indigo-400'
  },
  end: {
    completed: 'text-emerald-400',
    active: 'text-emerald-400',
    pending: 'text-emerald-400'
  },
  unknown: {
    completed: 'text-white/40',
    active: 'text-white/40',
    pending: 'text-white/40'
  }
};
