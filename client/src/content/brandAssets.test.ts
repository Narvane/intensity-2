import { describe, expect, it } from 'vitest';
import {
  getBrandIconUrl,
  getBrandWordmarkUrl,
  hasBrandIconAsset,
  hasBrandWordmarkAsset,
} from '@content/brandAssets';

describe('brandAssets', () => {
  it('resolves bundled brand assets when present in the repository', () => {
    expect(hasBrandIconAsset()).toBe(true);
    expect(hasBrandWordmarkAsset()).toBe(true);
    expect(getBrandIconUrl()).toMatch(/logo-icon/);
    expect(getBrandWordmarkUrl()).toMatch(/logo-wordmark/);
  });
});
