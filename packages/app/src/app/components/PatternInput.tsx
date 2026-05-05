import { useState } from 'react';
import CustomPatternInput from './CustomPatternInput';
import PatternSelector from './PatternSelector';
import { LifeGrid } from '@game-of-life/core';
import { useTranslation } from 'react-i18next';

interface Props {
  onLoadPattern: (grid: LifeGrid) => void;
  disabled?: boolean;
}

function PatternInput({ onLoadPattern, disabled = false }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();

  return (
    <div style={{ paddingTop: '0.5rem' }}>
      <div className="tab-bar" role="tablist" style={{ marginBottom: '0.75rem' }}>
        <button
          className={`tab-btn${activeTab === 0 ? ' tab-btn-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 0}
          type="button"
          onClick={() => setActiveTab(0)}
        >
          {t('patterns.title')}
        </button>
        <button
          className={`tab-btn${activeTab === 1 ? ' tab-btn-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 1}
          type="button"
          onClick={() => setActiveTab(1)}
        >
          {t('patterns.custom')}
        </button>
      </div>

      {activeTab === 0 && (
        <PatternSelector 
          onSelectPattern={onLoadPattern}
          disabled={disabled}
        />
      )}

      {activeTab === 1 && (
        <CustomPatternInput 
          onLoadPattern={onLoadPattern}
          disabled={disabled}
        />
      )}
    </div>
  );
}

export default PatternInput;
