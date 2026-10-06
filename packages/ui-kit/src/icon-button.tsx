import type { ComponentPropsWithRef } from 'react';
import { controlBase } from './button';
import { cx } from './cx';

export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-label'> {
  /** Nombre accesible obligatorio: un boton de solo icono no se anuncia sin el. */
  label: string;
  /** Si se pasa, el boton es un toggle (aria-pressed). Herramienta activa = pressed. */
  pressed?: boolean;
  size?: 'sm' | 'md';
}

const sizes = {
  sm: 'size-6',
  md: 'size-7',
} as const;

export function IconButton({
  label,
  pressed,
  size = 'md',
  type = 'button',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={cx(
        controlBase,
        sizes[size],
        // design-system.md §6: herramienta activa = fondo --bg-active + icono --accent.
        pressed
          ? 'bg-active text-accent'
          : 'text-fg-secondary hover:bg-hover hover:text-fg active:bg-active',
        className,
      )}
      {...props}
    />
  );
}
