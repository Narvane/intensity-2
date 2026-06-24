import { Gift } from 'lucide-react';
import { getBrandIconUrl, getBrandWordmarkUrl } from '../../content/brandAssets';
import styles from './BrandMark.module.css';

export type BrandMarkVariant = 'icon' | 'wordmark';
export type BrandMarkSize = 'md' | 'lg' | 'auth';

export interface BrandMarkProps {
  /** Square app icon or horizontal wordmark. */
  variant?: BrandMarkVariant;
  /** `auth` applies responsive wordmark sizing for the authentication header. */
  size?: BrandMarkSize;
  /** Accessible name for wordmark images (e.g. product name). */
  accessibleName?: string;
}

function resolveSizeClasses(variant: BrandMarkVariant, size: BrandMarkSize): string {
  if (variant === 'wordmark') {
    if (size === 'auth') {
      return styles.wordmarkAuth;
    }
    if (size === 'lg') {
      return styles.wordmarkLg;
    }
    return styles.wordmarkMd;
  }

  if (size === 'lg') {
    return styles.iconLg;
  }

  return styles.iconMd;
}

function resolvePlaceholderClasses(variant: BrandMarkVariant, size: BrandMarkSize): string {
  if (variant === 'wordmark') {
    const sizeClass =
      size === 'auth'
        ? styles.placeholderWordmarkAuth
        : size === 'lg'
          ? styles.placeholderWordmarkLg
          : styles.placeholderWordmarkMd;
    return `${styles.placeholderWordmark} ${sizeClass}`;
  }

  const sizeClass = size === 'lg' ? styles.placeholderIconLg : styles.placeholderIconMd;
  return `${styles.placeholderIcon} ${sizeClass}`;
}

export function BrandMark({
  variant = 'icon',
  size = 'md',
  accessibleName = 'Intensity',
}: BrandMarkProps) {
  const assetUrl = variant === 'wordmark' ? getBrandWordmarkUrl() : getBrandIconUrl();
  const sizeClass = resolveSizeClasses(variant, size);

  if (assetUrl) {
    return (
      <img
        src={assetUrl}
        alt={variant === 'wordmark' ? accessibleName : ''}
        className={`${styles.image} ${sizeClass}`}
        decoding="async"
      />
    );
  }

  if (variant === 'wordmark') {
    return (
      <div
        className={resolvePlaceholderClasses(variant, size)}
        role="img"
        aria-label={accessibleName}
      >
        <span className={styles.placeholderWordmarkText}>{accessibleName}</span>
      </div>
    );
  }

  return (
    <div className={resolvePlaceholderClasses(variant, size)} aria-hidden="true">
      <Gift />
    </div>
  );
}
