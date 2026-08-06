/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { shouldRenderMapElement } from '../helpers';
import { MapElement } from '../types';

describe('Minimap Helpers - Property-Based Tests', () => {
  // Feature: minimap-game-correlation, Property 4: Map Element Visibility Based on Completion
  describe('Property 4: Map Element Visibility Based on Completion', () => {
    it('elements without linkedEncounterId are always visible', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            x: fc.nat({ max: 100 }),
            y: fc.nat({ max: 100 }),
            desc: fc.string(),
            // linkedEncounterId is undefined
          }),
          fc.integer({ min: 0, max: 20 }),
          (element: MapElement, currentEncounterId: number) => {
            const result = shouldRenderMapElement(element, currentEncounterId);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('elements with linkedEncounterId < currentEncounterId are hidden', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 1, max: 5 }),
          (linkedEncounterId: number, offset: number) => {
            const currentEncounterId = linkedEncounterId + offset;
            const element: MapElement = {
              name: 'Test Element',
              x: 50,
              y: 50,
              desc: 'Test',
              linkedEncounterId
            };
            
            const result = shouldRenderMapElement(element, currentEncounterId);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('elements with linkedEncounterId >= currentEncounterId are visible', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 0, max: 5 }),
          (currentEncounterId: number, offset: number) => {
            const linkedEncounterId = currentEncounterId + offset;
            const element: MapElement = {
              name: 'Test Element',
              x: 50,
              y: 50,
              desc: 'Test',
              linkedEncounterId
            };
            
            const result = shouldRenderMapElement(element, currentEncounterId);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('elements with linkedEncounterId === currentEncounterId are visible', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20 }),
          (encounterId: number) => {
            const element: MapElement = {
              name: 'Test Element',
              x: 50,
              y: 50,
              desc: 'Test',
              linkedEncounterId: encounterId
            };
            
            const result = shouldRenderMapElement(element, encounterId);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('comprehensive visibility test with all scenarios', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            x: fc.nat({ max: 100 }),
            y: fc.nat({ max: 100 }),
            desc: fc.string(),
            linkedEncounterId: fc.option(fc.integer({ min: 0, max: 20 }), { nil: undefined })
          }),
          fc.integer({ min: 0, max: 20 }),
          (element: MapElement, currentEncounterId: number) => {
            const result = shouldRenderMapElement(element, currentEncounterId);
            
            // Verify the property holds
            if (element.linkedEncounterId === undefined) {
              expect(result).toBe(true);
            } else if (element.linkedEncounterId < currentEncounterId) {
              expect(result).toBe(false);
            } else {
              expect(result).toBe(true);
            }
          }
        ),
        { numRuns: 200 }
      );
    });
  });
});
