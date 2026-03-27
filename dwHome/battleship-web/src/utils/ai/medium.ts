import type { Board, Position } from '../../types/game';
import { BOARD_SIZE } from '../../types/game';
import { getAdjacentPositions, isValidPosition } from '../gameLogic';

/**
 * Medium AI State - maintains state across moves
 */
export interface MediumAIState {
  /** Set of already shot positions (serialized as "row,col") */
  previousShots: Set<string>;
  /** Queue of positions to target (from hits) */
  hitQueue: Position[];
  /** Last hit position */
  lastHit: Position | null;
  /** Positions of sunk ships (for cleanup) */
  sunkShipPositions: Position[];
}

/**
 * Creates a new Medium AI state
 */
export function createMediumAIState(): MediumAIState {
  return {
    previousShots: new Set<string>(),
    hitQueue: [],
    lastHit: null,
    sunkShipPositions: [],
  };
}

/**
 * Serializes a position to a string key
 */
function positionKey(pos: Position): string {
  return `${pos[0]},${pos[1]}`;
}

/**
 * Deserializes a string key to a position
 */
export function keyToPosition(key: string): Position {
  const [row, col] = key.split(',').map(Number);
  return [row, col];
}

/**
 * Checks if a position has already been shot
 */
function isAlreadyShot(pos: Position, state: MediumAIState): boolean {
  return state.previousShots.has(positionKey(pos));
}

/**
 * Checks if a position is valid (within bounds)
 */
function isPositionValid(pos: Position): boolean {
  return isValidPosition([pos]);
}

/**
 * Gets all available (not yet shot) positions on the board
 */
function getAvailablePositions(state: MediumAIState): Position[] {
  const available: Position[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const pos: Position = [row, col];
      if (!isAlreadyShot(pos, state)) {
        available.push(pos);
      }
    }
  }
  return available;
}

/**
 * Adds adjacent cells of a hit position to the target queue
 * Only adds cells that are valid and not already shot
 */
function addAdjacentToQueue(pos: Position, state: MediumAIState): void {
  const adjacent = getAdjacentPositions(pos);
  
  for (const adjPos of adjacent) {
    // Only add if position is valid and not already shot
    if (isPositionValid(adjPos) && !isAlreadyShot(adjPos, state)) {
      // Check if not already in queue
      const key = positionKey(adjPos);
      const inQueue = state.hitQueue.some(p => positionKey(p) === key);
      if (!inQueue) {
        state.hitQueue.push(adjPos);
      }
    }
  }
}

/**
 * Removes positions related to a sunk ship from the queue
 * This is called when we know a ship is sunk
 */
export function removeSunkShipFromQueue(
  state: MediumAIState,
  sunkPositions: Position[]
): void {
  // Add to sunk positions tracking
  state.sunkShipPositions.push(...sunkPositions);
  
  // Remove all sunk positions from the queue
  const sunkKeys = new Set(sunkPositions.map(positionKey));
  state.hitQueue = state.hitQueue.filter(pos => !sunkKeys.has(positionKey(pos)));
}

/**
 * Medium AI move selection using Hunt/Target algorithm
 * 
 * Hunt Mode: Random selection from available cells
 * Target Mode: Pop from hit queue and explore adjacent cells
 * 
 * @param board The current game board
 * @param state The AI state (mutated during the call)
 * @returns The position to shoot
 */
export function getMediumAIMove(_board: Board, state: MediumAIState): Position {
  // Target Mode: If we have positions in the hit queue, use them
  if (state.hitQueue.length > 0) {
    // Pop the first position from the queue
    let target: Position | undefined;
    
    // Find a valid target from queue (not already shot)
    while (state.hitQueue.length > 0) {
      const candidate = state.hitQueue.shift();
      if (candidate && !isAlreadyShot(candidate, state)) {
        target = candidate;
        break;
      }
    }
    
    if (target) {
      // Mark as shot
      state.previousShots.add(positionKey(target));
      return target;
    }
  }
  
  // Hunt Mode: Random selection from available cells
  const availablePositions = getAvailablePositions(state);
  
  if (availablePositions.length === 0) {
    // No available positions (should not happen in a valid game)
    throw new Error('No available positions to shoot');
  }
  
  // Random selection
  const randomIndex = Math.floor(Math.random() * availablePositions.length);
  const selectedPosition = availablePositions[randomIndex];
  
  // Mark as shot
  state.previousShots.add(positionKey(selectedPosition));
  
  return selectedPosition;
}

/**
 * Records a hit and adds adjacent cells to the target queue
 * Call this after a successful hit
 */
export function recordHit(pos: Position, state: MediumAIState): void {
  state.lastHit = pos;
  addAdjacentToQueue(pos, state);
}

/**
 * Records a miss (for tracking purposes)
 */
export function recordMiss(_pos: Position, _state: MediumAIState): void {
  // Position is already marked in previousShots by getMediumAIMove
  // This function is for any additional miss handling
}

/**
 * Records a sunk ship and cleans up the queue
 * Call this when a ship is confirmed sunk
 */
export function recordSunkShip(positions: Position[], state: MediumAIState): void {
  removeSunkShipFromQueue(state, positions);
  state.lastHit = null;
}
