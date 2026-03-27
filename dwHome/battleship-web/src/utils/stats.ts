import type { GameStats, Difficulty } from '../types/game';

const STORAGE_KEY = 'battleship-stats';

/**
 * Returns the default stats structure
 */
export function getDefaultStats(): GameStats {
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    byDifficulty: {
      easy: { played: 0, wins: 0 },
      medium: { played: 0, wins: 0 },
      hard: { played: 0, wins: 0 },
    },
  };
}

/**
 * Check if localStorage is available (handles SSR case)
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get stats from localStorage
 */
export function getStats(): GameStats {
  if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
    return getDefaultStats();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return getDefaultStats();
  }

  try {
    const parsed = JSON.parse(stored) as GameStats;
    // Ensure all fields exist (migration safety)
    return {
      ...getDefaultStats(),
      ...parsed,
      byDifficulty: {
        ...getDefaultStats().byDifficulty,
        ...parsed.byDifficulty,
      },
    };
  } catch {
    return getDefaultStats();
  }
}

/**
 * Save stats to localStorage
 */
function saveStats(stats: GameStats): void {
  if (typeof window === 'undefined' || !isLocalStorageAvailable()) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

/**
 * Save game result and update stats
 */
export function saveGameResult(result: 'win' | 'lose', difficulty: Difficulty): void {
  const stats = getStats();

  stats.gamesPlayed += 1;
  stats.byDifficulty[difficulty].played += 1;

  if (result === 'win') {
    stats.wins += 1;
    stats.byDifficulty[difficulty].wins += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.bestStreak) {
      stats.bestStreak = stats.currentStreak;
    }
  } else {
    stats.losses += 1;
    stats.currentStreak = 0;
  }

  // Calculate winRate
  stats.winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.wins / stats.gamesPlayed) * 10000) / 100 
    : 0;

  saveStats(stats);
}

/**
 * Reset all stats
 */
export function resetStats(): void {
  saveStats(getDefaultStats());
}
