import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Customization } from './Customization';
import type { Ship, Theme, ShipType, Position } from '../../types/game';
import * as presetsModule from '../../utils/presets';

// Mock the presets module
vi.mock('../../utils/presets', () => ({
  savePreset: vi.fn(),
  loadPreset: vi.fn(),
  deletePreset: vi.fn(),
  getPresetList: vi.fn(() => []),
  clearAllPresets: vi.fn(),
}));

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
  ];
}

describe('Customization', () => {
  const mockOnThemeChange = vi.fn();
  const mockOnLoadPreset = vi.fn();
  
  const defaultProps = {
    currentTheme: 'classic' as Theme,
    onThemeChange: mockOnThemeChange,
    onLoadPreset: mockOnLoadPreset,
    currentShips: createTestShips(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(presetsModule.getPresetList).mockReturnValue([]);
  });

  describe('rendering', () => {
    it('should render theme selector', () => {
      render(<Customization {...defaultProps} />);
      
      expect(screen.getByText(/테마/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /테마 선택/i })).toBeInTheDocument();
    });

    it('should render all theme options', () => {
      render(<Customization {...defaultProps} />);
      
      const select = screen.getByRole('combobox', { name: /테마 선택/i });
      expect(select).toHaveValue('classic');
      
      // Check options exist
      expect(screen.getByRole('option', { name: /클래식/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /다크/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /오션/i })).toBeInTheDocument();
    });

    it('should render preset section', () => {
      render(<Customization {...defaultProps} />);
      
      // Use heading role to find the preset section specifically
      expect(screen.getByRole('heading', { name: /프리셋/i })).toBeInTheDocument();
    });

    it('should apply theme class to panel', () => {
      render(<Customization {...defaultProps} />);
      
      expect(screen.getByTestId('customization-panel')).toHaveClass('theme-classic');
    });

    it('should render through ocean theme', () => {
      render(<Customization {...defaultProps} currentTheme="ocean" />);
      expect(screen.getByTestId('customization-panel')).toHaveClass('theme-ocean');
    });

    it('should show current theme as selected', () => {
      const { rerender } = render(<Customization {...defaultProps} currentTheme="classic" />);
      expect(screen.getByRole('combobox', { name: /테마 선택/i })).toHaveValue('classic');
      
      rerender(<Customization {...defaultProps} currentTheme="dark" />);
      expect(screen.getByRole('combobox', { name: /테마 선택/i })).toHaveValue('dark');
    });
  });

  describe('theme changes', () => {
    it('should call onThemeChange when theme is changed', () => {
      render(<Customization {...defaultProps} />);
      
      const select = screen.getByRole('combobox', { name: /테마 선택/i });
      fireEvent.change(select, { target: { value: 'dark' } });
      
      expect(mockOnThemeChange).toHaveBeenCalledWith('dark');
    });

    it('should call onThemeChange with ocean theme', () => {
      render(<Customization {...defaultProps} />);
      
      const select = screen.getByRole('combobox', { name: /테마 선택/i });
      fireEvent.change(select, { target: { value: 'ocean' } });
      
      expect(mockOnThemeChange).toHaveBeenCalledWith('ocean');
    });
  });

  describe('preset save', () => {
    it('should call savePreset with name and ships', () => {
      vi.mocked(presetsModule.savePreset).mockReturnValue(true);
      
      render(<Customization {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/프리셋 이름/i);
      fireEvent.change(input, { target: { value: 'My Layout' } });
      
      const saveButton = screen.getByRole('button', { name: /저장/i });
      fireEvent.click(saveButton);
      
      // When save is successful, show success message
      expect(screen.getByText(/프리셋이 저장되었습니다/i)).toBeInTheDocument();
    });

    it('should show error when max presets reached', () => {
      vi.mocked(presetsModule.savePreset).mockReturnValue(false);
      
      render(<Customization {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/프리셋 이름/i);
      fireEvent.change(input, { target: { value: 'My Layout' } });
      
      const saveButton = screen.getByRole('button', { name: /저장/i });
      fireEvent.click(saveButton);
      
      // When max presets reached (5), show error message
      expect(screen.getByText(/최대 5개의 프리셋만 저장할 수 있습니다/i)).toBeInTheDocument();
    });

    it('should clear input after successful save', async () => {
      vi.mocked(presetsModule.savePreset).mockReturnValue(true);
      
      render(<Customization {...defaultProps} />);
      
      const input = screen.getByPlaceholderText(/프리셋 이름/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'My Layout' } });
      
      const saveButton = screen.getByRole('button', { name: /저장/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('preset load', () => {
    it('should call loadPreset and onLoadPreset when load button clicked', () => {
      const mockShips: Ship[] = [{ type: 'carrier' as ShipType, positions: [[0, 0]] as Position[], id: 'test', hits: 0, sunk: false, size: 5 }];
      vi.mocked(presetsModule.getPresetList).mockReturnValue([
        { name: 'My Layout', ships: mockShips, createdAt: Date.now() },
      ]);
      vi.mocked(presetsModule.loadPreset).mockReturnValue(mockShips);
      
      render(<Customization {...defaultProps} />);
      
      const loadButton = screen.getByRole('button', { name: /불러오기/i });
      fireEvent.click(loadButton);
      
      expect(presetsModule.loadPreset).toHaveBeenCalledWith('My Layout');
      expect(mockOnLoadPreset).toHaveBeenCalledWith(mockShips);
    });

    it('should show load button for each preset', () => {
      vi.mocked(presetsModule.getPresetList).mockReturnValue([
        { name: 'Layout 1', ships: [], createdAt: Date.now() },
        { name: 'Layout 2', ships: [], createdAt: Date.now() - 1000 },
      ]);
      
      render(<Customization {...defaultProps} />);
      
      const loadButtons = screen.getAllByRole('button', { name: /불러오기/i });
      expect(loadButtons).toHaveLength(2);
    });
  });

  describe('preset delete', () => {
    it('should show delete button for each preset', () => {
      vi.mocked(presetsModule.getPresetList).mockReturnValue([
        { name: 'Layout 1', ships: [], createdAt: Date.now() },
        { name: 'Layout 2', ships: [], createdAt: Date.now() - 1000 },
      ]);
      
      render(<Customization {...defaultProps} />);
      
      const deleteButtons = screen.getAllByRole('button', { name: /삭제/i });
      expect(deleteButtons).toHaveLength(2);
    });

    it('should confirm before deleting', () => {
      vi.mocked(presetsModule.getPresetList).mockReturnValue([
        { name: 'My Layout', ships: [], createdAt: Date.now() },
      ]);
      
      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(<Customization {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: /삭제/i });
      fireEvent.click(deleteButton);
      
      expect(confirmSpy).toHaveBeenCalled();
      expect(presetsModule.deletePreset).not.toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });

    it('should delete when confirmed', () => {
      vi.mocked(presetsModule.getPresetList).mockReturnValue([
        { name: 'My Layout', ships: [], createdAt: Date.now() },
      ]);
      
      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(<Customization {...defaultProps} />);
      
      const deleteButton = screen.getByRole('button', { name: /삭제/i });
      fireEvent.click(deleteButton);
      
      expect(presetsModule.deletePreset).toHaveBeenCalledWith('My Layout');
      
      confirmSpy.mockRestore();
    });
  });
});
