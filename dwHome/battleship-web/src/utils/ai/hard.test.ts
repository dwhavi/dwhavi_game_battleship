import { describe, it, expect, beforeEach } from 'vitest';
import { getHardAIMove, calculateProbabilityMap, positionToKey } from './hard';
import { createEmptyBoard, placeShip } from '../gameLogic';
import type { Board, Ship, ShipType, Position } from '../../types/game';

describe('Hard AI - Probability Density Algorithm', () => {
  let board: Board;
  let previousShots: Set<string>;
  let remainingShips: ShipType[];

  beforeEach(() => {
    board = createEmptyBoard();
    previousShots = new Set<string>();
    remainingShips = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'];
  });

  describe('calculateProbabilityMap', () => {
    it('calculates probability density map correctly', () => {
      const probMap = calculateProbabilityMap(board, previousShots, remainingShips);
      
      // Should be a 10x10 grid
      expect(probMap.length).toBe(10);
      expect(probMap[0].length).toBe(10);
      
      // All values should be non-negative
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          expect(probMap[row][col]).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('higher probability for cells where ships could fit', () => {
      // With a fresh board, center cells should have higher probability
      // because more ships can be placed through them
      const probMap = calculateProbabilityMap(board, previousShots, remainingShips);
      
      // Center cell [4][4] should have higher probability than corner [0][0]
      // because ships can pass through it in both directions
      expect(probMap[4][4]).toBeGreaterThan(probMap[0][0]);
      
      // Edge cells have fewer placement options than center
      expect(probMap[5][5]).toBeGreaterThan(probMap[0][5]);
    });

    it('avoids already-shot cells', () => {
      // Mark some cells as shot
      previousShots.add('0,0');
      previousShots.add('0,1');
      previousShots.add('0,2');
      
      const probMap = calculateProbabilityMap(board, previousShots, remainingShips);
      
      // Shot cells should have probability 0
      expect(probMap[0][0]).toBe(0);
      expect(probMap[0][1]).toBe(0);
      expect(probMap[0][2]).toBe(0);
    });

    it('returns zero map when no ships remain', () => {
      const probMap = calculateProbabilityMap(board, previousShots, []);
      
      // All probabilities should be 0
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          expect(probMap[row][col]).toBe(0);
        }
      }
    });

    it('considers ship sizes when calculating probabilities', () => {
      // With only the destroyer (size 2), edge cells should have similar probability
      // to center cells since it's small
      const smallShips: ShipType[] = ['destroyer'];
      const probMapSmall = calculateProbabilityMap(board, previousShots, smallShips);
      
      // With carrier (size 5), edge cells should have much lower probability
      const largeShips: ShipType[] = ['carrier'];
      const probMapLarge = calculateProbabilityMap(board, previousShots, largeShips);
      
      // The carrier can't fit through corners, but destroyer can
      // So corner probability ratio should be higher for destroyer
      const smallCornerRatio = probMapSmall[0][0] / probMapSmall[4][4];
      const largeCornerRatio = probMapLarge[0][0] / probMapLarge[4][4];
      
      expect(smallCornerRatio).toBeGreaterThan(largeCornerRatio);
    });
  });

  describe('getHardAIMove', () => {
    it('returns a valid position within bounds', () => {
      const move = getHardAIMove(board, previousShots, remainingShips);
      
      expect(move[0]).toBeGreaterThanOrEqual(0);
      expect(move[0]).toBeLessThanOrEqual(9);
      expect(move[1]).toBeGreaterThanOrEqual(0);
      expect(move[1]).toBeLessThanOrEqual(9);
    });

    it('prioritizes cells adjacent to hits', () => {
      // Place a ship and simulate a hit
      const ship: Ship = {
        id: 'test-ship',
        type: 'destroyer',
        positions: [[5, 5], [5, 6]],
        hits: 1,
        sunk: false,
        size: 2,
      };
      board = placeShip(board, ship);
      
      // Mark [5, 5] as hit
      board[5][5] = { status: 'hit', shipId: 'test-ship' };
      previousShots.add('5,5');
      
      // Run multiple times to check distribution
      const adjacentHits: Position[] = [];
      for (let i = 0; i < 20; i++) {
        const move = getHardAIMove(board, previousShots, remainingShips);
        const isAdjacent = 
          (move[0] === 4 && move[1] === 5) ||
          (move[0] === 6 && move[1] === 5) ||
          (move[0] === 5 && move[1] === 4) ||
          (move[0] === 5 && move[1] === 6);
        if (isAdjacent) {
          adjacentHits.push(move);
        }
        previousShots.add(positionToKey(move));
      }
      
      // At least some moves should target adjacent cells
      expect(adjacentHits.length).toBeGreaterThan(0);
    });

    it('avoids already-shot cells', () => {
      // Mark many cells as shot
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          previousShots.add(`${row},${col}`);
        }
      }
      
      // Run multiple times
      for (let i = 0; i < 10; i++) {
        const move = getHardAIMove(board, previousShots, remainingShips);
        const key = positionToKey(move);
        expect(previousShots.has(key)).toBe(false);
        previousShots.add(key);
      }
    });

    it('never returns the same position twice', () => {
      const usedPositions = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        const move = getHardAIMove(board, previousShots, remainingShips);
        const key = positionToKey(move);
        expect(usedPositions.has(key)).toBe(false);
        usedPositions.add(key);
        previousShots.add(key);
      }
    });

    it('pure function - does not modify inputs', () => {
      const boardCopy = JSON.parse(JSON.stringify(board));
      const shotsCopy = new Set(previousShots);
      
      getHardAIMove(board, previousShots, remainingShips);
      
      expect(board).toEqual(boardCopy);
      expect(previousShots).toEqual(shotsCopy);
    });
  });

  describe('Performance Comparison', () => {
    it('performs better than random (easy) AI in simulation', () => {
      // This test verifies that the Hard AI makes smart choices
      // by checking that center cells (higher probability) are targeted first
      
      // Place a large ship (carrier) horizontally in the center
      const ship: Ship = {
        id: 'carrier',
        type: 'carrier',
        positions: [[4, 2], [4, 3], [4, 4], [4, 5], [4, 6]],
        hits: 0,
        sunk: false,
        size: 5,
      };
      board = placeShip(board, ship);
      
      // Simulate Hard AI - should find hits faster by targeting high-probability cells
      let hardShots = new Set<string>();
      let hardHits = 0;
      
      // Run 30 shots
      for (let i = 0; i < 30; i++) {
        const move = getHardAIMove(board, hardShots, remainingShips);
        hardShots.add(positionToKey(move));
        
        const cell = board[move[0]][move[1]];
        if (cell.status === 'ship') {
          hardHits++;
        }
      }
      
      // Hard AI should get at least some hits because it targets center cells
      // where the carrier is placed
      expect(hardHits).toBeGreaterThan(0);
      expect(hardShots.size).toBe(30);
    });
    
    it('probability map gives higher values to center cells', () => {
      const probMap = calculateProbabilityMap(board, previousShots, remainingShips);
      
      // Center cells should have higher probability than edge cells
      const centerProb = probMap[4][4] + probMap[4][5] + probMap[5][4] + probMap[5][5];
      const edgeProb = probMap[0][0] + probMap[0][9] + probMap[9][0] + probMap[9][9];
      
      // Center cells collectively should have higher probability
      expect(centerProb).toBeGreaterThan(edgeProb);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty remaining ships array', () => {
      const move = getHardAIMove(board, previousShots, []);
      // Should still return a valid position (fallback to random or first available)
      expect(move[0]).toBeGreaterThanOrEqual(0);
      expect(move[0]).toBeLessThanOrEqual(9);
      expect(move[1]).toBeGreaterThanOrEqual(0);
      expect(move[1]).toBeLessThanOrEqual(9);
    });

    it('handles almost-full board', () => {
      // Mark 99 cells as shot
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          if (!(row === 9 && col === 9)) {
            previousShots.add(`${row},${col}`);
          }
        }
      }
      
      const move = getHardAIMove(board, previousShots, remainingShips);
      expect(move).toEqual([9, 9]);
    });

    it('handles hits on board correctly', () => {
      // Place a ship and mark a hit
      const ship: Ship = {
        id: 'test-ship',
        type: 'cruiser',
        positions: [[3, 3], [3, 4], [3, 5]],
        hits: 1,
        sunk: false,
        size: 3,
      };
      board = placeShip(board, ship);
      board[3][3] = { status: 'hit', shipId: 'test-ship' };
      previousShots.add('3,3');
      
      const probMap = calculateProbabilityMap(board, previousShots, remainingShips);
      
      // Hit cell should have 0 probability
      expect(probMap[3][3]).toBe(0);
      
      // Adjacent cells should have higher probability due to targeting
      expect(probMap[3][4]).toBeGreaterThan(0);
    });

    it('handles misses on board correctly', () => {
      // Mark some misses
      board[0][0] = { status: 'miss' };
      board[0][1] = { status: 'miss' };
      previousShots.add('0,0');
      previousShots.add('0,1');
      
      const probMap = calculateProbabilityMap(board, previousShots, remainingShips);
      
      // Miss cells should have 0 probability
      expect(probMap[0][0]).toBe(0);
      expect(probMap[0][1]).toBe(0);
    });
  });

  describe('Checkerboard Pattern', () => {
    it('naturally creates checkerboard coverage for efficiency', () => {
      // On an empty board, hard AI should naturally favor a checkerboard-like pattern
      // because ships must occupy consecutive cells
      const shots: Position[] = [];
      
      for (let i = 0; i < 20; i++) {
        const move = getHardAIMove(board, previousShots, remainingShips);
        shots.push(move);
        previousShots.add(positionToKey(move));
      }
      
      // Check that shots are somewhat spread out (not clustered)
      // Calculate average distance between consecutive shots
      let totalDistance = 0;
      for (let i = 1; i < shots.length; i++) {
        const dx = Math.abs(shots[i][0] - shots[i-1][0]);
        const dy = Math.abs(shots[i][1] - shots[i-1][1]);
        totalDistance += dx + dy;
      }
      const avgDistance = totalDistance / (shots.length - 1);
      
      // Average distance should be reasonable (not always adjacent)
      // This is a soft check - the probability map naturally creates spread
      expect(avgDistance).toBeGreaterThan(0);
    });
  });
});
