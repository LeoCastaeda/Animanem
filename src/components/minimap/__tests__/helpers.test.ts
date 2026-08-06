/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { getPathNodeVisualState, getNodeColorClasses } from '../helpers';
import { VisualState, NodeType } from '../types';

describe('getPathNodeVisualState', () => {
  describe('Requirements 1.2, 1.3, 1.4: Visual state based on index relative to currentEncounterId', () => {
    it('should return "completed" when index < currentEncounterId', () => {
      expect(getPathNodeVisualState(0, 3)).toBe('completed');
      expect(getPathNodeVisualState(1, 3)).toBe('completed');
      expect(getPathNodeVisualState(2, 3)).toBe('completed');
    });

    it('should return "active" when index === currentEncounterId', () => {
      expect(getPathNodeVisualState(0, 0)).toBe('active');
      expect(getPathNodeVisualState(3, 3)).toBe('active');
      expect(getPathNodeVisualState(5, 5)).toBe('active');
    });

    it('should return "pending" when index > currentEncounterId', () => {
      expect(getPathNodeVisualState(4, 3)).toBe('pending');
      expect(getPathNodeVisualState(5, 3)).toBe('pending');
      expect(getPathNodeVisualState(10, 5)).toBe('pending');
    });

    it('should handle edge case: first encounter (index 0)', () => {
      expect(getPathNodeVisualState(0, 0)).toBe('active');
      expect(getPathNodeVisualState(0, 1)).toBe('completed');
    });

    it('should handle edge case: large currentEncounterId values', () => {
      expect(getPathNodeVisualState(99, 100)).toBe('completed');
      expect(getPathNodeVisualState(100, 100)).toBe('active');
      expect(getPathNodeVisualState(101, 100)).toBe('pending');
    });
  });
});

describe('getNodeColorClasses', () => {
  describe('Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6: Color classes for type-state combinations', () => {
    describe('enemy nodes', () => {
      it('should return correct classes for completed state', () => {
        const classes = getNodeColorClasses('enemy', 'completed');
        expect(classes).toBe('fill-red-950/80 stroke-red-900/30');
      });

      it('should return correct classes for active state', () => {
        const classes = getNodeColorClasses('enemy', 'active');
        expect(classes).toBe('fill-red-950/40 stroke-red-500 stroke-[1.5px]');
      });

      it('should return correct classes for pending state', () => {
        const classes = getNodeColorClasses('enemy', 'pending');
        expect(classes).toBe('fill-red-950/40 stroke-red-500 stroke-[1.5px]');
      });
    });

    describe('mission nodes', () => {
      it('should return correct classes for completed state', () => {
        const classes = getNodeColorClasses('mission', 'completed');
        expect(classes).toBe('fill-purple-950/80 stroke-purple-900/30');
      });

      it('should return correct classes for active state', () => {
        const classes = getNodeColorClasses('mission', 'active');
        expect(classes).toBe('fill-purple-950/40 stroke-purple-500 stroke-[1.5px]');
      });

      it('should return correct classes for pending state', () => {
        const classes = getNodeColorClasses('mission', 'pending');
        expect(classes).toBe('fill-purple-950/40 stroke-purple-500 stroke-[1.5px]');
      });
    });

    describe('rune nodes', () => {
      it('should return correct classes for completed state', () => {
        const classes = getNodeColorClasses('rune', 'completed');
        expect(classes).toBe('fill-cyan-950/80 stroke-cyan-900/30');
      });

      it('should return correct classes for active state', () => {
        const classes = getNodeColorClasses('rune', 'active');
        expect(classes).toBe('fill-cyan-950/40 stroke-cyan-300 stroke-[1.5px]');
      });

      it('should return correct classes for pending state', () => {
        const classes = getNodeColorClasses('rune', 'pending');
        expect(classes).toBe('fill-cyan-950/40 stroke-cyan-300 stroke-[1.5px]');
      });
    });

    describe('start nodes', () => {
      it('should return same classes for all states', () => {
        const expectedClasses = 'fill-indigo-950/50 stroke-indigo-400';
        expect(getNodeColorClasses('start', 'completed')).toBe(expectedClasses);
        expect(getNodeColorClasses('start', 'active')).toBe(expectedClasses);
        expect(getNodeColorClasses('start', 'pending')).toBe(expectedClasses);
      });
    });

    describe('end nodes', () => {
      it('should return same classes for all states', () => {
        const expectedClasses = 'fill-emerald-950/50 stroke-emerald-400';
        expect(getNodeColorClasses('end', 'completed')).toBe(expectedClasses);
        expect(getNodeColorClasses('end', 'active')).toBe(expectedClasses);
        expect(getNodeColorClasses('end', 'pending')).toBe(expectedClasses);
      });
    });

    describe('unknown nodes', () => {
      it('should return fallback classes for unknown node types', () => {
        const expectedClasses = 'fill-slate-700 stroke-slate-500';
        expect(getNodeColorClasses('unknown', 'completed')).toBe(expectedClasses);
        expect(getNodeColorClasses('unknown', 'active')).toBe(expectedClasses);
        expect(getNodeColorClasses('unknown', 'pending')).toBe(expectedClasses);
      });
    });

    describe('edge cases', () => {
      it('should handle all NodeType values', () => {
        const nodeTypes: NodeType[] = ['start', 'end', 'enemy', 'mission', 'rune', 'unknown'];
        const visualStates: VisualState[] = ['completed', 'active', 'pending'];

        nodeTypes.forEach(type => {
          visualStates.forEach(state => {
            const result = getNodeColorClasses(type, state);
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });
});
