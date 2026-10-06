/** Une clases condicionales sin traer una dependencia (clsx) por cuatro lineas. */
export function cx(...classes: ReadonlyArray<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
