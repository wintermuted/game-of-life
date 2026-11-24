import { DiagnosticsMetrics } from './DiagnosticsMetrics';
import { ThemeTabs } from '@game-of-life/ui';
import { PatternInput } from '@game-of-life/ui-patterns';
import { useTranslation } from 'react-i18next';
import type * as React from 'react';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { SimulationPlayback } from './useSimulationPlayback';
import type { BoardEditing } from './useBoardEditing';
import type { StampEditing } from './useStampEditing';
import type { BoardPresentation } from './useBoardPresentation';
import type { BoardDiagnostics } from './useBoardDiagnostics';

export function DiagnosticsPanel(props: {
  board: Pick<PlaygroundBoardState, 'generation' | 'stats'>;
  playback: Pick<SimulationPlayback, 'isGameRunning'>;
  editing: Pick<BoardEditing, 'handleCenterCoordinateRequest'>;
  stamp: Pick<StampEditing, 'handlePatternInputLoad'>;
  presentation: Pick<
    BoardPresentation,
    | 'activeSidebarTab'
    | 'setActiveSidebarTab'
    | 'cellDataCopied'
    | 'copyCellData'
    | 'selectedPaletteId'
  >;
  diagnostics: Pick<
    BoardDiagnostics,
    | 'gridJSON'
    | 'cellDataEntries'
    | 'liveColorLeaderboard'
    | 'maxLiveColorCount'
    | 'overcrowdingPressureLeaderboard'
    | 'maxOvercrowdingPressureCount'
    | 'experimentalBirthLeaderboard'
    | 'maxExperimentalBirthCount'
    | 'hasExperimentalRulesEnabled'
  >;
}): React.JSX.Element {
  const { generation, stats } = props.board;
  const { isGameRunning } = props.playback;
  const { handleCenterCoordinateRequest } = props.editing;
  const { handlePatternInputLoad } = props.stamp;
  const { activeSidebarTab, setActiveSidebarTab, cellDataCopied, copyCellData, selectedPaletteId } =
    props.presentation;
  const { gridJSON, cellDataEntries } = props.diagnostics;
  const { t } = useTranslation();
  return (
    <div className="right-column wm-sidebar-layout-aside wm-sidebar-layout-aside-no-divider">
      <div className="sidebar-tabs-nav right-column-card-spaced">
        <ThemeTabs
          options={[
            { value: 'diagnostics', label: 'State' },
            { value: 'patterns', label: 'Patterns' },
          ]}
          activeValue={activeSidebarTab}
          onChange={(value) => setActiveSidebarTab(value as 'patterns' | 'diagnostics')}
          ariaLabel="Simulation panels"
        />
      </div>

      {activeSidebarTab === 'patterns' && (
        <div className="right-column-card-fill">
          <PatternInput
            onLoadPattern={handlePatternInputLoad}
            disabled={isGameRunning}
            selectedPaletteId={selectedPaletteId}
          />
        </div>
      )}

      {activeSidebarTab === 'diagnostics' && (
        <div className="diagnostics-panel">
          <details className="diagnostics-section" open>
            <summary className="diagnostics-section-summary">
              <h4 className="diagnostics-section-heading">{t('diagnostics.statistics')}</h4>
            </summary>
            <div className="diagnostics-section-content">
              <DiagnosticsMetrics
                generation={generation}
                stats={stats}
                diagnostics={props.diagnostics}
              />
            </div>
          </details>

          <details className="diagnostics-section" open>
            <summary className="diagnostics-section-summary">
              <h4 className="diagnostics-section-heading">{t('diagnostics.cellData')}</h4>
            </summary>
            <div className="diagnostics-section-content">
              <div className="code-sample" data-lang="json">
                <button
                  className="code-copy-btn"
                  type="button"
                  onClick={() => copyCellData(gridJSON)}
                >
                  {cellDataCopied ? 'Copied!' : 'Copy'}
                </button>
                <pre className="code-block">
                  <code className="language-json">
                    {cellDataEntries.length === 0 ? (
                      '{\n}'
                    ) : (
                      <>
                        <span>{'{\n'}</span>
                        {cellDataEntries.map(([coordinate, cellColor], index) => (
                          <span className="code-block-line" key={coordinate}>
                            <span>{'  '}</span>
                            <button
                              className="diagnostics-coordinate-button"
                              type="button"
                              onClick={() => handleCenterCoordinateRequest(coordinate)}
                            >
                              &quot;{coordinate}&quot;
                            </button>
                            <span>
                              : {JSON.stringify(cellColor)}
                              {index < cellDataEntries.length - 1 ? ',' : ''}
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
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
