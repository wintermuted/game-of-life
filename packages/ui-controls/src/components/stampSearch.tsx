import type { LifeGrid } from '@game-of-life/core';

export function formatPatternTitle(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getGridSignature(grid: LifeGrid): string {
  return Object.keys(grid)
    .sort((left, right) => {
      const [leftX = 0, leftY = 0] = left.split(',').map(Number);
      const [rightX = 0, rightY = 0] = right.split(',').map(Number);
      if (leftX === rightX) return leftY - rightY;
      return leftX - rightX;
    })
    .map((key) => `${key}:${grid[key] ?? ''}`)
    .join('|');
}

export function highlightSearchMatch(text: string, stampSearchQuery: string): React.ReactNode {
  const query = stampSearchQuery.trim();
  if (!query) {
    return text;
  }

  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let searchFrom = 0;

  while (searchFrom < text.length) {
    const matchIndex = normalizedText.indexOf(normalizedQuery, searchFrom);
    if (matchIndex === -1) {
      parts.push(text.slice(searchFrom));
      break;
    }

    if (matchIndex > searchFrom) {
      parts.push(text.slice(searchFrom, matchIndex));
    }

    const matchEnd = matchIndex + query.length;
    parts.push(
      <mark className="grid-controls-stamp-hit" key={`${text}-${matchIndex}-${matchEnd}`}>
        {text.slice(matchIndex, matchEnd)}
      </mark>,
    );
    searchFrom = matchEnd;
  }

  return parts;
}
