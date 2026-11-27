import { Lock, LockOpen } from 'lucide-react';
import { RulesPanel, SimulationSettingsPanel } from '@game-of-life/ui-controls';
import { DisclosureSection } from '@game-of-life/ui';
import { useTranslation } from 'react-i18next';
import { PlaygroundPatternInfo } from './PlaygroundPatternInfo';
import type * as React from 'react';
import type { PlaygroundBoardState } from './usePlaygroundBoard';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';
import type { SimulationPlayback } from './useSimulationPlayback';
import type { PlaygroundRulesActions } from './usePlaygroundRules';
import type { BoardPersistence } from './useBoardPersistence';
import type { BoardSocial } from './useBoardSocial';
import type { BoardPresentation } from './useBoardPresentation';

export function PlaygroundInfoPanel(props: {
  board: Pick<PlaygroundBoardState, 'rules' | 'isRulesLocked'>;
  metadata: Pick<
    PlaygroundMetadata,
    | 'selectedRulesetId'
    | 'activeRulesetClassification'
    | 'activeRulesetName'
    | 'currentPatternMetadata'
    | 'isSystemPattern'
    | 'forkOrigin'
    | 'isUnsavedDraftBoard'
    | 'isUnsavedEditableBoard'
    | 'canManageGameRules'
    | 'patternCategoryLabel'
    | 'patternCreatorLabel'
    | 'authorProfileHref'
    | 'categoryExploreHref'
    | 'rulesetExploreHref'
    | 'forkParentHref'
    | 'infoAuthorValue'
    | 'infoCategoryValue'
    | 'infoDescriptionValue'
    | 'infoTags'
    | 'getInfoTagExploreHref'
    | 'patternForks'
    | 'forkedByRecords'
    | 'getBoardHref'
  >;
  playback: Pick<
    SimulationPlayback,
    'isGameRunning' | 'isStabilityOverlayEnabled' | 'handleStabilityOverlayToggle'
  >;
  ruleActions: Pick<
    PlaygroundRulesActions,
    'handleRulesChange' | 'handleRulesetChange' | 'requestUnlockRules' | 'lockRules'
  >;
  persistence: Pick<BoardPersistence, 'openDraftSaveConfirmModal'>;
  social: Pick<BoardSocial, 'setActivePopularityModal'>;
  presentation: Pick<
    BoardPresentation,
    | 'isBirthDeathPreviewEnabled'
    | 'setIsBirthDeathPreviewEnabled'
    | 'showSettingsPopover'
    | 'hideSettingsPopover'
  >;
}): React.JSX.Element {
  const { rules, isRulesLocked } = props.board;
  const {
    selectedRulesetId,
    activeRulesetClassification,
    isUnsavedEditableBoard,
    canManageGameRules,
  } = props.metadata;
  const { isGameRunning, isStabilityOverlayEnabled, handleStabilityOverlayToggle } = props.playback;
  const { handleRulesChange, handleRulesetChange, requestUnlockRules, lockRules } =
    props.ruleActions;
  const { openDraftSaveConfirmModal } = props.persistence;
  const { setActivePopularityModal } = props.social;
  const {
    isBirthDeathPreviewEnabled,
    setIsBirthDeathPreviewEnabled,
    showSettingsPopover,
    hideSettingsPopover,
  } = props.presentation;
  const { t } = useTranslation();
  return (
    <div className="left-info-column wm-sidebar-layout-aside wm-sidebar-layout-aside-no-divider">
      <div className="left-info-column-card-fill">
        <div className="diagnostics-panel play-info-panel">
          <PlaygroundPatternInfo
            metadata={props.metadata}
            onEdit={() => openDraftSaveConfirmModal('edit')}
            onViewForks={() => setActivePopularityModal('forks')}
          />

          <hr className="play-sidebar-section-divider" aria-hidden="true" />

          {canManageGameRules ? (
            <>
              <DisclosureSection
                title={t('rules.title')}
                className="diagnostics-section-rules"
                headerAction={
                  <button
                    type="button"
                    className="diagnostics-rules-lock-icon-btn"
                    disabled={isUnsavedEditableBoard}
                    aria-label={isRulesLocked ? t('rules.unlockButton') : t('rules.lockButton')}
                    title={isRulesLocked ? t('rules.unlockButton') : t('rules.lockButton')}
                    onClick={() => {
                      if (isRulesLocked) {
                        requestUnlockRules();
                        return;
                      }
                      lockRules();
                    }}
                  >
                    {isRulesLocked ? (
                      <Lock size={13} aria-hidden="true" />
                    ) : (
                      <LockOpen size={13} aria-hidden="true" />
                    )}
                  </button>
                }
              >
                <RulesPanel
                  rules={rules}
                  onRulesChange={handleRulesChange}
                  selectedRulesetId={selectedRulesetId}
                  onRulesetChange={handleRulesetChange}
                  disabled={isGameRunning}
                  embedded={true}
                  rulesLocked={isRulesLocked}
                  activeRulesetClassification={activeRulesetClassification}
                />
              </DisclosureSection>

              <hr className="play-sidebar-section-divider" aria-hidden="true" />
            </>
          ) : null}

          <DisclosureSection
            title={t('diagnostics.settings')}
            className="diagnostics-section-settings"
          >
            <SimulationSettingsPanel
              stabilityOverlayEnabled={isStabilityOverlayEnabled}
              birthDeathPreviewEnabled={isBirthDeathPreviewEnabled}
              onStabilityOverlayChange={handleStabilityOverlayToggle}
              onBirthDeathPreviewChange={setIsBirthDeathPreviewEnabled}
              onShowHelp={showSettingsPopover}
              onHideHelp={hideSettingsPopover}
            />
          </DisclosureSection>
        </div>
      </div>
    </div>
  );
}
