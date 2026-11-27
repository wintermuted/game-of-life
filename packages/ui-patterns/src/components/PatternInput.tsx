import { useState, type ReactElement } from 'react';
import { Tabs } from '@wintermuted/ui-react';
import CustomPatternInput from './CustomPatternInput';
import PatternSelector from './PatternSelector';
import { LifeGrid } from '@game-of-life/core';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PALETTE_ID } from '@game-of-life/ui';

interface Props {
  onLoadPattern: (grid: LifeGrid, rulesetId?: string) => void;
  disabled?: boolean;
  selectedPaletteId?: string;
}

function PatternInput({
  onLoadPattern,
  disabled = false,
  selectedPaletteId = DEFAULT_PALETTE_ID,
}: Props): ReactElement {
  const [activeTab, setActiveTab] = useState<'starter' | 'custom'>('starter');
  const { t } = useTranslation();

  return (
    <Tabs
      className="pattern-input-section playground-tabs"
      label={t('patterns.title')}
      value={activeTab}
      onValueChange={(value) => {
        if (value === 'starter' || value === 'custom') setActiveTab(value);
      }}
      items={[
        {
          id: 'starter',
          label: t('patterns.title'),
          content: activeTab === 'starter' && (
            <PatternSelector
              onSelectPattern={onLoadPattern}
              disabled={disabled}
              selectedPaletteId={selectedPaletteId}
            />
          ),
        },
        {
          id: 'custom',
          label: t('patterns.custom'),
          // Tabs keeps hidden panels mounted; inactive product forms must reset.
          content: activeTab === 'custom' && (
            <div className="card card-body">
              <CustomPatternInput onLoadPattern={onLoadPattern} disabled={disabled} />
            </div>
          ),
        },
      ]}
    />
  );
}

export default PatternInput;
