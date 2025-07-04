import { describe, it, expect } from 'vitest';
import { levelDefinitions } from './App';

// Mock ButtonData for testing purposes
const createMockButtons = (pressedIds: number[] = []) => {
  const buttons = [
    { id: 1, label: '1', state: 'pressable' },
    { id: 2, label: '2', state: 'pressable' },
    { id: 3, label: '3', state: 'pressable' },
    { id: 4, label: '4', state: 'pressable' },
    { id: 5, label: '5', state: 'pressable' },
  ];
  return buttons.map(button =>
    pressedIds.includes(button.id) ? { ...button, state: 'was-pressed' } : button
  );
};

describe('Level Predicates', () => {
  // Level 1 & 2: Any order, all pressed completion
  describe('Level 1 & 2', () => {
    const level1Def = levelDefinitions[1];
    const level2Def = levelDefinitions[2];

    it('should allow any move', () => {
      expect(level1Def.movePredicate(1, createMockButtons(), [])).toBe(true);
      expect(level1Def.movePredicate(3, createMockButtons([1]), [1])).toBe(true);
    });

    it('should be complete when all buttons are pressed', () => {
      expect(level1Def.completionPredicate(createMockButtons([1, 2, 3, 4, 5]), [])).toBe(true);
      expect(level1Def.completionPredicate(createMockButtons([1, 2, 3]), [])).toBe(false);
    });
  });

  // Level 3: Sequential order (ascending or descending), all pressed completion
  describe('Level 3', () => {
    const level3Def = levelDefinitions[3];

    it('should allow 1 as the first move', () => {
      expect(level3Def.movePredicate(1, createMockButtons(), [])).toBe(true);
    });

    it('should allow 5 as the first move', () => {
      expect(level3Def.movePredicate(5, createMockButtons(), [])).toBe(true);
    });

    it('should enforce ascending order after 1', () => {
      expect(level3Def.movePredicate(2, createMockButtons([1]), [1])).toBe(true);
      expect(level3Def.movePredicate(3, createMockButtons([1, 2]), [1, 2])).toBe(true);
      expect(level3Def.movePredicate(4, createMockButtons([1, 2, 3]), [1, 2, 3])).toBe(true);
      expect(level3Def.movePredicate(5, createMockButtons([1, 2, 3, 4]), [1, 2, 3, 4])).toBe(true);
      expect(level3Def.movePredicate(3, createMockButtons([1]), [1])).toBe(false); // Out of order
    });

    it('should enforce descending order after 5', () => {
      expect(level3Def.movePredicate(4, createMockButtons([5]), [5])).toBe(true);
      expect(level3Def.movePredicate(3, createMockButtons([5, 4]), [5, 4])).toBe(true);
      expect(level3Def.movePredicate(2, createMockButtons([5, 4, 3]), [5, 4, 3])).toBe(true);
      expect(level3Def.movePredicate(1, createMockButtons([5, 4, 3, 2]), [5, 4, 3, 2])).toBe(true);
      expect(level3Def.movePredicate(3, createMockButtons([5]), [5])).toBe(false); // Out of order
    });

    it('should reject 4 after 5 if not the next in sequence', () => {
      expect(level3Def.movePredicate(4, createMockButtons([5]), [5])).toBe(true);
      expect(level3Def.movePredicate(2, createMockButtons([5, 4]), [5, 4])).toBe(false); // 2 is not next after 4
    });

    it('should not allow incorrect first moves', () => {
      expect(level3Def.movePredicate(2, createMockButtons(), [])).toBe(false);
      expect(level3Def.movePredicate(3, createMockButtons(), [])).toBe(false);
    });

    it('should be complete when all buttons are pressed', () => {
      expect(level3Def.completionPredicate(createMockButtons([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5])).toBe(true);
      expect(level3Def.completionPredicate(createMockButtons([5, 4, 3, 2, 1]), [5, 4, 3, 2, 1])).toBe(true);
      expect(level3Def.completionPredicate(createMockButtons([1, 2, 3]), [1, 2, 3])).toBe(false);
    });
  });

  // Level 4: Non-adjacent order, all pressed completion
  describe('Level 4', () => {
    const level4Def = levelDefinitions[4];

    it('should allow any first move', () => {
      expect(level4Def.movePredicate(1, createMockButtons(), [])).toBe(true);
      expect(level4Def.movePredicate(3, createMockButtons(), [])).toBe(true);
    });

    it('should not allow adjacent moves', () => {
      expect(level4Def.movePredicate(3, createMockButtons([1]), [1])).toBe(true); // 1 -> 3 (non-adjacent)
      expect(level4Def.movePredicate(2, createMockButtons([1]), [1])).toBe(false); // 1 -> 2 (adjacent)
      expect(level4Def.movePredicate(4, createMockButtons([5]), [5])).toBe(false); // 5 -> 4 (adjacent)
    });

    it('should be complete when all buttons are pressed', () => {
      expect(level4Def.completionPredicate(createMockButtons([1, 2, 3, 4, 5]), [])).toBe(true);
      expect(level4Def.completionPredicate(createMockButtons([1, 3, 5]), [])).toBe(false);
    });
  });
});
