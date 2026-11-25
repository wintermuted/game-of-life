import { RankedBarList, StatCard } from '@wintermuted/ui-react';
import { useTranslation } from 'react-i18next';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { BoardDiagnostics } from './useBoardDiagnostics';

interface Props {
  generation: PlaygroundBoardState['generation'];
  stats: PlaygroundBoardState['stats'];
  diagnostics: Pick<
    BoardDiagnostics,
    | 'liveColorLeaderboard'
    | 'maxLiveColorCount'
    | 'overcrowdingPressureLeaderboard'
    | 'maxOvercrowdingPressureCount'
    | 'experimentalBirthLeaderboard'
    | 'maxExperimentalBirthCount'
    | 'hasExperimentalRulesEnabled'
  >;
}

export function DiagnosticsMetrics({ generation, stats, diagnostics }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const {
    liveColorLeaderboard,
    maxLiveColorCount,
    overcrowdingPressureLeaderboard,
    maxOvercrowdingPressureCount,
    experimentalBirthLeaderboard,
    maxExperimentalBirthCount,
    hasExperimentalRulesEnabled,
  } = diagnostics;
  return (
    <>
      <div className="diagnostics-stats-grid">
        <StatCard variant="compact" label={t('diagnostics.generations')} value={generation} />
        <StatCard variant="compact" label={t('diagnostics.liveCells')} value={stats.liveCells} />
        <StatCard
          variant="compact"
          label={t('diagnostics.totalBirths')}
          value={stats.births}
          tone="success"
        />
        <StatCard
          variant="compact"
          label={t('diagnostics.totalDeaths')}
          value={stats.deaths}
          tone="danger"
        />
      </div>
      <StatCard variant="compact" label={t('diagnostics.liveCellsByColor')}>
        <RankedBarList
          label={t('diagnostics.liveCellsByColor')}
          maximum={maxLiveColorCount}
          minimumWidthPercent={6}
          empty={t('diagnostics.noLiveCellsByColor')}
          items={liveColorLeaderboard.map(({ color, count }) => ({
            id: color,
            label: color,
            color,
            value: count,
            valueLabel: t('diagnostics.liveCellsCount', { count }),
          }))}
        />
      </StatCard>
      <StatCard
        variant="compact"
        label={t('diagnostics.generationInteractions')}
        className="diagnostics-stat-card-generation-interactions"
      >
        <RankedBarList
          label={t('diagnostics.overcrowdingDeathsByOtherColor')}
          heading={t('diagnostics.overcrowdingDeathsByOtherColor')}
          maximum={maxOvercrowdingPressureCount}
          minimumWidthPercent={6}
          empty={t('diagnostics.noOvercrowdingDeathsByOtherColor')}
          items={overcrowdingPressureLeaderboard.map(({ color, count }) => ({
            id: color,
            label: color,
            color,
            value: count,
            valueLabel: t('diagnostics.overcrowdingDeathsCount', { count }),
          }))}
        />
        <RankedBarList
          label={t('diagnostics.experimentalBirthsByColor')}
          heading={t('diagnostics.experimentalBirthsByColor')}
          maximum={maxExperimentalBirthCount}
          minimumWidthPercent={6}
          empty={t(
            hasExperimentalRulesEnabled
              ? 'diagnostics.noExperimentalBirthsByColor'
              : 'diagnostics.experimentalRulesDisabled',
          )}
          items={
            hasExperimentalRulesEnabled
              ? experimentalBirthLeaderboard.map(({ color, count, tieBreakCount }) => ({
                  id: color,
                  label: color,
                  color,
                  value: count,
                  valueLabel: `${t('diagnostics.experimentalBirthsCount', { count })}${tieBreakCount > 0 ? ` (${t('diagnostics.tieBreakBirthsCount', { count: tieBreakCount })})` : ''}`,
                }))
              : []
          }
        />
      </StatCard>
    </>
  );
}
