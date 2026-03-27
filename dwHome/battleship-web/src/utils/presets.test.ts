import { describe, it, expect, beforeEach, vi } from 'vitest';
import { savePreset, loadPreset, deletePreset, getPresetList, clearAllPresets } from './presets';
import type { Ship, Preset, ShipType, Position } from '../types/game';

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

// Helper to create test ships
function createTestShips(): Ship[] {
  return [
    {
      id: 'ship-1',
      type: 'carrier' as ShipType,
      positions: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] as Position[],
      hits: 0,
      sunk: false,
      size: 5,
    },
    {
      id: 'ship-2',
      type: 'battleship' as ShipType,
      positions: [[2, 0], [2, 1], [2, 2], [2, 3]] as Position[],
      hits: 0,
      sunk: false,
      size: 4,
    },
    {
      id: 'ship-3',
      type: 'cruiser' as ShipType,
      positions: [[4, 0], [4, 1], [4, 2]] as Position[],
      hits: 0,
      sunk: false,
      size: 3,
    },
    {
      id: 'ship-4',
      type: 'submarine' as ShipType,
      positions: [[6, 0], [6, 1], [6, 2]] as Position[],
      hits: 0,
      sunk: false,
      size: 3,
    },
    {
      id: 'ship-5',
      type: 'destroyer' as ShipType,
      positions: [[8, 0], [8, 1]] as Position[],
      hits: 0,
      sunk: false,
      size: 2,
    },
  ];
}

