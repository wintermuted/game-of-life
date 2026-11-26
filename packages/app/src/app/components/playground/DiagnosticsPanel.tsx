import { DiagnosticsMetrics } from './DiagnosticsMetrics';
import { ThemeTabs, DisclosureSection } from '@game-of-life/ui';
import { CellDataInspector } from '@game-of-life/ui-controls';
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
          <DisclosureSection title={t('diagnostics.statistics')}>
            <DiagnosticsMetrics
              generation={generation}
              stats={stats}
              diagnostics={props.diagnostics}
            />
          </DisclosureSection>

          <DisclosureSection title={t('diagnostics.cellData')}>
            <CellDataInspector
              entries={cellDataEntries}
              copied={cellDataCopied}
              onCopy={() => copyCellData(gridJSON)}
              onCoordinateSelect={handleCenterCoordinateRequest}
            />
          </DisclosureSection>
        </div>
      )}
    </div>
  );
}
