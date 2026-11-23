import { useEffect, useMemo, useState } from 'react';
import { ensureSeededSocialData, getForkOrigins } from '@game-of-life/api';
import { encodeGridToBase64 } from '@game-of-life/util';
import { useTranslation } from 'react-i18next';
import {
  buildExploreCatalog,
  buildForkedPatterns,
  buildPatternMetrics,
  getCurrentProfileName,
  getFavoriteHashesForActor,
} from './exploreCatalog';
export function useExploreCatalog(): {
  allPatterns: ReturnType<typeof buildExploreCatalog>;
  forkedPatterns: ReturnType<typeof buildForkedPatterns>;
  currentProfileName: string;
  favoriteHashes: Set<string>;
  setFavoriteHashes: React.Dispatch<React.SetStateAction<Set<string>>>;
  setForkOrigins: React.Dispatch<React.SetStateAction<ReturnType<typeof getForkOrigins>>>;
  patternMetrics: ReturnType<typeof buildPatternMetrics>;
  setPatternMetrics: React.Dispatch<React.SetStateAction<ReturnType<typeof buildPatternMetrics>>>;
} {
  const { t } = useTranslation();
  const currentProfileName = getCurrentProfileName();
  const [favoriteHashes, setFavoriteHashes] = useState(() =>
    getFavoriteHashesForActor(currentProfileName),
  );
  const [forkOrigins, setForkOrigins] = useState(getForkOrigins);
  const allPatterns = useMemo(buildExploreCatalog, []);
  const forkedPatterns = useMemo(
    () => buildForkedPatterns(allPatterns, forkOrigins, t),
    [allPatterns, forkOrigins, t],
  );

  const [patternMetrics, setPatternMetrics] = useState<
    Record<string, { favorites: number; forks: number }>
  >(() => {
    return buildPatternMetrics(allPatterns);
  });

  useEffect(() => {
    const catalog = allPatterns.map((pattern) => ({
      hash: encodeGridToBase64(pattern.grid),
      title: pattern.name,
      source: pattern.source,
      creatorName: pattern.creatorName,
    }));

    ensureSeededSocialData(catalog);
    setFavoriteHashes(getFavoriteHashesForActor(currentProfileName));
    setForkOrigins((current) => {
      const next = getForkOrigins();
      return next.map((entry) => entry.hash).join('|') ===
        current.map((entry) => entry.hash).join('|')
        ? current
        : next;
    });
    setPatternMetrics(buildPatternMetrics(allPatterns));
  }, [allPatterns, currentProfileName]);

  return {
    allPatterns,
    forkedPatterns,
    currentProfileName,
    favoriteHashes,
    setFavoriteHashes,
    setForkOrigins,
    patternMetrics,
    setPatternMetrics,
  };
}
export type ExploreCatalogState = ReturnType<typeof useExploreCatalog>;
