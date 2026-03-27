import { useState, useCallback, useEffect } from 'react';
import type { Ship, Theme, ShipType, Position } from '../../types/game';
import { savePreset, loadPreset, deletePreset, getPresetList } from '../../utils/presets';

export interface CustomizationProps {
  /** Current selected theme */
  currentTheme: Theme;
  /** Callback when theme changes */
  onThemeChange: (theme: Theme) => void;
  /** Callback when preset is loaded */
  onLoadPreset: (ships: { type: ShipType; positions: Position[] }[]) => void;
  /** Current ships on board */
  currentShips: Ship[];
}

interface PresetInfo {
  name: string;
  createdAt: number;
}

const THEME_LABELS: Record<Theme, string> = {
  classic: '클래식',
  dark: '다크',
  ocean: '오션',
};

export function Customization({
  currentTheme,
  onThemeChange,
  onLoadPreset,
  currentShips,
}: CustomizationProps) {
  const [presetName, setPresetName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [presets, setPresets] = useState<PresetInfo[]>([]);

  // Load presets on mount
  useEffect(() => {
    const loadedPresets = getPresetList();
    setPresets(loadedPresets.map(p => ({ name: p.name, createdAt: p.createdAt })));
  }, []);

  // Refresh preset list
  const refreshPresets = useCallback(() => {
    const loadedPresets = getPresetList();
    setPresets(loadedPresets.map(p => ({ name: p.name, createdAt: p.createdAt })));
  }, []);

  // Handle theme change
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onThemeChange(e.target.value as Theme);
  };

  // Handle preset save
  const handleSavePreset = useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!presetName.trim()) {
      setErrorMessage('프리셋 이름을 입력해주세요.');
      return;
    }

    const success = savePreset(presetName.trim(), currentShips);
    
    if (success) {
      setSuccessMessage('프리셋이 저장되었습니다.');
      setPresetName('');
      refreshPresets();
    } else {
      setErrorMessage('최대 5개의 프리셋만 저장할 수 있습니다.');
    }
  }, [presetName, currentShips, refreshPresets]);

  // Handle preset load
  const handleLoadPreset = useCallback((name: string) => {
    const ships = loadPreset(name);
    if (ships) {
      onLoadPreset(ships);
      setSuccessMessage(`"${name}" 프리셋을 불러왔습니다.`);
      setErrorMessage(null);
    }
  }, [onLoadPreset]);

  // Handle preset delete
  const handleDeletePreset = useCallback((name: string) => {
    if (window.confirm(`"${name}" 프리셋을 삭제하시겠습니까?`)) {
      deletePreset(name);
      refreshPresets();
      setSuccessMessage(`"${name}" 프리셋이 삭제되었습니다.`);
      setErrorMessage(null);
    }
  }, [refreshPresets]);

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get theme class
  const getThemeClass = () => {
    return `theme-${currentTheme}`;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${getThemeClass()}`}
      data-testid="customization-panel"
    >
      {/* Theme Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
          테마
        </h2>
        <select
          value={currentTheme}
          onChange={handleThemeChange}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
            focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="테마 선택"
        >
          {(Object.keys(THEME_LABELS) as Theme[]).map((theme) => (
            <option key={theme} value={theme}>
              {THEME_LABELS[theme]}
            </option>
          ))}
        </select>
      </div>

      {/* Preset Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
          프리셋
        </h2>

        {/* Save Preset */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="프리셋 이름 입력"
              className="flex-1 p-2 rounded-lg border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
            <button
              type="button"
              onClick={handleSavePreset}
              className="px-4 py-2 rounded-lg font-medium transition-colors
                bg-blue-500 hover:bg-blue-600 text-white
                disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:text-gray-500"
            >
              저장
            </button>
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
          </div>
        )}

        {/* Preset List */}
        <div className="space-y-2">
          {presets.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              저장된 프리셋이 없습니다.
            </p>
          ) : (
            presets.map((preset) => (
              <div
                key={preset.name}
                className="flex items-center justify-between p-3 rounded-lg
                  bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
                    {preset.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(preset.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    type="button"
                    onClick={() => handleLoadPreset(preset.name)}
                    className="px-3 py-1.5 text-sm rounded-md font-medium transition-colors
                      bg-green-500 hover:bg-green-600 text-white"
                    aria-label={`${preset.name} 불러오기`}
                  >
                    불러오기
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePreset(preset.name)}
                    className="px-3 py-1.5 text-sm rounded-md font-medium transition-colors
                      bg-red-500 hover:bg-red-600 text-white"
                    aria-label={`${preset.name} 삭제`}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preset count indicator */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-right">
          {presets.length} / 5 프리셋
        </div>
      </div>
    </div>
  );
}
