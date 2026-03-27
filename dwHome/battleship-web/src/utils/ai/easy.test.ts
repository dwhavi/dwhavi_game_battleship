import { describe, it, expect } from 'vitest';
import { getEasyAIMove, positionToKey } from './easy';
import { createEmptyBoard } from '../gameLogic';

describe('getEasyAIMove', () => {
  describe('positionToKey', () => {
    it('should convert position to string key', () => {
      expect(positionToKey([0, 0])).toBe('0,0');
      expect(positionToKey([5, 3])).toBe('5,3');
      expect(positionToKey([9, 9])).toBe('9,9');
    });
  });

  describe('returns valid positions', () => {
    it('should return position within 0-9 range', () => {
      const board = createEmptyBoard();
      const previousShots = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        const pos = getEasyAIMove(board, previousShots);
        expect(pos[0]).toBeGreaterThanOrEqual(0);
        expect(pos[0]).toBeLessThanOrEqual(9);
        expect(pos[1]).toBeGreaterThanOrEqual(0);
        expect(pos[1]).toBeLessThanOrEqual(9);
      }
    });
  });

  describe('unique positions', () => {
    it('should never return same position twice', () => {
      const board = createEmptyBoard();
      const previousShots = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        const pos = getEasyAIMove(board, previousShots);
        const key = positionToKey(pos);
        expect(previousShots.has(key)).toBe(false);
        previousShots.add(key);
      }
    });

    it('should not return positions already in previousShots', () => {
      const board = createEmptyBoard();
      const previousShots = new Set<string>();
      previousShots.add('0,0');
      previousShots.add('5,5');
      previousShots.add('9,9');
      
      for (let i = 0; i < 50; i++) {
        const pos = getEasyAIMove(board, previousShots);
        const key = positionToKey(pos);
        expect(previousShots.has(key)).toBe(false);
      }
    });
  });

  describe('does not return already hit positions', () => {
    it('should not return positions with hit status', () => {
      const board = createEmptyBoard();
      board[0][0] = { status: 'hit', shipId: 'ship1' };
      board[5][5] = { status: 'hit', shipId: 'ship2' };
      
      const previousShots = new Set<string>();
      
      for (let i = 0; i < 50; i++) {
        const pos = getEasyAIMove(board, previousShots);
        const cell = board[pos[0]][pos[1]];
        expect(cell.status).not.toBe('hit');
        previousShots.add(positionToKey(pos));
      }
    });

    it('should not return positions with miss status', () => {
      const board = createEmptyBoard();
      board[0][0] = { status: 'miss' };
      board[5][5] = { status: 'miss' };
      
      const previousShots = new Set<string>();
      
      for (let i = 0; i < 50; i++) {
        const pos = getEasyAIMove(board, previousShots);
        const cell = board[pos[0]][pos[1]];
        expect(cell.status).not.toBe('miss');
        previousShots.add(positionToKey(pos));
      }
    });
  });

  describe('pure function', () => {
    it('should not modify the board', () => {
      const board = createEmptyBoard();
      const boardCopy = JSON.parse(JSON.stringify(board));
      const previousShots = new Set<string>();
      
      getEasyAIMove(board, previousShots);
      
      expect(board).toEqual(boardCopy);
    });

    it('should not modify previousShots', () => {
      const board = createEmptyBoard();
      const previousShots = new Set<string>();
      previousShots.add('0,0');
      const shotsSizeBefore = previousShots.size;
      
      getEasyAIMove(board, previousShots);
      
      expect(previousShots.size).toBe(shotsSizeBefore);
      expect(previousShots.has('0,0')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should work when most positions are already shot', () => {
      const board = createEmptyBoard();
      const previousShots = new Set<string>();
      
      // Mark 95 positions as shot
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          if (row < 9 || col < 5) {
            previousShots.add(positionToKey([row, col]));
          }
        }
      }
      
      // Should still be able to get a valid move
      const pos = getEasyAIMove(board, previousShots);
      expect(pos[0]).toBeGreaterThanOrEqual(0);
      expect(pos[0]).toBeLessThanOrEqual(9);
      expect(pos[1]).toBeGreaterThanOrEqual(0);
      expect(pos[1]).toBeLessThanOrEqual(9);
      expect(previousShots.has(positionToKey(pos))).toBe(false);
    });
  });
});
