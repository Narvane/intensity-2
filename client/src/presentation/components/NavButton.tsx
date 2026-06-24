import { forwardRef, type ButtonHTMLAttributes } from 'react';
import {
  ArrowLeft,
  CircleHelp,
  DoorOpen,
  LogOut,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import styles from './NavButton.module.css';

export type NavAction = 'back' | 'close' | 'logout' | 'help' | 'leave';

const ACTION_CONFIG: Record<
  NavAction,
  { Icon: LucideIcon; labelKey: string; ariaKey: string; tone?: 'logout' }
> = {
  back: { Icon: ArrowLeft, labelKey: 'common.back', ariaKey: 'nav.back' },
  close: { Icon: X, labelKey: 'common.close', ariaKey: 'nav.close' },
  logout: {
    Icon: LogOut,
    labelKey: 'session.logout',
    ariaKey: 'nav.logout',
    tone: 'logout',
  },
  help: { Icon: CircleHelp, labelKey: 'auth.helpLabel', ariaKey: 'nav.help' },
  leave: { Icon: DoorOpen, labelKey: 'groups.leave', ariaKey: 'nav.leave' },
};

interface NavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  action: NavAction;
  label?: string;
  iconOnly?: boolean;
  fullWidth?: boolean;
}

export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(function NavButton(
  { action, label, iconOnly = false, fullWidth = false, className, ...props },
  ref,
) {
  const { t } = useI18n();
  const config = ACTION_CONFIG[action];
  const Icon = config.Icon;
  const visibleLabel = label ?? t(config.labelKey);

  return (
    <button
      ref={ref}
      type="button"
      className={[
        styles.button,
        config.tone ? styles[config.tone] : '',
        iconOnly ? styles.iconOnly : '',
        fullWidth ? styles.fullWidth : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={iconOnly ? t(config.ariaKey) : undefined}
      {...props}
    >
      <Icon size={18} strokeWidth={2.25} aria-hidden />
      <span>{visibleLabel}</span>
    </button>
  );
});
