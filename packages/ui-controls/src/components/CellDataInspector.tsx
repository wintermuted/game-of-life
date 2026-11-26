import type { ReactElement } from 'react';

export interface CellDataInspectorProps {
  entries: readonly (readonly [string, string])[];
  copied: boolean;
  onCopy: () => void;
  onCoordinateSelect: (coordinate: string) => void;
  copyLabel?: string;
  copiedLabel?: string;
}

export function CellDataInspector({
  entries,
  copied,
  onCopy,
  onCoordinateSelect,
  copyLabel = 'Copy',
  copiedLabel = 'Copied!',
}: CellDataInspectorProps): ReactElement {
  return (
    <div className="code-sample" data-lang="json">
      <button className="code-copy-btn" type="button" onClick={onCopy}>
        {copied ? copiedLabel : copyLabel}
      </button>
      <pre className="code-block">
        <code className="language-json">
          {entries.length === 0 ? (
            '{\n}'
          ) : (
            <>
              <span>{'{\n'}</span>
              {entries.map(([coordinate, cellColor], index) => (
                <span className="code-block-line" key={coordinate}>
                  <span>{'  '}</span>
                  <button
                    className="diagnostics-coordinate-button"
                    type="button"
                    onClick={() => onCoordinateSelect(coordinate)}
                  >
                    &quot;{coordinate}&quot;
                  </button>
                  <span>
                    : {JSON.stringify(cellColor)}
                    {index < entries.length - 1 ? ',' : ''}
                  </span>
                  {'\n'}
                </span>
              ))}
              <span>{'}'}</span>
            </>
          )}
        </code>
      </pre>
    </div>
  );
}
