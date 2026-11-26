import { Cpu, GitFork, Settings, Tag, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trackRecentBoard } from '@game-of-life/api';
import { PatternInfoPanel, type PatternInfoItem } from '@game-of-life/ui-patterns';
import type { PlaygroundMetadata } from './usePlaygroundMetadata';

interface Props {
  metadata: Pick<
    PlaygroundMetadata,
    | 'currentPatternMetadata'
    | 'isSystemPattern'
    | 'isUnsavedDraftBoard'
    | 'authorProfileHref'
    | 'patternCreatorLabel'
    | 'infoAuthorValue'
    | 'categoryExploreHref'
    | 'patternCategoryLabel'
    | 'infoCategoryValue'
    | 'rulesetExploreHref'
    | 'activeRulesetName'
    | 'patternForks'
    | 'forkedByRecords'
    | 'getBoardHref'
    | 'forkOrigin'
    | 'forkParentHref'
    | 'infoDescriptionValue'
    | 'infoTags'
    | 'getInfoTagExploreHref'
  >;
  onEdit: () => void;
  onViewForks: () => void;
}

export function PlaygroundPatternInfo({ metadata, onEdit, onViewForks }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const {
    currentPatternMetadata,
    isSystemPattern,
    isUnsavedDraftBoard,
    authorProfileHref,
    patternCreatorLabel,
    infoAuthorValue,
    categoryExploreHref,
    patternCategoryLabel,
    infoCategoryValue,
    rulesetExploreHref,
    activeRulesetName,
    patternForks,
    forkedByRecords,
    getBoardHref,
    forkOrigin,
    forkParentHref,
    infoDescriptionValue,
    infoTags,
    getInfoTagExploreHref,
  } = metadata;
  const items: PatternInfoItem[] = [
    {
      id: 'author',
      icon: currentPatternMetadata?.source === 'system' ? <Cpu size={12} /> : <User size={12} />,
      label: t('playground.infoAuthorLabel'),
      value:
        authorProfileHref && patternCreatorLabel ? (
          <Link className="play-about-meta-value-link" to={authorProfileHref}>
            {patternCreatorLabel}
          </Link>
        ) : (
          <span className="play-about-meta-value">{infoAuthorValue}</span>
        ),
    },
    {
      id: 'category',
      icon: <Tag size={12} />,
      label: t('playground.infoCategoryLabel'),
      value:
        categoryExploreHref && patternCategoryLabel ? (
          <Link className="play-about-meta-value-link" to={categoryExploreHref}>
            {patternCategoryLabel}
          </Link>
        ) : (
          <span className="play-about-meta-value">{infoCategoryValue}</span>
        ),
    },
    {
      id: 'ruleset',
      icon: <Settings size={12} />,
      label: t('diagnostics.rulesetLabel'),
      value: (
        <Link className="play-about-meta-value-link" to={rulesetExploreHref}>
          {activeRulesetName}
        </Link>
      ),
    },
  ];
  if (!isUnsavedDraftBoard || isSystemPattern) {
    items.push({
      id: 'forks',
      icon: <GitFork size={12} />,
      label: t('playground.infoForksMetaLabel'),
      value: (
        <button
          className="play-about-forks-count"
          type="button"
          onClick={onViewForks}
          aria-label={t('playground.viewForks')}
          title={t('playground.viewForks')}
        >
          {patternForks}
        </button>
      ),
      details:
        forkedByRecords.length > 0 ? (
          // DEDUPLICATE-LATER: BoardPopularityList provides the full fork-record presentation.
          <ul className="play-about-forks-list" aria-label={t('playground.infoForksMetaLabel')}>
            {forkedByRecords.map((entry) => (
              <li key={entry.boardId}>
                <Link
                  className="play-about-fork-link"
                  to={getBoardHref(entry.boardHash, entry.boardId)}
                  onClick={() => trackRecentBoard(entry.boardHash, entry.pattern, entry.boardId)}
                >
                  <span>{entry.pattern}</span>
                  <span>{entry.forker}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null,
    });
  }
  if (forkOrigin && forkParentHref) {
    items.push({
      id: 'origin',
      icon: <GitFork size={12} />,
      label: t('playground.infoForkedFromLabel'),
      value: (
        <Link className="play-about-meta-value-link" to={forkParentHref}>
          {forkOrigin.parentTitle}
        </Link>
      ),
    });
  }
  return (
    <PatternInfoPanel
      description={infoDescriptionValue}
      tags={infoTags.map((label) => ({ label, href: getInfoTagExploreHref(label) }))}
      referenceUrl={currentPatternMetadata?.referenceUrl}
      items={items}
      onEdit={isSystemPattern ? undefined : onEdit}
      renderLink={({ href, ...props }) => <Link to={href} {...props} />}
    />
  );
}
