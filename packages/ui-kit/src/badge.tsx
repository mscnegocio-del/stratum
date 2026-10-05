import type { ComponentPropsWithRef } from 'react';
import { cx } from './cx';

export type BadgeTone = 'neutral' | 'ai' | 'success' | 'warning' | 'danger';

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  tone?: BadgeTone;
}

// El tono "ai" es la identidad visual del pilar #4: solo para funciones de IA local.
const tones: Record<BadgeTone, string> = {
  neutral: 'text-fg-secondary',
  ai: 'text-ai',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex h-4.5 items-center gap-1 rounded-input border border-line-strong px-1.5',
        'font-medium text-micro',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
