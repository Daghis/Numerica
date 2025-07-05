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
  // Level 1: Any order, all pressed completion
  describe('Level 1', () => {
    const level1Def = levelDefinitions[1];

    it('should allow any move', () => {
      expect(level1Def.movePredicate(1, createMockButtons([], 1), [])).toBe(true);
      expect(level1Def.movePredicate(3, createMockButtons([1], 1), [1])).toBe(true);
    });

    it('should be complete when the single button is pressed', () => {
      expect(level1Def.completionPredicate(createMockButtons([1], 1), [])).toBe(true);
      expect(level1Def.completionPredicate(createMockButtons([], 1), [])).toBe(false);
    });

    it('should have the correct completion predicate description', () => {
      expect(level1Def.completionPredicate.description).toBe('Press the button.');
    });
  });

  // Level 101 & 102: Any order, all pressed completion
  describe('Level 101 & 102', () => {
    const level101Def = levelDefinitions[101];

    it('should allow any move', () => {
      expect(level101Def.movePredicate(1, createMockButtons(), [])).toBe(true);
      expect(level101Def.movePredicate(3, createMockButtons([1]), [1])).toBe(true);
    });

    it('should be complete when all buttons are pressed', () => {
      expect(level101Def.completionPredicate(createMockButtons([1, 2, 3, 4, 5]), [])).toBe(true);
      expect(level101Def.completionPredicate(createMockButtons([1, 2, 3]), [])).toBe(false);
    });
  });

  // Level 3: Sequential order (any first button, then sequential), all pressed completion
  describe('Level 103', () => {
    const level103Def = levelDefinitions[103];

    it('should allow any button as the first move', () => {
      expect(level103Def.movePredicate(1, createMockButtons(), [])).toBe(true);
      expect(level103Def.movePredicate(3, createMockButtons(), [])).toBe(true);
      expect(level103Def.movePredicate(5, createMockButtons(), [])).toBe(true);
    });

    it('should enforce ascending order after a first move', () => {
      expect(level103Def.movePredicate(2, createMockButtons([1]), [1])).toBe(true);
      expect(level103Def.movePredicate(3, createMockButtons([2]), [2])).toBe(true);
      expect(level103Def.movePredicate(4, createMockButtons([3]), [3])).toBe(true);
      expect(level103Def.movePredicate(5, createMockButtons([4]), [4])).toBe(true);
      expect(level103Def.movePredicate(4, createMockButtons([1]), [1])).toBe(false); // Out of order
    });

    it('should enforce descending order after a first move', () => {
      expect(level103Def.movePredicate(4, createMockButtons([5]), [5])).toBe(true);
      expect(level103Def.movePredicate(3, createMockButtons([4]), [4])).toBe(true);
      expect(level103Def.movePredicate(2, createMockButtons([3]), [3])).toBe(true);
      expect(level103Def.movePredicate(1, createMockButtons([2]), [2])).toBe(true);
      expect(level103Def.movePredicate(2, createMockButtons([5]), [5])).toBe(false); // Out of order
    });

    it('should maintain direction after second move (ascending)', () => {
      expect(level103Def.movePredicate(3, createMockButtons([1, 2]), [1, 2])).toBe(true);
      expect(level103Def.movePredicate(1, createMockButtons([1, 2]), [1, 2])).toBe(false); // Wrong direction
    });

    it('should maintain direction after second move (descending)', () => {
      expect(level103Def.movePredicate(3, createMockButtons([5, 4]), [5, 4])).toBe(true);
      expect(level103Def.movePredicate(5, createMockButtons([5, 4]), [5, 4])).toBe(false); // Wrong direction
    });

    it('should be complete when all buttons are pressed', () => {
      expect(level103Def.completionPredicate(createMockButtons([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5])).toBe(true);
      expect(level103Def.completionPredicate(createMockButtons([5, 4, 3, 2, 1]), [5, 4, 3, 2, 1])).toBe(true);
      expect(level103Def.completionPredicate(createMockButtons([1, 2, 3]), [1, 2, 3])).toBe(false);
    });
  });

  // Level 4: Non-adjacent order, all pressed completion
  describe('Level 104', () => {
    const level104Def = levelDefinitions[104];

    it('should allow any first move', () => {
      expect(level104Def.movePredicate(1, createMockButtons(), [])).toBe(true);
      expect(level104Def.movePredicate(3, createMockButtons(), [])).toBe(true);
    });

    it('should not allow adjacent moves', () => {
      expect(level104Def.movePredicate(3, createMockButtons([1]), [1])).toBe(true); // 1 -> 3 (non-adjacent)
      expect(level104Def.movePredicate(2, createMockButtons([1]), [1])).toBe(false); // 1 -> 2 (adjacent)
      expect(level104Def.movePredicate(4, createMockButtons([5]), [5])).toBe(false); // 5 -> 4 (adjacent)
    });

    it('should be complete when all buttons are pressed', () => {
      expect(level104Def.completionPredicate(createMockButtons([1, 2, 3, 4, 5]), [])).toBe(true);
      expect(level104Def.completionPredicate(createMockButtons([1, 3, 5]), [])).toBe(false);
    });
  });

  // Level 5: Odd numbers, all odd buttons pressed completion
  describe('Level 105', () => {
    const level105Def = levelDefinitions[105];

    it('should only allow odd-numbered buttons to be pressed', () => {
      expect(level105Def.movePredicate(1, createMockButtons(), [])).toBe(true);
      expect(level105Def.movePredicate(2, createMockButtons(), [])).toBe(false);
      expect(level105Def.movePredicate(3, createMockButtons(), [])).toBe(true);
      expect(level105Def.movePredicate(4, createMockButtons(), [])).toBe(false);
      expect(level105Def.movePredicate(5, createMockButtons(), [])).toBe(true);
    });

    it('should be complete when all odd-numbered buttons are pressed', () => {
      expect(level105Def.completionPredicate(createMockButtons([1, 3, 5]), [])).toBe(true);
      expect(level105Def.completionPredicate(createMockButtons([1, 3]), [])).toBe(false);
      expect(level105Def.completionPredicate(createMockButtons([1, 2, 3, 5]), [])).toBe(true);
    });
  });

  // Level 6: Odd numbers, all odd buttons pressed completion
  describe('Level 106', () => {
    const level106Def = levelDefinitions[106];

    it('should only allow odd-numbered buttons to be pressed', () => {
      expect(level106Def.movePredicate(1, createMockButtons([], 9), [])).toBe(true);
      expect(level106Def.movePredicate(2, createMockButtons([], 9), [])).toBe(false);
      expect(level106Def.movePredicate(3, createMockButtons([], 9), [])).toBe(true);
      expect(level106Def.movePredicate(4, createMockButtons([], 9), [])).toBe(false);
      expect(level106Def.movePredicate(5, createMockButtons([], 9), [])).toBe(true);
      expect(level106Def.movePredicate(6, createMockButtons([], 9), [])).toBe(false);
      expect(level106Def.movePredicate(7, createMockButtons([], 9), [])).toBe(true);
      expect(level106Def.movePredicate(8, createMockButtons([], 9), [])).toBe(false);
      expect(level106Def.movePredicate(9, createMockButtons([], 9), [])).toBe(true);
    });

    it('should have a hiddenRuleId for its move predicate', () => {
      expect(level106Def.movePredicate.hiddenRuleId).toBe('level6MoveRule');
    });

    it('should be complete when all odd-numbered buttons are pressed', () => {
      expect(level106Def.completionPredicate(createMockButtons([1, 3, 5, 7, 9], 9), [])).toBe(true);
      expect(level106Def.completionPredicate(createMockButtons([1, 3, 5, 7], 9), [])).toBe(false);
      expect(level106Def.completionPredicate(createMockButtons([1, 2, 3, 5, 7, 9], 9), [])).toBe(true);
    });
  });
});
