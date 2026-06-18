import { useEffect, useRef, useState } from 'react';
import type { BoxType } from '@domain/box/boxTypes';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { getBoxVisual } from './boxVisuals';
import styles from './BoxCard.module.css';

interface BoxCardProps {
  name: string;
  type: BoxType;
  typeLabel: string;
  typeHint: string;
  experienceCount?: number;
  openLabel?: string;
  deleteLabel?: string;
  menuLabel?: string;
  onOpen?: () => void;
  onDelete?: () => void;
}

export function BoxCard({
  name,
  type,
  typeLabel,
  typeHint,
  experienceCount,
  openLabel = 'Open',
  deleteLabel = 'Delete',
  menuLabel = 'Box actions',
  onOpen,
  onDelete,
}: BoxCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { family, Icon } = getBoxVisual(type);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  const handleOpen = () => {
    setMenuOpen(false);
    onOpen?.();
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete?.();
  };

  return (
    <article className={styles.card} data-type={type} data-family={family}>
      <button type="button" className={styles.open} onClick={handleOpen}>
        <span className={styles.iconWrap} aria-hidden="true">
          <Icon />
        </span>
        <strong className={styles.name}>{name}</strong>
        <span className={styles.type}>{typeLabel}</span>
        <span className={styles.hint}>{typeHint}</span>
        {experienceCount !== undefined && (
          <span className={styles.count}>
            {experienceCount} ideias <ChevronRight aria-hidden="true" />
          </span>
        )}
      </button>

      {onDelete && (
        <div className={styles.menuWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={menuLabel}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <MoreHorizontal aria-hidden="true" />
          </button>

          {menuOpen && (
            <div className={styles.menu} role="menu">
              <button type="button" role="menuitem" className={styles.menuItem} onClick={handleOpen}>
                {openLabel}
              </button>
              <button
                type="button"
                role="menuitem"
                className={styles.menuItemDanger}
                onClick={handleDelete}
              >
                {deleteLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
