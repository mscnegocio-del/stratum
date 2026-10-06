import type { ComponentPropsWithRef } from 'react';
import { cx } from './cx';

/** Tecla o atajo, p. ej. <Kbd>Ctrl</Kbd><Kbd>K</Kbd>. Usado en tooltips y Command Palette. */
export function Kbd({ className, ...props }: ComponentPropsWithRef<'kbd'>) {
  return (
    <kbd
      className={cx(
        'inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-input px-1',
        'border border-line-strong bg-elevated font-mono text-fg-secondary text-micro',
        className,
      )}
      {...props}
    />
  );
}
