import { getDescriptiveTags } from './patternMetadata';

describe('getDescriptiveTags', () => {
  test('removes metadata and normalized duplicates while preserving display text and order', () => {
    expect(
      getDescriptiveTags(
        ['Still Lifes', 'Color Study', 'color-study', ' ', 'Oscillator', 'Public'],
        ['still-lifes', 'public'],
      ),
    ).toStrictEqual(['Color Study', 'Oscillator']);
  });

  test('does not mutate tags or apply a page-specific display limit', () => {
    const tags = ['one', 'two', 'three', 'four'];
    expect(getDescriptiveTags(tags, [])).toStrictEqual(tags);
    expect(tags).toStrictEqual(['one', 'two', 'three', 'four']);
  });
});
