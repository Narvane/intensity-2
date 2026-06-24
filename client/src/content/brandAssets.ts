const iconModules = import.meta.glob<string>('../../../assets/logo-icon.{png,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const wordmarkModules = import.meta.glob<string>('../../../assets/logo-wordmark.{png,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

function pickBrandAssetUrl(modules: Record<string, string>): string | null {
  const entries = Object.entries(modules);
  if (entries.length === 0) {
    return null;
  }

  const svgEntry = entries.find(([path]) => path.endsWith('.svg'));
  if (svgEntry) {
    return svgEntry[1];
  }

  return entries[0]?.[1] ?? null;
}

export function getBrandIconUrl(): string | null {
  return pickBrandAssetUrl(iconModules);
}

export function getBrandWordmarkUrl(): string | null {
  return pickBrandAssetUrl(wordmarkModules);
}

export function hasBrandIconAsset(): boolean {
  return getBrandIconUrl() !== null;
}

export function hasBrandWordmarkAsset(): boolean {
  return getBrandWordmarkUrl() !== null;
}
