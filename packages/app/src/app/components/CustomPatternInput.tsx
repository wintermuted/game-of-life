import { useState } from 'react';
import { parseCoordinates, LifeGrid } from '@game-of-life/core';
import { useTranslation } from 'react-i18next';

interface Props {
  onLoadPattern: (grid: LifeGrid) => void;
  disabled?: boolean;
}

function CustomPatternInput({ onLoadPattern, disabled = false }: Props) {
  const SAMPLE_PATTERN_COORDINATES = '1 0\n2 1\n0 2\n1 2\n2 2';
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

  function handleLoadSampleData() {
    setError(null);
    try {
      const grid = parseCoordinates(SAMPLE_PATTERN_COORDINATES);
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

      {error && (
        <div
          className="feedback feedback-error"
          style={{ marginBottom: '0.75rem' }}
          role="alert"
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button
          className="btn btn-primary-neutral"
          type="button"
          onClick={handleLoad}
          disabled={disabled || !input.trim()}
          style={{ flex: 1 }}
        >
          {t('patterns.loadCustom')}
        </button>
        <button
          className="btn btn-secondary-neutral"
          type="button"
          onClick={handleLoadSampleData}
          disabled={disabled}
          style={{ flex: 1 }}
        >
          {t('patterns.loadSampleData')}
        </button>
      </div>

      <button
        type="button"
        className="btn btn-expand"
        aria-expanded={showHelp}
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
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <div style={{ marginBottom: '0.2rem', color: 'var(--wm-color-text-muted)' }}>JSON</div>
              <code>{`{ "1,0": true, "0,1": true }`}</code>
            </div>
            <div>
              <div style={{ marginBottom: '0.2rem', color: 'var(--wm-color-text-muted)' }}>Space-separated</div>
              <code>{'1 0 0 1 1 1'}</code>
            </div>
            <div>
              <div style={{ marginBottom: '0.2rem', color: 'var(--wm-color-text-muted)' }}>Line-separated</div>
              <pre style={{ margin: 0, fontSize: '0.75rem' }}>{'1 0\n0 1\n1 1'}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomPatternInput;
