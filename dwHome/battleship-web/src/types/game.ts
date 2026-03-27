// Cell status types
export type CellStatus = 'empty' | 'ship' | 'hit' | 'miss';

// Ship types
export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';

// Position tuple [row, col]
export type Position = [number, number];

// Ship orientation
export type Orientation = 'horizontal' | 'vertical';

// Ship definition
export interface Ship {
  id: string;
  type: ShipType;
  positions: Position[];
  hits: number;
  sunk: boolean;
  size: number;
}

// Cell definition
export interface Cell {
  status: CellStatus;
  shipId?: string;
}

// Board is a 10x10 grid of cells
export type Board = Cell[][];

// Game phases
export type GamePhase = 'setup' | 'playing' | 'gameover';

// AI difficulty
export type Difficulty = 'easy' | 'medium' | 'hard';

// Player definition
export interface Player {
  board: Board;
  ships: Ship[];
  shipsRemaining: number;
}

// Game state
export interface GameState {
  phase: GamePhase;
  player: Player;
  enemy: Player;
  currentTurn: 'player' | 'enemy';
  winner?: 'player' | 'enemy';
  difficulty: Difficulty;
}

// Game statistics
export interface GameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  byDifficulty: Record<Difficulty, { played: number; wins: number }>;
}

// Sound types
export type SoundType = 'hit' | 'miss' | 'sunk' | 'win' | 'lose' | 'click';

// Theme types
export type Theme = 'classic' | 'dark' | 'ocean';

// Ship preset for saving/loading configurations
export interface Preset {
  name: string;
  ships: { type: ShipType; positions: Position[] }[];
  createdAt: number;
}

// Constants
export const BOARD_SIZE = 10;

export const SHIP_SIZES: Record<ShipType, number> = {
  carrier: 5,
  battleship: 4,
  cruiser: 3,
  submarine: 3,
  destroyer: 2,
};

export const SHIP_NAMES: Record<ShipType, string> = {
  carrier: '항공모함',
  battleship: '전함',
  cruiser: '순양함',
  submarine: '잠수함',
  destroyer: '구축함',
}

// Ship order for placement
export const SHIP_ORDER: ShipType[] = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'];
