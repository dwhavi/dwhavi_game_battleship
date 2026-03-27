import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  isValidPosition,
  checkCollision,
  canPlaceShip,
  placeShip,
  removeShip,
  fireShot,
  checkShipSunk,
  checkAllShipsSunk,
  getRandomPosition,
  generateShipPositions,
  getAdjacentPositions,
  arePositionsValid,
} from './gameLogic';
import type { Ship, Position } from '../types/game';
import { SHIP_SIZES, BOARD_SIZE } from '../types/game';

describe('gameLogic', () => {
  describe('createEmptyBoard', () => {
    it('should create a 10x10 board', () => {
      const board = createEmptyBoard();
      expect(board.length).toBe(BOARD_SIZE);
      board.forEach(row => {
        expect(row.length).toBe(BOARD_SIZE);
      });
    });

    it('should have all empty cells', () => {
      const board = createEmptyBoard();
      board.forEach(row => {
        row.forEach(cell => {
          expect(cell.status).toBe('empty');
          expect(cell.shipId).toBeUndefined();
        });
      });
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid positions within 0-9 range', () => {
      expect(isValidPosition([[0, 0]])).toBe(true);
      expect(isValidPosition([[5, 5]])).toBe(true);
      expect(isValidPosition([[9, 9]])).toBe(true);
    });

    it('should return false for positions outside 0-9 range', () => {
      expect(isValidPosition([[-1, 0]])).toBe(false);
      expect(isValidPosition([[0, -1]])).toBe(false);
      expect(isValidPosition([[10, 5]])).toBe(false);
      expect(isValidPosition([[5, 10]])).toBe(false);
    });

    it('should handle multiple positions', () => {
      expect(isValidPosition([[0, 0], [5, 5], [9, 9]])).toBe(true);
      expect(isValidPosition([[0, 0], [-1, 5], [9, 9]])).toBe(false);
    });
  });

  describe('checkCollision', () => {
    it('should return false when no collision exists', () => {
      const board = createEmptyBoard();
      const positions: Position[] = [[0, 0], [0, 1], [0, 2]];
      expect(checkCollision(board, positions)).toBe(false);
    });

    it('should return true when collision exists', () => {
      const board = createEmptyBoard();
      board[0][0] = { status: 'ship', shipId: 'ship1' };
      const positions: Position[] = [[0, 0], [0, 1]];
      expect(checkCollision(board, positions)).toBe(true);
    });

    it('should exclude ship by ID when excludeShipId is provided', () => {
      const board = createEmptyBoard();
      board[0][0] = { status: 'ship', shipId: 'ship1' };
      board[0][1] = { status: 'ship', shipId: 'ship1' };
      const positions: Position[] = [[0, 0], [0, 1]];
      expect(checkCollision(board, positions, 'ship1')).toBe(false);
    });
  });

  describe('generateShipPositions', () => {
    it('should generate horizontal positions correctly', () => {
      const board = createEmptyBoard();
      const positions = generateShipPositions(board, 'destroyer', [2, 3], 'horizontal');
      expect(positions).toEqual([[2, 3], [2, 4]]);
    });

    it('should generate vertical positions correctly', () => {
      const board = createEmptyBoard();
      const positions = generateShipPositions(board, 'cruiser', [1, 2], 'vertical');
      expect(positions).toEqual([[1, 2], [2, 2], [3, 2]]);
    });

    it('should return empty array for invalid placement (out of bounds)', () => {
      const board = createEmptyBoard();
      const positions = generateShipPositions(board, 'carrier', [8, 8], 'horizontal');
      expect(positions).toEqual([]);
    });
  });

  describe('canPlaceShip', () => {
    it('should return true for valid placement', () => {
      const board = createEmptyBoard();
      expect(canPlaceShip(board, 'destroyer', [0, 0], 'horizontal')).toBe(true);
    });

    it('should return false for out of bounds placement', () => {
      const board = createEmptyBoard();
      expect(canPlaceShip(board, 'carrier', [0, 8], 'horizontal')).toBe(false);
    });

    it('should return false for collision with existing ship', () => {
      const board = createEmptyBoard();
      board[0][0] = { status: 'ship', shipId: 'existing-ship' };
      expect(canPlaceShip(board, 'destroyer', [0, 0], 'horizontal')).toBe(false);
    });

    it('should return true for placement at board edge', () => {
      const board = createEmptyBoard();
      expect(canPlaceShip(board, 'destroyer', [9, 8], 'horizontal')).toBe(true);
      expect(canPlaceShip(board, 'submarine', [7, 9], 'vertical')).toBe(true);
    });
  });

  describe('placeShip', () => {
    it('should place ship on board and return new board', () => {
      const board = createEmptyBoard();
      const ship: Ship = {
        id: 'ship1',
        type: 'destroyer',
        positions: [[0, 0], [0, 1]],
        hits: 0,
        sunk: false,
        size: SHIP_SIZES.destroyer,
      };
      const newBoard = placeShip(board, ship);
      expect(newBoard[0][0].status).toBe('ship');
      expect(newBoard[0][0].shipId).toBe('ship1');
      expect(newBoard[0][1].status).toBe('ship');
      expect(newBoard[0][1].shipId).toBe('ship1');
      // Original board should not be modified
      expect(board[0][0].status).toBe('empty');
    });
  });

  describe('removeShip', () => {
    it('should remove ship from board', () => {
      const board = createEmptyBoard();
      board[0][0] = { status: 'ship', shipId: 'ship1' };
      board[0][1] = { status: 'ship', shipId: 'ship1' };
      const newBoard = removeShip(board, 'ship1');
      expect(newBoard[0][0].status).toBe('empty');
      expect(newBoard[0][0].shipId).toBeUndefined();
      expect(newBoard[0][1].status).toBe('empty');
      expect(newBoard[0][1].shipId).toBeUndefined();
    });
  });

  describe('fireShot', () => {
    it('should return miss when hitting empty cell', () => {
      const board = createEmptyBoard();
      const result = fireShot(board, [5, 5]);
      expect(result.result).toBe('miss');
      expect(result.newBoard[5][5].status).toBe('miss');
      expect(result.hitShip).toBeUndefined();
    });

    it('should return hit when hitting ship', () => {
      const board = createEmptyBoard();
      const ship: Ship = {
        id: 'ship1',
        type: 'destroyer',
        positions: [[0, 0], [0, 1]],
        hits: 0,
        sunk: false,
        size: SHIP_SIZES.destroyer,
      };
      const boardWithShip = placeShip(board, ship);
      const result = fireShot(boardWithShip, [0, 0]);
      expect(result.result).toBe('hit');
      expect(result.newBoard[0][0].status).toBe('hit');
      expect(result.hitShip).toBeDefined();
    });

    it('should return miss when firing at already hit position', () => {
      const board = createEmptyBoard();
      board[5][5] = { status: 'hit' };
      const result = fireShot(board, [5, 5]);
      expect(result.result).toBe('miss'); // Already hit, treat as miss
    });

    it('should return miss when firing at already miss position', () => {
      const board = createEmptyBoard();
      board[5][5] = { status: 'miss' };
      const result = fireShot(board, [5, 5]);
      expect(result.result).toBe('miss');
    });
  });

  describe('checkShipSunk', () => {
    it('should return false when ship has no hits', () => {
      const ship: Ship = {
        id: 'ship1',
        type: 'destroyer',
        positions: [[0, 0], [0, 1]],
        hits: 0,
        sunk: false,
        size: SHIP_SIZES.destroyer,
      };
      expect(checkShipSunk(ship)).toBe(false);
    });

    it('should return false when ship has partial hits', () => {
      const ship: Ship = {
        id: 'ship1',
        type: 'destroyer',
        positions: [[0, 0], [0, 1]],
        hits: 1,
        sunk: false,
        size: SHIP_SIZES.destroyer,
      };
      expect(checkShipSunk(ship)).toBe(false);
    });

    it('should return true when ship is fully hit', () => {
      const ship: Ship = {
        id: 'ship1',
        type: 'destroyer',
        positions: [[0, 0], [0, 1]],
        hits: 2,
        sunk: false,
        size: SHIP_SIZES.destroyer,
      };
      expect(checkShipSunk(ship)).toBe(true);
    });
  });

  describe('checkAllShipsSunk', () => {
    it('should return false when not all ships are sunk', () => {
      const ships: Ship[] = [
        { id: '1', type: 'destroyer', positions: [[0, 0], [0, 1]], hits: 2, sunk: true, size: 2 },
        { id: '2', type: 'cruiser', positions: [[2, 2], [2, 3], [2, 4]], hits: 1, sunk: false, size: 3 },
      ];
      expect(checkAllShipsSunk(ships)).toBe(false);
    });

    it('should return true when all ships are sunk', () => {
      const ships: Ship[] = [
        { id: '1', type: 'destroyer', positions: [[0, 0], [0, 1]], hits: 2, sunk: true, size: 2 },
        { id: '2', type: 'cruiser', positions: [[2, 2], [2, 3], [2, 4]], hits: 3, sunk: true, size: 3 },
      ];
      expect(checkAllShipsSunk(ships)).toBe(true);
    });

    it('should return true for empty ships array', () => {
      expect(checkAllShipsSunk([])).toBe(true);
    });
  });

  describe('getRandomPosition', () => {
    it('should return position within 0-9 range', () => {
      for (let i = 0; i < 100; i++) {
        const pos = getRandomPosition();
        expect(pos[0]).toBeGreaterThanOrEqual(0);
        expect(pos[0]).toBeLessThanOrEqual(9);
        expect(pos[1]).toBeGreaterThanOrEqual(0);
        expect(pos[1]).toBeLessThanOrEqual(9);
      }
    });
  });

  describe('getAdjacentPositions', () => {
    it('should return 4 adjacent positions', () => {
      const positions = getAdjacentPositions([5, 5]);
      expect(positions).toHaveLength(4);
      expect(positions).toContainEqual([4, 5]); // up
      expect(positions).toContainEqual([6, 5]); // down
      expect(positions).toContainEqual([5, 4]); // left
      expect(positions).toContainEqual([5, 6]); // right
    });

    it('should include positions even at edges (validation done separately)', () => {
      const positions = getAdjacentPositions([0, 0]);
      expect(positions).toHaveLength(4);
      expect(positions).toContainEqual([-1, 0]); // up (invalid)
      expect(positions).toContainEqual([1, 0]);  // down
      expect(positions).toContainEqual([0, -1]); // left (invalid)
      expect(positions).toContainEqual([0, 1]);  // right
    });
  });

  describe('arePositionsValid', () => {
    it('should return true for valid positions with no collision', () => {
      const board = createEmptyBoard();
      const positions: Position[] = [[0, 0], [0, 1]];
      expect(arePositionsValid(board, positions)).toBe(true);
    });

    it('should return false for out of bounds positions', () => {
      const board = createEmptyBoard();
      const positions: Position[] = [[-1, 0], [0, 1]];
      expect(arePositionsValid(board, positions)).toBe(false);
    });

    it('should return false for colliding positions', () => {
      const board = createEmptyBoard();
      board[0][0] = { status: 'ship', shipId: 'existing' };
      const positions: Position[] = [[0, 0], [0, 1]];
      expect(arePositionsValid(board, positions)).toBe(false);
    });
  });

  describe('edge cases - ship at board edges', () => {
    it('should place ship at bottom edge vertically', () => {
      const board = createEmptyBoard();
      expect(canPlaceShip(board, 'destroyer', [8, 9], 'vertical')).toBe(true);
    });

    it('should not place ship extending past bottom edge', () => {
      const board = createEmptyBoard();
      expect(canPlaceShip(board, 'cruiser', [9, 9], 'vertical')).toBe(false);
    });

    it('should not place ship extending past right edge', () => {
      const board = createEmptyBoard();
      expect(canPlaceShip(board, 'carrier', [0, 6], 'horizontal')).toBe(false);
    });
  });
});
