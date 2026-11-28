import { DiagnosticsMetrics } from './DiagnosticsMetrics';
import { DisclosureSection } from '@game-of-life/ui';
import { Tabs } from '@wintermuted/ui-react';
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
    <Tabs
      className="right-column wm-sidebar-layout-aside wm-sidebar-layout-aside-no-divider playground-tabs sidebar-panel-tabs"
      label="Simulation panels"
      value={activeSidebarTab}
      onValueChange={(value) => {
        if (value === 'patterns' || value === 'diagnostics') setActiveSidebarTab(value);
      }}
      items={[
        {
          id: 'diagnostics',
          label: 'State',
          content: activeSidebarTab === 'diagnostics' && (
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
          ),
        },
        {
          id: 'patterns',
          label: 'Patterns',
          content: activeSidebarTab === 'patterns' && (
            <div className="right-column-card-fill">
              <PatternInput
                onLoadPattern={handlePatternInputLoad}
                disabled={isGameRunning}
                selectedPaletteId={selectedPaletteId}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
