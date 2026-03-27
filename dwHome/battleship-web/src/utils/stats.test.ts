import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStats, saveGameResult, resetStats, getDefaultStats } from './stats';
import type { GameStats, Difficulty } from '../types/game';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

describe('stats', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getDefaultStats', () => {
    it('should return default stats structure', () => {
      const stats = getDefaultStats();
      expect(stats.gamesPlayed).toBe(0);
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(0);
      expect(stats.winRate).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(0);
      expect(stats.byDifficulty).toEqual({
        easy: { played: 0, wins: 0 },
        medium: { played: 0, wins: 0 },
        hard: { played: 0, wins: 0 },
      });
    });
  });

  describe('getStats', () => {
    it('should return default stats when empty', () => {
      const stats = getStats();
      expect(stats).toEqual(getDefaultStats());
    });

    it('should return stored stats from localStorage', () => {
      const storedStats: GameStats = {
        gamesPlayed: 10,
        wins: 7,
        losses: 3,
        winRate: 70,
        currentStreak: 2,
        bestStreak: 5,
        byDifficulty: {
          easy: { played: 4, wins: 3 },
          medium: { played: 4, wins: 3 },
          hard: { played: 2, wins: 1 },
        },
      };
      localStorageMock.setItem('battleship-stats', JSON.stringify(storedStats));
      
      const stats = getStats();
      expect(stats).toEqual(storedStats);
    });
  });

  describe('saveGameResult', () => {
    it('should save win correctly', () => {
      saveGameResult('win', 'easy');
      
      const stats = getStats();
      expect(stats.gamesPlayed).toBe(1);
      expect(stats.wins).toBe(1);
      expect(stats.losses).toBe(0);
      expect(stats.winRate).toBe(100);
      expect(stats.currentStreak).toBe(1);
      expect(stats.bestStreak).toBe(1);
      expect(stats.byDifficulty.easy.played).toBe(1);
      expect(stats.byDifficulty.easy.wins).toBe(1);
    });

    it('should save loss correctly', () => {
      saveGameResult('lose', 'medium');
      
      const stats = getStats();
      expect(stats.gamesPlayed).toBe(1);
      expect(stats.wins).toBe(0);
      expect(stats.losses).toBe(1);
      expect(stats.winRate).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.byDifficulty.medium.played).toBe(1);
      expect(stats.byDifficulty.medium.wins).toBe(0);
    });

    it('should calculate winRate correctly', () => {
      saveGameResult('win', 'easy');
      saveGameResult('win', 'easy');
      saveGameResult('lose', 'easy');
      
      const stats = getStats();
      expect(stats.gamesPlayed).toBe(3);
      expect(stats.wins).toBe(2);
      expect(stats.losses).toBe(1);
      expect(stats.winRate).toBeCloseTo(66.67, 1);
    });

    it('should update streak on wins', () => {
      saveGameResult('win', 'easy');
      saveGameResult('win', 'easy');
      saveGameResult('win', 'easy');
      
      const stats = getStats();
      expect(stats.currentStreak).toBe(3);
      expect(stats.bestStreak).toBe(3);
    });

    it('should reset streak on loss', () => {
      saveGameResult('win', 'easy');
      saveGameResult('win', 'easy');
      saveGameResult('lose', 'easy');
      
      const stats = getStats();
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(2);
    });

    it('should preserve best streak when current streak resets', () => {
      saveGameResult('win', 'easy'); // streak: 1, best: 1
      saveGameResult('win', 'easy'); // streak: 2, best: 2
      saveGameResult('win', 'easy'); // streak: 3, best: 3
      saveGameResult('lose', 'easy'); // streak: 0, best: 3
      saveGameResult('win', 'easy'); // streak: 1, best: 3
      
      const stats = getStats();
      expect(stats.currentStreak).toBe(1);
      expect(stats.bestStreak).toBe(3);
    });

    it('should track byDifficulty stats correctly', () => {
      saveGameResult('win', 'easy');
      saveGameResult('lose', 'medium');
      saveGameResult('win', 'hard');
      
      const stats = getStats();
      expect(stats.byDifficulty.easy).toEqual({ played: 1, wins: 1 });
      expect(stats.byDifficulty.medium).toEqual({ played: 1, wins: 0 });
      expect(stats.byDifficulty.hard).toEqual({ played: 1, wins: 1 });
    });
  });

  describe('resetStats', () => {
    it('should clear all stats', () => {
      saveGameResult('win', 'easy');
      saveGameResult('win', 'medium');
      saveGameResult('lose', 'hard');
      
      resetStats();
      
      const stats = getStats();
      expect(stats).toEqual(getDefaultStats());
    });
  });

  describe('stats persistence', () => {
    it('should persist stats to localStorage', () => {
      saveGameResult('win', 'easy');
      
      // Verify setItem was called
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'battleship-stats',
        expect.any(String)
      );
      
      // Verify the stored value
      const storedValue = localStorageMock.getItem('battleship-stats');
      const parsedStats = JSON.parse(storedValue!);
      expect(parsedStats.gamesPlayed).toBe(1);
      expect(parsedStats.wins).toBe(1);
    });

    it('should persist across multiple operations', () => {
      saveGameResult('win', 'easy');
      saveGameResult('lose', 'medium');
      saveGameResult('win', 'hard');
      
      const stats = getStats();
      expect(stats.gamesPlayed).toBe(3);
      expect(stats.wins).toBe(2);
      expect(stats.losses).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle winRate calculation with 0 games played', () => {
      const stats = getStats();
      expect(stats.winRate).toBe(0);
    });

    it('should handle all difficulty levels', () => {
      const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
      
      difficulties.forEach(diff => {
        saveGameResult('win', diff);
      });
      
      const stats = getStats();
      expect(stats.gamesPlayed).toBe(3);
      expect(stats.byDifficulty.easy.played).toBe(1);
      expect(stats.byDifficulty.medium.played).toBe(1);
      expect(stats.byDifficulty.hard.played).toBe(1);
    });
  });
});
