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
  const {
    gridJSON,
    cellDataEntries,
    liveColorLeaderboard,
    maxLiveColorCount,
    overcrowdingPressureLeaderboard,
    maxOvercrowdingPressureCount,
    experimentalBirthLeaderboard,
    maxExperimentalBirthCount,
    hasExperimentalRulesEnabled,
  } = props.diagnostics;
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
              <div className="diagnostics-stats-grid">
                <article className="diagnostics-stat-card">
                  <p className="diagnostics-stat-label">{t('diagnostics.generations')}</p>
                  <p className="diagnostics-stat-value">{generation}</p>
                </article>
                <article className="diagnostics-stat-card">
                  <p className="diagnostics-stat-label">{t('diagnostics.liveCells')}</p>
                  <p className="diagnostics-stat-value">{stats.liveCells}</p>
                </article>
                <article className="diagnostics-stat-card">
                  <p className="diagnostics-stat-label">{t('diagnostics.totalBirths')}</p>
                  <p className="diagnostics-stat-value diagnostics-stat-value--success">
                    {stats.births}
                  </p>
                </article>
                <article className="diagnostics-stat-card">
                  <p className="diagnostics-stat-label">{t('diagnostics.totalDeaths')}</p>
                  <p className="diagnostics-stat-value diagnostics-stat-value--danger">
                    {stats.deaths}
                  </p>
                </article>
              </div>
              <article className="diagnostics-stat-card">
                <p className="diagnostics-stat-label">{t('diagnostics.liveCellsByColor')}</p>
                <div
                  className="diagnostics-color-leaderboard"
                  role="list"
                  aria-label={t('diagnostics.liveCellsByColor')}
                >
                  {liveColorLeaderboard.length === 0 ? (
                    <p className="diagnostics-color-leaderboard-empty">
                      {t('diagnostics.noLiveCellsByColor')}
                    </p>
                  ) : (
                    liveColorLeaderboard.map(({ color, count }) => {
                      const relativeWidth =
                        maxLiveColorCount > 0 ? Math.max(6, (count / maxLiveColorCount) * 100) : 0;
                      return (
                        <div
                          className="diagnostics-color-leaderboard-item"
                          role="listitem"
                          key={color}
                        >
                          <div className="diagnostics-color-leaderboard-item-header">
                            <span
                              className="diagnostics-color-chip"
                              style={{ backgroundColor: color }}
                              aria-hidden="true"
                            ></span>
                            <span className="diagnostics-color-code">{color}</span>
                            <span className="diagnostics-color-count">
                              {t('diagnostics.liveCellsCount', { count })}
                            </span>
                          </div>
                          <div className="diagnostics-color-bar-track" aria-hidden="true">
                            <div
                              className="diagnostics-color-bar-fill"
                              style={{ width: `${relativeWidth}%`, backgroundColor: color }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </article>
              <article className="diagnostics-stat-card diagnostics-stat-card-generation-interactions">
                <p className="diagnostics-stat-label">{t('diagnostics.generationInteractions')}</p>
                <div
                  className="diagnostics-color-leaderboard"
                  role="list"
                  aria-label={t('diagnostics.overcrowdingDeathsByOtherColor')}
                >
                  <p className="diagnostics-color-leaderboard-heading">
                    {t('diagnostics.overcrowdingDeathsByOtherColor')}
                  </p>
                  {overcrowdingPressureLeaderboard.length === 0 ? (
                    <p className="diagnostics-color-leaderboard-empty">
                      {t('diagnostics.noOvercrowdingDeathsByOtherColor')}
                    </p>
                  ) : (
                    overcrowdingPressureLeaderboard.map(({ color, count }) => {
                      const relativeWidth =
                        maxOvercrowdingPressureCount > 0
                          ? Math.max(6, (count / maxOvercrowdingPressureCount) * 100)
                          : 0;
                      return (
                        <div
                          className="diagnostics-color-leaderboard-item"
                          role="listitem"
                          key={`overcrowding-${color}`}
                        >
                          <div className="diagnostics-color-leaderboard-item-header">
                            <span
                              className="diagnostics-color-chip"
                              style={{ backgroundColor: color }}
                              aria-hidden="true"
                            ></span>
                            <span className="diagnostics-color-code">{color}</span>
                            <span className="diagnostics-color-count">
                              {t('diagnostics.overcrowdingDeathsCount', { count })}
                            </span>
                          </div>
                          <div className="diagnostics-color-bar-track" aria-hidden="true">
                            <div
                              className="diagnostics-color-bar-fill"
                              style={{ width: `${relativeWidth}%`, backgroundColor: color }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div
                  className="diagnostics-color-leaderboard"
                  role="list"
                  aria-label={t('diagnostics.experimentalBirthsByColor')}
                >
                  <p className="diagnostics-color-leaderboard-heading">
                    {t('diagnostics.experimentalBirthsByColor')}
                  </p>
                  {!hasExperimentalRulesEnabled ? (
                    <p className="diagnostics-color-leaderboard-empty">
                      {t('diagnostics.experimentalRulesDisabled')}
                    </p>
                  ) : experimentalBirthLeaderboard.length === 0 ? (
                    <p className="diagnostics-color-leaderboard-empty">
                      {t('diagnostics.noExperimentalBirthsByColor')}
                    </p>
                  ) : (
                    experimentalBirthLeaderboard.map(({ color, count, tieBreakCount }) => {
                      const relativeWidth =
                        maxExperimentalBirthCount > 0
                          ? Math.max(6, (count / maxExperimentalBirthCount) * 100)
                          : 0;
                      return (
                        <div
                          className="diagnostics-color-leaderboard-item"
                          role="listitem"
                          key={`experimental-birth-${color}`}
                        >
                          <div className="diagnostics-color-leaderboard-item-header">
                            <span
                              className="diagnostics-color-chip"
                              style={{ backgroundColor: color }}
                              aria-hidden="true"
                            ></span>
                            <span className="diagnostics-color-code">{color}</span>
                            <span className="diagnostics-color-count">
                              {t('diagnostics.experimentalBirthsCount', { count })}
                              {tieBreakCount > 0
                                ? ` (${t('diagnostics.tieBreakBirthsCount', { count: tieBreakCount })})`
                                : ''}
                            </span>
                          </div>
                          <div className="diagnostics-color-bar-track" aria-hidden="true">
                            <div
                              className="diagnostics-color-bar-fill"
                              style={{ width: `${relativeWidth}%`, backgroundColor: color }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </article>
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
