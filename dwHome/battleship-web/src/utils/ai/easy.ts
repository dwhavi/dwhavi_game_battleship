import type { Board, Position } from '../../types/game';
import { BOARD_SIZE } from '../../types/game';

/**
 * Converts a Position tuple to a string key for Set operations
 */
export function positionToKey(position: Position): string {
  return `${position[0]},${position[1]}`;
}

/**
 * Gets all available positions on the board that haven't been shot
 * @param board The game board
 * @param previousShots Set of position keys already shot
 * @returns Array of available positions
 */
function getAvailablePositions(board: Board, previousShots: Set<string>): Position[] {
  const available: Position[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = board[row][col];
      const key = positionToKey([row, col]);
      
      // Skip if already shot (in previousShots) or has hit/miss status
      if (previousShots.has(key)) continue;
      if (cell.status === 'hit' || cell.status === 'miss') continue;
      
      available.push([row, col]);
    }
  }
  
  return available;
}

/**
 * Easy AI move generator - selects random available positions
 * Pure function with no side effects
 * 
 * @param board The game board to analyze
 * @param previousShots Set of position keys (format: "row,col") already shot
 * @returns A random position that hasn't been shot yet
 */
export function getEasyAIMove(board: Board, previousShots: Set<string>): Position {
  const availablePositions = getAvailablePositions(board, previousShots);
  
  // If no positions available, return a random position (edge case fallback)
  if (availablePositions.length === 0) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);
    return [row, col];
  }
  
  // Return random position from available positions
  const randomIndex = Math.floor(Math.random() * availablePositions.length);
  return availablePositions[randomIndex];
}
