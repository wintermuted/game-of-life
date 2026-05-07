import { useState } from 'react';
import CustomPatternInput from './CustomPatternInput';
import PatternSelector from './PatternSelector';
import { LifeGrid } from '@game-of-life/core';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PALETTE_ID } from '../constants/colors';
import ThemeTabs from './ui/ThemeTabs';

interface Props {
  onLoadPattern: (grid: LifeGrid) => void;
  disabled?: boolean;
  selectedPaletteId?: string;
}

function PatternInput({ onLoadPattern, disabled = false, selectedPaletteId = DEFAULT_PALETTE_ID }: Props) {
  const [activeTab, setActiveTab] = useState<'starter' | 'custom'>('starter');
  const { t } = useTranslation();

  return (
    <div className="pattern-input-section">
      <div className="pattern-input-tabs">
        <ThemeTabs
          options={[
            { value: 'starter', label: 'Starters' },
            { value: 'custom', label: 'Custom' },
          ]}
          activeValue={activeTab}
          onChange={(value) => setActiveTab(value as 'starter' | 'custom')}
          ariaLabel={t('patterns.title')}
        />
      </div>

      {activeTab === 'starter' && (
        <PatternSelector 
          onSelectPattern={onLoadPattern}
          disabled={disabled}
          selectedPaletteId={selectedPaletteId}
        />
      )}

      {activeTab === 'custom' && (
        <div className="card card-body">
          <CustomPatternInput 
            onLoadPattern={onLoadPattern}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

export default PatternInput;
