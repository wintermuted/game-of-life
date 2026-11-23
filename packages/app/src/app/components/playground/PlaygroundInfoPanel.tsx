import { GitFork, Lock, LockOpen, Settings, Tag, Cpu, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RulesPanel } from '@game-of-life/ui-controls';
import { useTranslation } from 'react-i18next';
import { trackRecentBoard } from '@game-of-life/api';
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
    activeRulesetName,
    currentPatternMetadata,
    isSystemPattern,
    forkOrigin,
    isUnsavedDraftBoard,
    isUnsavedEditableBoard,
    canManageGameRules,
    patternCategoryLabel,
    patternCreatorLabel,
    authorProfileHref,
    categoryExploreHref,
    rulesetExploreHref,
    forkParentHref,
    infoAuthorValue,
    infoCategoryValue,
    infoDescriptionValue,
    infoTags,
    getInfoTagExploreHref,
    patternForks,
    forkedByRecords,
    getBoardHref,
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
          <section className="play-about-section" aria-label={t('playground.infoTitle')}>
            <div className="play-about-header-row">
              <h4 className="diagnostics-section-heading">{t('playground.infoTitle')}</h4>
              {!isSystemPattern ? (
                <button
                  className="control-tooltip-trigger play-about-settings-btn"
                  type="button"
                  onClick={() => openDraftSaveConfirmModal('edit')}
                  aria-label={t('playground.editPatternInfo')}
                  data-tooltip={t('playground.editPatternInfo')}
                >
                  <Settings size={13} aria-hidden="true" />
                </button>
              ) : null}
            </div>
            <div className="play-about-content">
              <p className="play-about-description">{infoDescriptionValue}</p>
              {infoTags.length > 0 ? (
                <div className="play-about-tags" aria-label="Tags">
                  {infoTags.map((tag) => (
                    <Link
                      key={tag}
                      className="wm-badge wm-badge-neutral play-about-tag"
                      to={getInfoTagExploreHref(tag)}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              ) : null}
              {currentPatternMetadata?.referenceUrl ? (
                <a
                  className="play-about-meta-value-link"
                  href={currentPatternMetadata.referenceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Wikipedia
                </a>
              ) : null}
              <div className="play-about-meta-list">
                <div className="play-about-meta-item">
                  <span className="play-about-meta-icon" aria-hidden="true">
                    {currentPatternMetadata?.source === 'system' ? (
                      <Cpu size={12} />
                    ) : (
                      <User size={12} />
                    )}
                  </span>
                  <span className="play-about-meta-label">{t('playground.infoAuthorLabel')}</span>
                  {authorProfileHref && patternCreatorLabel ? (
                    <Link className="play-about-meta-value-link" to={authorProfileHref as string}>
                      {patternCreatorLabel}
                    </Link>
                  ) : (
                    <span className="play-about-meta-value">{infoAuthorValue}</span>
                  )}
                </div>
                <div className="play-about-meta-item">
                  <span className="play-about-meta-icon" aria-hidden="true">
                    <Tag size={12} />
                  </span>
                  <span className="play-about-meta-label">{t('playground.infoCategoryLabel')}</span>
                  {categoryExploreHref && patternCategoryLabel ? (
                    <Link className="play-about-meta-value-link" to={categoryExploreHref as string}>
                      {patternCategoryLabel}
                    </Link>
                  ) : (
                    <span className="play-about-meta-value">{infoCategoryValue}</span>
                  )}
                </div>
                <div className="play-about-meta-item">
                  <span className="play-about-meta-icon" aria-hidden="true">
                    <Settings size={12} />
                  </span>
                  <span className="play-about-meta-label">{t('diagnostics.rulesetLabel')}</span>
                  <Link className="play-about-meta-value-link" to={rulesetExploreHref}>
                    {activeRulesetName}
                  </Link>
                </div>
                {!isUnsavedDraftBoard || isSystemPattern ? (
                  <>
                    <div className="play-about-meta-item">
                      <span className="play-about-meta-icon" aria-hidden="true">
                        <GitFork size={12} />
                      </span>
                      <span className="play-about-meta-label">
                        {t('playground.infoForksMetaLabel')}
                      </span>
                      <button
                        className="play-about-forks-count"
                        type="button"
                        onClick={() => setActivePopularityModal('forks')}
                        aria-label={t('playground.viewForks')}
                        title={t('playground.viewForks')}
                      >
                        {patternForks}
                      </button>
                    </div>
                    {forkedByRecords.length > 0 ? (
                      <ul
                        className="play-about-forks-list"
                        aria-label={t('playground.infoForksMetaLabel')}
                      >
                        {forkedByRecords.map((entry) => (
                          <li key={entry.boardId}>
                            <Link
                              className="play-about-fork-link"
                              to={getBoardHref(entry.boardHash, entry.boardId)}
                              onClick={() =>
                                trackRecentBoard(entry.boardHash, entry.pattern, entry.boardId)
                              }
                            >
                              <span>{entry.pattern}</span>
                              <span>{entry.forker}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                ) : null}
                {forkOrigin && forkParentHref ? (
                  <div className="play-about-meta-item">
                    <span className="play-about-meta-icon" aria-hidden="true">
                      <GitFork size={12} />
                    </span>
                    <span className="play-about-meta-label">
                      {t('playground.infoForkedFromLabel')}
                    </span>
                    <Link className="play-about-meta-value-link" to={forkParentHref}>
                      {forkOrigin.parentTitle}
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <hr className="play-sidebar-section-divider" aria-hidden="true" />

          {canManageGameRules ? (
            <>
              <details className="diagnostics-section diagnostics-section-rules" open>
                <summary className="diagnostics-section-summary">
                  <h4 className="diagnostics-section-heading">{t('rules.title')}</h4>
                  <button
                    type="button"
                    className="diagnostics-rules-lock-icon-btn"
                    disabled={isUnsavedEditableBoard}
                    aria-label={isRulesLocked ? t('rules.unlockButton') : t('rules.lockButton')}
                    title={isRulesLocked ? t('rules.unlockButton') : t('rules.lockButton')}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
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
                </summary>
                <div className="diagnostics-section-content">
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
                </div>
              </details>

              <hr className="play-sidebar-section-divider" aria-hidden="true" />
            </>
          ) : null}

          <details className="diagnostics-section diagnostics-section-settings" open>
            <summary className="diagnostics-section-summary">
              <h4 className="diagnostics-section-heading">{t('diagnostics.settings')}</h4>
            </summary>
            <div className="diagnostics-section-content">
              <div className="wm-toggle-list">
                <div className="settings-toggle-item">
                  <span className="rules-checkbox-main">
                    <label className="rules-checkbox-row">
                      <input
                        type="checkbox"
                        className="rules-checkbox-input"
                        checked={isStabilityOverlayEnabled}
                        onChange={(event) => handleStabilityOverlayToggle(event.target.checked)}
                      />
                      <span className="rules-checkbox-label">
                        {t('diagnostics.stabilityOverlayEnabled')}
                      </span>
                    </label>
                    <span className="rules-popover-wrap">
                      <span
                        className="rules-popover-trigger"
                        aria-label={t('diagnostics.stabilityOverlayDescription')}
                        role="img"
                        onMouseEnter={(event) =>
                          showSettingsPopover(event, t('diagnostics.stabilityOverlayDescription'))
                        }
                        onMouseLeave={hideSettingsPopover}
                      >
                        <span className="rules-popover-trigger-icon" aria-hidden="true">
                          i
                        </span>
                      </span>
                    </span>
                  </span>
                </div>
                <div className="settings-toggle-item">
                  <span className="rules-checkbox-main">
                    <label className="rules-checkbox-row">
                      <input
                        type="checkbox"
                        className="rules-checkbox-input"
                        checked={isBirthDeathPreviewEnabled}
                        onChange={(event) => setIsBirthDeathPreviewEnabled(event.target.checked)}
                      />
                      <span className="rules-checkbox-label">
                        {t('diagnostics.birthDeathPreviewEnabled')}
                      </span>
                    </label>
                    <span className="rules-popover-wrap">
                      <span
                        className="rules-popover-trigger"
                        aria-label={t('diagnostics.birthDeathPreviewDescription')}
                        role="img"
                        onMouseEnter={(event) =>
                          showSettingsPopover(event, t('diagnostics.birthDeathPreviewDescription'))
                        }
                        onMouseLeave={hideSettingsPopover}
                      >
                        <span className="rules-popover-trigger-icon" aria-hidden="true">
                          i
                        </span>
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
