/**
 * El Core no lanza excepciones para errores esperados: los devuelve.
 * Asi la UI decide como mostrarlos (ux-principles §5) sin try/catch disperso.
 */
export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | {
      readonly ok: false;
      readonly error: E;
    };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } => result.ok;
