import { patterns } from '@game-of-life/core';
import { encodeGridToBase64 } from '@game-of-life/util';
import { PlayPatternMetadata } from './playgroundTypes';
import { seededUserPatterns } from '../../data/socialPatternCatalog';
const seededUserPatternMetadata: PlayPatternMetadata[] = seededUserPatterns.map(
  ({ grid, ...metadata }) => ({ ...metadata, hash: encodeGridToBase64(grid) }),
);
export const knownPatternMetadataByHash: Record<string, PlayPatternMetadata> = (() => {
  const map: Record<string, PlayPatternMetadata> = {};

  for (const pattern of patterns) {
    const hash = encodeGridToBase64(pattern.grid);
    map[hash] = {
      hash,
      name: pattern.name,
      category: pattern.category,
      source: 'system',
      favoriteCount: Math.max(4, Math.floor(Object.keys(pattern.grid).length / 2) + 6),
      forkCount: Math.max(2, Math.floor(Object.keys(pattern.grid).length / 3) + 3),
      tags: pattern.tags,
      description: pattern.description,
      referenceUrl: pattern.referenceUrl,
    };
  }

  for (const pattern of seededUserPatternMetadata) {
    map[pattern.hash] = {
      hash: pattern.hash,
      name: pattern.name,
      category: pattern.category,
      source: pattern.source,
      creatorName: pattern.creatorName,
      favoriteCount: pattern.favoriteCount,
      forkCount: pattern.forkCount,
    };
  }

  return map;
})();
