import type { Ship, Preset, ShipType, Position } from '../types/game';

const STORAGE_KEY = 'battleship-presets';
const MAX_PRESETS = 5;

/**
 * Get all presets from localStorage
 */
function getStoredPresets(): Preset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Preset[];
  } catch {
    return [];
  }
}

/**
 * Save presets to localStorage
 */
function setStoredPresets(presets: Preset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

/**
 * Convert Ship array to Preset ship format (removes runtime properties)
 */
function shipsToPresetFormat(ships: Ship[]): { type: ShipType; positions: Position[] }[] {
  return ships.map(ship => ({
    type: ship.type,
    positions: ship.positions,
  }));
}

/**
 * Save a new preset or update existing one with the same name
 * @param name Preset name
 * @param ships Array of ships to save
 * @returns true if saved successfully, false if max presets reached
 */
export function savePreset(name: string, ships: Ship[]): boolean {
  const presets = getStoredPresets();
  const existingIndex = presets.findIndex(p => p.name === name);
  
  // If not updating existing, check max limit
  if (existingIndex === -1 && presets.length >= MAX_PRESETS) {
    return false;
  }
  
  const newPreset: Preset = {
    name,
    ships: shipsToPresetFormat(ships),
    createdAt: Date.now(),
  };
  
  if (existingIndex !== -1) {
    // Update existing preset, preserving original createdAt
    newPreset.createdAt = presets[existingIndex].createdAt;
    presets[existingIndex] = newPreset;
  } else {
    // Add new preset
    presets.push(newPreset);
  }
  
  setStoredPresets(presets);
  return true;
}

/**
 * Load a preset by name
 * @param name Preset name
 * @returns Array of ship configurations or null if not found
 */
export function loadPreset(name: string): { type: ShipType; positions: Position[] }[] | null {
  const presets = getStoredPresets();
  const preset = presets.find(p => p.name === name);
  
  if (!preset) return null;
  
  return preset.ships;
}

/**
 * Delete a preset by name
 * @param name Preset name
 */
export function deletePreset(name: string): void {
  const presets = getStoredPresets();
  const filtered = presets.filter(p => p.name !== name);
  setStoredPresets(filtered);
}

/**
 * Get list of all presets sorted by creation date (newest first)
 * @returns Array of presets
 */
export function getPresetList(): Preset[] {
  const presets = getStoredPresets();
  return presets.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Clear all presets
 */
export function clearAllPresets(): void {
  localStorage.removeItem(STORAGE_KEY);
}
