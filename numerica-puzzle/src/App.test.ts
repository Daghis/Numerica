import { describe, it, expect } from 'vitest';
import { levelDefinitions, type ButtonData, ButtonState } from './App';

// Mock ButtonData for testing purposes
const createMockButtons = (pressedIds: number[] = []): ButtonData[] => {
  const buttons: ButtonData[] = [
    { id: 1, label: '1', state: ButtonState.Pressable },
    { id: 2, label: '2', state: ButtonState.Pressable },
    { id: 3, label: '3', state: ButtonState.Pressable },
    { id: 4, label: '4', state: ButtonState.Pressable },
    { id: 5, label: '5', state: ButtonState.Pressable },
  ];
  return buttons.map(button =>
    pressedIds.includes(button.id) ? { ...button, state: ButtonState.WasPressed } : button
  );
};

describe('Level Predicates', () => {
  // Level 1 & 2: Any order, all pressed completion
  describe('Level 1 & 2', () => {
    const level1Def = levelDefinitions[1];

    it('should allow any move', () => {
      expect(level1Def.movePredicate(1, createMockButtons(), [])).toBe(true);
      expect(level1Def.movePredicate(3, createMockButtons([1]), [1])).toBe(true);
    });

    it('should be complete when all buttons are pressed', () => {
      expect(level1Def.completionPredicate(createMockButtons([1, 2, 3, 4, 5]), [])).toBe(true);
      expect(level1Def.completionPredicate(createMockButtons([1, 2, 3]), [])).toBe(false);
    });
  });

  // Level 3: Sequential order (any first button, then sequential), all pressed completion
  describe('Level 3', () => {
    const level3Def = levelDefinitions[3];

    it('should allow any button as the first move', () => {
      expect(level3Def.movePredicate(1, createMockButtons(), [])).toBe(true);
      expect(level3Def.movePredicate(3, createMockButtons(), [])).toBe(true);
      expect(level3Def.movePredicate(5, createMockButtons(), [])).toBe(true);
    });

    it('should enforce ascending order after a first move', () => {
      expect(level3Def.movePredicate(2, createMockButtons([1]), [1])).toBe(true);
      expect(level3Def.movePredicate(3, createMockButtons([2]), [2])).toBe(true);
      expect(level3Def.movePredicate(4, createMockButtons([3]), [3])).toBe(true);
      expect(level3Def.movePredicate(5, createMockButtons([4]), [4])).toBe(true);
      expect(level3Def.movePredicate(4, createMockButtons([1]), [1])).toBe(false); // Out of order
    });

    it('should enforce descending order after a first move', () => {
      expect(level3Def.movePredicate(4, createMockButtons([5]), [5])).toBe(true);
      expect(level3Def.movePredicate(3, createMockButtons([4]), [4])).toBe(true);
      expect(level3Def.movePredicate(2, createMockButtons([3]), [3])).toBe(true);
      expect(level3Def.movePredicate(1, createMockButtons([2]), [2])).toBe(true);
      expect(level3Def.movePredicate(2, createMockButtons([5]), [5])).toBe(false); // Out of order
    });

    it('should maintain direction after second move (ascending)', () => {
      expect(level3Def.movePredicate(3, createMockButtons([1, 2]), [1, 2])).toBe(true);
      expect(level3Def.movePredicate(1, createMockButtons([1, 2]), [1, 2])).toBe(false); // Wrong direction
    });

    it('should maintain direction after second move (descending)', () => {
      expect(level3Def.movePredicate(3, createMockButtons([5, 4]), [5, 4])).toBe(true);
      expect(level3Def.movePredicate(5, createMockButtons([5, 4]), [5, 4])).toBe(false); // Wrong direction
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
