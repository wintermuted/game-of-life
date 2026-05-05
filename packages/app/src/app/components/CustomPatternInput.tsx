import { useState } from 'react';
import { parseCoordinates, LifeGrid } from '@game-of-life/core';
import { useTranslation } from 'react-i18next';

interface Props {
  onLoadPattern: (grid: LifeGrid) => void;
  disabled?: boolean;
}

function CustomPatternInput({ onLoadPattern, disabled = false }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const { t } = useTranslation();

  function handleLoad() {
    setError(null);
    try {
      const grid = parseCoordinates(input);
      onLoadPattern(grid);
      setInput('');
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Failed to parse coordinates');
      }
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    if (error) setError(null);
  }

  return (
    <div>
      <textarea
        className="form-control"
        rows={4}
        placeholder={t('patterns.placeholder')}
        value={input}
        onChange={handleInputChange}
        disabled={disabled}
        style={{ width: '100%', resize: 'vertical', marginBottom: '0.25rem', boxSizing: 'border-box' }}
      />
      <button
        type="button"
        className="btn btn-ghost"
        style={{ fontSize: '0.8rem', padding: '0 0.25rem', marginBottom: '0.5rem' }}
        onClick={() => setShowHelp(!showHelp)}
      >
        {showHelp ? t('patterns.hideExamples') : t('patterns.showExamples')}
      </button>

      {showHelp && (
        <div
          style={{
            marginBottom: '0.75rem',
            padding: '0.75rem',
            background: 'var(--wm-color-surface-raised)',
            borderRadius: 'var(--wm-radius-sm)',
            fontSize: '0.8rem',
          }}
        >
          <strong>{t('patterns.supportedFormats')}</strong>
          <div><strong>1. JSON:</strong><pre style={{ margin: '2px 0', fontSize: '0.75rem' }}>{`{ "1,0": true, "0,1": true }`}</pre></div>
          <div><strong>2. Space-separated:</strong><pre style={{ margin: '2px 0', fontSize: '0.75rem' }}>{'1 0 0 1 1 1'}</pre></div>
          <div><strong>3. Line-separated:</strong><pre style={{ margin: '2px 0', fontSize: '0.75rem' }}>{'1 0\n0 1\n1 1'}</pre></div>
        </div>
      )}

      {error && (
        <div
          className="feedback feedback-error"
          style={{ marginBottom: '0.75rem' }}
          role="alert"
        >
          {error}
        </div>
      )}

      <button
        className="btn btn-primary"
        type="button"
        onClick={handleLoad}
        disabled={disabled || !input.trim()}
        style={{ width: '100%' }}
      >
        {t('patterns.loadCustom')}
      </button>
    </div>
  );
}

export default CustomPatternInput;
