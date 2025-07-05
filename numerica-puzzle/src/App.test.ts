import { describe, it, expect } from 'vitest';
import { levelDefinitions, type ButtonData, ButtonState } from './App';

// Mock ButtonData for testing purposes
const createMockButtons = (pressedIds: number[] = [], count = 5): ButtonData[] => {
  const buttons: ButtonData[] = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    label: `${i + 1}`,
    state: ButtonState.Pressable,
  }));
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

  // Level 5: Specific sequence completion
  describe('Level 5', () => {
    const level5Def = levelDefinitions[5];

    it('should only allow the first button in the sequence', () => {
      expect(level5Def.movePredicate(1, createMockButtons(), [])).toBe(true);
      expect(level5Def.movePredicate(2, createMockButtons(), [])).toBe(false);
    });

    it('should only allow the second button in the sequence after the first is pressed', () => {
      expect(level5Def.movePredicate(3, createMockButtons([1]), [1])).toBe(true);
      expect(level5Def.movePredicate(2, createMockButtons([1]), [1])).toBe(false);
    });

    it('should only allow the third button in the sequence after the first two are pressed', () => {
      expect(level5Def.movePredicate(5, createMockButtons([1, 3]), [1, 3])).toBe(true);
      expect(level5Def.movePredicate(4, createMockButtons([1, 3]), [1, 3])).toBe(false);
    });

    it('should not allow moves after the sequence is complete', () => {
      expect(level5Def.movePredicate(1, createMockButtons([1, 3, 5]), [1, 3, 5])).toBe(false);
    });

    it('should be complete only when the specific sequence [1, 3, 5] is pressed', () => {
      expect(level5Def.completionPredicate(createMockButtons([1, 3, 5]), [1, 3, 5])).toBe(true);
      expect(level5Def.completionPredicate(createMockButtons([1, 2, 3]), [1, 2, 3])).toBe(false);
      expect(level5Def.completionPredicate(createMockButtons([1, 3]), [1, 3])).toBe(false);
      expect(level5Def.completionPredicate(createMockButtons([1, 3, 5, 2]), [1, 3, 5, 2])).toBe(false);
    });
  });

  // Level 6: Odd numbers, all odd buttons pressed completion
  describe('Level 6', () => {
    const level6Def = levelDefinitions[6];

    it('should only allow odd-numbered buttons to be pressed', () => {
      expect(level6Def.movePredicate(1, createMockButtons([], 9), [])).toBe(true);
      expect(level6Def.movePredicate(2, createMockButtons([], 9), [])).toBe(false);
      expect(level6Def.movePredicate(3, createMockButtons([], 9), [])).toBe(true);
      expect(level6Def.movePredicate(4, createMockButtons([], 9), [])).toBe(false);
      expect(level6Def.movePredicate(5, createMockButtons([], 9), [])).toBe(true);
      expect(level6Def.movePredicate(6, createMockButtons([], 9), [])).toBe(false);
      expect(level6Def.movePredicate(7, createMockButtons([], 9), [])).toBe(true);
            expect(level6Def.movePredicate(8, createMockButtons([], 9), [])).toBe(false);
      expect(level6Def.movePredicate(9, createMockButtons([], 9), [])).toBe(true);
    });

    it('should be complete when all odd-numbered buttons are pressed', () => {
      expect(level6Def.completionPredicate(createMockButtons([1, 3, 5, 7, 9], 9), [])).toBe(true);
      expect(level6Def.completionPredicate(createMockButtons([1, 3, 5, 7], 9), [])).toBe(false);
      expect(level6Def.completionPredicate(createMockButtons([1, 2, 3, 5, 7, 9], 9), [])).toBe(true);
    });
  });
});
