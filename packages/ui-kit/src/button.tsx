import type { ComponentPropsWithRef } from 'react';
import { cx } from './cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Clases compartidas por Button e IconButton: foco por teclado, deshabilitado y transicion. */
export const controlBase = cx(
  'inline-flex shrink-0 select-none items-center justify-center gap-1.5 rounded-button font-medium',
  'transition-colors duration-(--duration-micro) ease-enter',
  // Tailwind v4: outline-none fija --tw-outline-style:none y anula outline-2; se declara solid explicito.
  'focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-accent focus-visible:outline-offset-1',
  'disabled:pointer-events-none disabled:opacity-40',
);

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent-fill text-on-accent hover:bg-accent-fill-hover active:bg-accent-fill-hover',
  secondary: 'border border-line-strong bg-elevated text-fg hover:bg-hover active:bg-active',
  ghost: 'text-fg-secondary hover:bg-hover hover:text-fg active:bg-active',
  danger: 'border border-line-strong bg-elevated text-danger hover:bg-hover active:bg-active',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-6 px-2 text-ui',
  md: 'h-7 px-3 text-ui',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(controlBase, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