describe('presets', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('savePreset', () => {
    it('should save preset correctly', () => {
      const ships = createTestShips();
      const result = savePreset('My Layout', ships);
      
      expect(result).toBe(true);
      
      const presets = getPresetList();
      expect(presets).toHaveLength(1);
      expect(presets[0].name).toBe('My Layout');
      expect(presets[0].ships).toHaveLength(5);
    });

    it('should save multiple presets', () => {
      const ships1 = createTestShips();
      const ships2 = createTestShips();
      
      savePreset('Layout 1', ships1);
      savePreset('Layout 2', ships2);
      
      const presets = getPresetList();
      expect(presets).toHaveLength(2);
    });

    it('should update existing preset with same name', () => {
      const ships1 = createTestShips();
      const ships2 = createTestShips();
      // Modify positions for second save
      ships2[0].positions = [[5, 5], [5, 6], [5, 7], [5, 8], [5, 9]];
      
      savePreset('My Layout', ships1);
      savePreset('My Layout', ships2);
      
      const presets = getPresetList();
      expect(presets).toHaveLength(1);
      // Should have updated positions
      expect(presets[0].ships[0].positions).toEqual([[5, 5], [5, 6], [5, 7], [5, 8], [5, 9]]);
    });

    it('should enforce max 5 presets', () => {
      const ships = createTestShips();
      
      // Save 5 presets
      for (let i = 1; i <= 5; i++) {
        const result = savePreset(`Layout ${i}`, ships);
        expect(result).toBe(true);
      }
      
      // Try to save 6th - should fail
      const result = savePreset('Layout 6', ships);
      expect(result).toBe(false);
      
      const presets = getPresetList();
      expect(presets).toHaveLength(5);
    });

    it('should save preset to localStorage', () => {
      const ships = createTestShips();
      savePreset('My Layout', ships);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'battleship-presets',
        expect.any(String)
      );
    });

    it('should set createdAt timestamp', () => {
      const ships = createTestShips();
      const beforeSave = Date.now();
      savePreset('My Layout', ships);
      const afterSave = Date.now();
      
      const presets = getPresetList();
      expect(presets[0].createdAt).toBeGreaterThanOrEqual(beforeSave);
      expect(presets[0].createdAt).toBeLessThanOrEqual(afterSave);
    });
  });

  describe('loadPreset', () => {
    it('should load preset correctly', () => {
      const ships = createTestShips();
      savePreset('My Layout', ships);
      
      const loaded = loadPreset('My Layout');
      
      expect(loaded).not.toBeNull();
      expect(loaded).toHaveLength(5);
      expect(loaded![0].type).toBe('carrier');
      expect(loaded![0].positions).toEqual([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]);
    });

    it('should return null for non-existent preset', () => {
      const loaded = loadPreset('Non-existent');
      expect(loaded).toBeNull();
    });

    it('should return ships without runtime properties', () => {
      const ships = createTestShips();
      savePreset('My Layout', ships);
      
      const loaded = loadPreset('My Layout');
      
      // Loaded ships should only have type and positions (no id, hits, sunk)
      expect(loaded).not.toBeNull();
      expect(loaded![0]).toHaveProperty('type');
      expect(loaded![0]).toHaveProperty('positions');
      expect(loaded![0]).not.toHaveProperty('id');
      expect(loaded![0]).not.toHaveProperty('hits');
      expect(loaded![0]).not.toHaveProperty('sunk');
    });
  });

  describe('deletePreset', () => {
    it('should delete preset correctly', () => {
      const ships = createTestShips();
      savePreset('Layout 1', ships);
      savePreset('Layout 2', ships);
      
      deletePreset('Layout 1');
      
      const presets = getPresetList();
      expect(presets).toHaveLength(1);
      expect(presets[0].name).toBe('Layout 2');
    });

    it('should handle deleting non-existent preset', () => {
      // Should not throw
      expect(() => deletePreset('Non-existent')).not.toThrow();
      
      const presets = getPresetList();
      expect(presets).toHaveLength(0);
    });

    it('should update localStorage after delete', () => {
      const ships = createTestShips();
      savePreset('Layout 1', ships);
      
      vi.clearAllMocks();
      
      deletePreset('Layout 1');
      
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('getPresetList', () => {
    it('should return empty array when no presets', () => {
      const presets = getPresetList();
      expect(presets).toEqual([]);
    });

    it('should return all presets sorted by createdAt descending', async () => {
      const ships = createTestShips();
      
      savePreset('First', ships);
      await new Promise(r => setTimeout(r, 10)); // Small delay to ensure different timestamps
      savePreset('Second', ships);
      await new Promise(r => setTimeout(r, 10));
      savePreset('Third', ships);
      
      const presets = getPresetList();
      expect(presets).toHaveLength(3);
      // Should be sorted newest first
      expect(presets[0].name).toBe('Third');
      expect(presets[1].name).toBe('Second');
      expect(presets[2].name).toBe('First');
    });

    it('should return presets with correct structure', () => {
      const ships = createTestShips();
      savePreset('My Layout', ships);
      
      const presets = getPresetList();
      
      expect(presets[0]).toHaveProperty('name');
      expect(presets[0]).toHaveProperty('ships');
      expect(presets[0]).toHaveProperty('createdAt');
      expect(Array.isArray(presets[0].ships)).toBe(true);
    });
  });

  describe('clearAllPresets', () => {
    it('should clear all presets', () => {
      const ships = createTestShips();
      savePreset('Layout 1', ships);
      savePreset('Layout 2', ships);
      savePreset('Layout 3', ships);
      
      clearAllPresets();
      
      const presets = getPresetList();
      expect(presets).toHaveLength(0);
    });

    it('should handle clearing when no presets exist', () => {
      expect(() => clearAllPresets()).not.toThrow();
    });
  });

  describe('persistence', () => {
    it('should persist presets to localStorage', () => {
      const ships = createTestShips();
      savePreset('My Layout', ships);
      
      const storedValue = localStorageMock.getItem('battleship-presets');
      expect(storedValue).not.toBeNull();
      
      const parsed = JSON.parse(storedValue!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('My Layout');
    });

    it('should load presets from localStorage on init', () => {
      // Pre-populate localStorage
      const preset: Preset = {
        name: 'Saved Layout',
        ships: [{ type: 'carrier', positions: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] }],
        createdAt: Date.now(),
      };
      localStorageMock.setItem('battleship-presets', JSON.stringify([preset]));
      
      const presets = getPresetList();
      expect(presets).toHaveLength(1);
      expect(presets[0].name).toBe('Saved Layout');
    });
  });
});
