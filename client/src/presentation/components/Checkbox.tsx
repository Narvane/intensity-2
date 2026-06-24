import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import styles from './Checkbox.module.css';

export type CheckboxAccent = 'coral' | 'purple';
export type CheckboxSize = 'md' | 'sm';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  accent?: CheckboxAccent;
  size?: CheckboxSize;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { accent = 'coral', size = 'md', className, ...props },
  ref,
) {
  return (
    <span
      className={[styles.root, styles[size], styles[accent], className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      <input ref={ref} type="checkbox" className={styles.input} {...props} />
      <span className={styles.control} aria-hidden="true">
        <Check className={styles.check} strokeWidth={3} />
      </span>
    </span>
  );
});
