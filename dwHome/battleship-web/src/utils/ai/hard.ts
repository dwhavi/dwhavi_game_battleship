import type { Board, ShipType, Position } from '../../types/game';
import { SHIP_SIZES, BOARD_SIZE } from '../../types/game';

/**
 * Converts a position to a string key for Set operations
 */
export function positionToKey(pos: Position): string {
  return `${pos[0]},${pos[1]}`;
}

/**
 * Checks if a position is within the board bounds
 */
function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * Gets all cells that a ship would occupy from a starting position
 * Returns empty array if the placement is invalid
 */
function getShipCells(
  startRow: number,
  startCol: number,
  size: number,
  orientation: 'horizontal' | 'vertical',
  previousShots: Set<string>
): Position[] {
  const cells: Position[] = [];
  
  for (let i = 0; i < size; i++) {
    const row = orientation === 'horizontal' ? startRow : startRow + i;
    const col = orientation === 'horizontal' ? startCol + i : startCol;
    
    // Check bounds
    if (!isInBounds(row, col)) {
      return [];
    }
    
    // Check if already shot
    if (previousShots.has(positionToKey([row, col]))) {
      return [];
    }
    
    cells.push([row, col]);
  }
  
  return cells;
}

/**
 * Finds all hit cells on the board that haven't been sunk yet
 */
function getUnsunkHits(board: Board, _previousShots: Set<string>): Position[] {
  const hits: Position[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].status === 'hit') {
        hits.push([row, col]);
      }
    }
  }
  
  return hits;
}

/**
 * Gets adjacent cells that haven't been shot
 */
function getValidAdjacentCells(
  pos: Position,
  previousShots: Set<string>
): Position[] {
  const [row, col] = pos;
  const adjacent: Position[] = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];
  
  return adjacent.filter(([r, c]) => 
    isInBounds(r, c) && !previousShots.has(positionToKey([r, c]))
  );
}

/**
 * Calculates the probability density map for ship placements
 * Higher values indicate cells more likely to contain a ship
 */
export function calculateProbabilityMap(
  board: Board,
  previousShots: Set<string>,
  remainingShips: ShipType[]
): number[][] {
  // Initialize 10x10 probability grid
  const probMap: number[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(0));
  
  // If no ships remain, return zero map
  if (remainingShips.length === 0) {
    return probMap;
  }
  
  // Get unsunk hits for targeting bonus
  const unsunkHits = getUnsunkHits(board, previousShots);
  
  // Get cells adjacent to hits for targeting
  const adjacentToHits = new Set<string>();
  for (const hit of unsunkHits) {
    const adjacent = getValidAdjacentCells(hit, previousShots);
    for (const cell of adjacent) {
      adjacentToHits.add(positionToKey(cell));
    }
  }
  
  // For each remaining ship type, calculate placement probabilities
  for (const shipType of remainingShips) {
    const shipSize = SHIP_SIZES[shipType];
    
    // Try all possible placements
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        // Try horizontal placement
        const hCells = getShipCells(row, col, shipSize, 'horizontal', previousShots);
        if (hCells.length > 0) {
          // Check if this placement is adjacent to any hits
          const isAdjacentToHit = hCells.some(cell => {
            const [r, c] = cell;
            // Check if any adjacent cell is a hit
            return [
              [r - 1, c],
              [r + 1, c],
              [r, c - 1],
              [r, c + 1],
            ].some(([ar, ac]) => 
              isInBounds(ar, ac) && board[ar][ac].status === 'hit'
            );
          });
          
          // Increment probability for each cell
          const bonus = isAdjacentToHit ? 2 : 1;
          for (const [r, c] of hCells) {
            probMap[r][c] += bonus;
          }
        }
        
        // Try vertical placement
        const vCells = getShipCells(row, col, shipSize, 'vertical', previousShots);
        if (vCells.length > 0) {
          // Check if this placement is adjacent to any hits
          const isAdjacentToHit = vCells.some(cell => {
            const [r, c] = cell;
            return [
              [r - 1, c],
              [r + 1, c],
              [r, c - 1],
              [r, c + 1],
            ].some(([ar, ac]) => 
              isInBounds(ar, ac) && board[ar][ac].status === 'hit'
            );
          });
          
          const bonus = isAdjacentToHit ? 2 : 1;
          for (const [r, c] of vCells) {
            probMap[r][c] += bonus;
          }
        }
      }
    }
  }
  
  // Apply targeting bonus for cells adjacent to hits
  // This makes the AI more aggressive when it has a hit
  // Use a very large bonus to ensure targeting mode takes priority
  for (const key of adjacentToHits) {
    const [row, col] = key.split(',').map(Number);
    if (isInBounds(row, col) && !previousShots.has(key)) {
      probMap[row][col] += 1000; // Large bonus to prioritize targeting over hunting
    }
  }
  
  // Zero out already-shot cells
  for (const key of previousShots) {
    const [row, col] = key.split(',').map(Number);
    if (isInBounds(row, col)) {
      probMap[row][col] = 0;
    }
  }
  
  return probMap;
}

/**
 * Gets the highest probability cells from the probability map
 */
function getHighestProbabilityCells(probMap: number[][]): Position[] {
  let maxProb = 0;
  const maxCells: Position[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (probMap[row][col] > maxProb) {
        maxProb = probMap[row][col];
        maxCells.length = 0;
        maxCells.push([row, col]);
      } else if (probMap[row][col] === maxProb && maxProb > 0) {
        maxCells.push([row, col]);
      }
    }
  }
  
  return maxCells;
}

/**
 * Gets a random element from an array
 */
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Gets all available (not yet shot) cells
 */
function getAvailableCells(previousShots: Set<string>): Position[] {
  const available: Position[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!previousShots.has(positionToKey([row, col]))) {
        available.push([row, col]);
      }
    }
  }
  
  return available;
}

/**
 * Hard AI using probability density algorithm
 * Calculates the probability of each cell containing a ship based on
 * remaining ships and shot history, then targets highest probability cells
 */
export function getHardAIMove(
  board: Board,
  previousShots: Set<string>,
  remainingShips: ShipType[]
): Position {
  // Calculate probability map
  const probMap = calculateProbabilityMap(board, previousShots, remainingShips);
  
  // Get cells with highest probability
  const maxCells = getHighestProbabilityCells(probMap);
  
  // If we have high probability cells, pick one randomly (breaks ties)
  if (maxCells.length > 0) {
    return getRandomElement(maxCells);
  }
  
  // Fallback: return a random available cell
  const availableCells = getAvailableCells(previousShots);
  
  if (availableCells.length > 0) {
    return getRandomElement(availableCells);
  }
  
  // Extreme fallback (should never happen in normal gameplay)
  return [0, 0];
}
