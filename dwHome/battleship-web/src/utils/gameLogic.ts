import type { Board, Cell, Ship, ShipType, Position, Orientation } from '../types/game';
import { SHIP_SIZES, BOARD_SIZE } from '../types/game';

/**
 * Creates an empty 10x10 board with all cells set to empty status
 */
export function createEmptyBoard(): Board {
  const board: Board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const rowCells: Cell[] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      rowCells.push({ status: 'empty' });
    }
    board.push(rowCells);
  }
  return board;
}

/**
 * Checks if all positions are within the valid 0-9 range
 */
export function isValidPosition(positions: Position[]): boolean {
  return positions.every(([row, col]) => 
    row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
  );
}

/**
 * Checks if positions collide with existing ships on the board
 * @param board The game board
 * @param positions Array of positions to check
 * @param excludeShipId Optional ship ID to exclude from collision check
 */
export function checkCollision(
  board: Board, 
  positions: Position[], 
  excludeShipId?: string
): boolean {
  return positions.some(([row, col]) => {
    const cell = board[row]?.[col];
    if (!cell) return true; // Out of bounds = collision
    if (cell.status === 'ship' && cell.shipId !== excludeShipId) {
      return true;
    }
    return false;
  });
}

/**
 * Generates all positions for a ship based on starting position and orientation
 * Returns empty array if the ship would extend beyond board boundaries
 */
export function generateShipPositions(
  _board: Board,
  shipType: ShipType,
  startPos: Position,
  orientation: Orientation
): Position[] {
  const size = SHIP_SIZES[shipType];
  const positions: Position[] = [];
  const [startRow, startCol] = startPos;

  for (let i = 0; i < size; i++) {
    const row = orientation === 'horizontal' ? startRow : startRow + i;
    const col = orientation === 'horizontal' ? startCol + i : startCol;
    positions.push([row, col]);
  }

  // Check if all positions are valid
  if (!isValidPosition(positions)) {
    return [];
  }

  return positions;
}

/**
 * Validates if a ship can be placed at the given position and orientation
 */
export function canPlaceShip(
  board: Board,
  shipType: ShipType,
  startPos: Position,
  orientation: Orientation
): boolean {
  const positions = generateShipPositions(board, shipType, startPos, orientation);
  
  // If positions is empty, it means the ship extends beyond board
  if (positions.length === 0) {
    return false;
  }

  // Check for collision with existing ships
  return !checkCollision(board, positions);
}

/**
 * Places a ship on the board and returns a new board (pure function)
 */
export function placeShip(board: Board, ship: Ship): Board {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  
  ship.positions.forEach(([row, col]) => {
    newBoard[row][col] = { status: 'ship', shipId: ship.id };
  });
  
  return newBoard;
}

/**
 * Removes a ship from the board by ship ID and returns a new board
 */
export function removeShip(board: Board, shipId: string): Board {
  const newBoard = board.map(row => 
    row.map(cell => {
      if (cell.shipId === shipId) {
        return { status: 'empty' as const };
      }
      return { ...cell };
    })
  );
  
  return newBoard;
}

/**
 * Fires a shot at a position and returns the result
 */
export function fireShot(
  board: Board, 
  position: Position
): { newBoard: Board; result: 'hit' | 'miss'; hitShip?: Ship } {
  const [row, col] = position;
  const cell = board[row]?.[col];
  
  // Create new board copy
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  
  // If cell doesn't exist or already fired upon, return miss
  if (!cell || cell.status === 'hit' || cell.status === 'miss') {
    return { newBoard, result: 'miss' };
  }
  
  if (cell.status === 'ship') {
    newBoard[row][col] = { status: 'hit', shipId: cell.shipId };
    // Return hit with a partial ship info (caller should update ship hits)
    const hitShip: Ship = {
      id: cell.shipId!,
      type: 'destroyer', // Placeholder - actual type should be tracked elsewhere
      positions: [position],
      hits: 1,
      sunk: false,
      size: 1,
    };
    return { newBoard, result: 'hit', hitShip };
  }
  
  // Empty cell becomes miss
  newBoard[row][col] = { status: 'miss' };
  return { newBoard, result: 'miss' };
}

/**
 * Checks if a ship is sunk (all positions hit)
 */
export function checkShipSunk(ship: Ship): boolean {
  return ship.hits >= ship.size;
}

/**
 * Checks if all ships are sunk (win condition)
 */
export function checkAllShipsSunk(ships: Ship[]): boolean {
  if (ships.length === 0) return true;
  return ships.every(ship => checkShipSunk(ship));
}

/**
 * Returns a random position within the board [0-9, 0-9]
 */
export function getRandomPosition(): Position {
  const row = Math.floor(Math.random() * BOARD_SIZE);
  const col = Math.floor(Math.random() * BOARD_SIZE);
  return [row, col];
}

/**
 * Returns the 4 adjacent positions (up, down, left, right)
 * Does NOT validate if positions are within bounds
 */
export function getAdjacentPositions(position: Position): Position[] {
  const [row, col] = position;
  return [
    [row - 1, col], // up
    [row + 1, col], // down
    [row, col - 1], // left
    [row, col + 1], // right
  ];
}

/**
 * Combined check for bounds and collision
 */
export function arePositionsValid(
  board: Board, 
  positions: Position[], 
  excludeShipId?: string
): boolean {
  if (!isValidPosition(positions)) {
    return false;
  }
  return !checkCollision(board, positions, excludeShipId);
}
