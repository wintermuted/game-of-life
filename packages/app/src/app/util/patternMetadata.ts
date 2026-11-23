export function getDescriptiveTags(tags: string[], metadataValues: string[]): string[] {
  const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');
  const excludedValues = new Set(metadataValues.map(normalize).filter(Boolean));
  const seenTags = new Set<string>();

  return tags.filter((tag) => {
    const normalizedTag = normalize(tag.trim());
    if (!normalizedTag || excludedValues.has(normalizedTag) || seenTags.has(normalizedTag)) {
      return false;
    }

    seenTags.add(normalizedTag);
    return true;
  });
}
