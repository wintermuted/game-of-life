import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
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

  function handleTabChange(_event: React.SyntheticEvent, newValue: number) {
    setActiveTab(newValue);
  }

  return (
    <Box sx={{ p: 2, pt: 0 }}>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label={t('patterns.title')} />
        <Tab label={t('patterns.custom')} />
      </Tabs>
      
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
    </Box>
  );
}

export default PatternInput;
