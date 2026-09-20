export interface FrameStats {
  readonly frames: number;
  readonly fps: number;
  /** Tiempo entre frames presentados: contra el presupuesto de 16 ms (performance.md). */
  readonly frameMs: Percentiles;
  /** Trabajo JS del frame: contra el presupuesto de 8 ms de hilo principal. */
  readonly mainThreadMs: Percentiles;
}

export interface Percentiles {
  readonly p50: number;
  readonly p95: number;
  readonly max: number;
}

function percentiles(samples: readonly number[]): Percentiles {
  if (samples.length === 0) {
    return { p50: 0, p95: 0, max: 0 };
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const at = (p: number): number => {
    const index = Math.min(
      sorted.length - 1,
      Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
    );
    return sorted[index] ?? 0;
  };
  return { p50: at(50), p95: at(95), max: at(100) };
}

/** Acumula tiempos de frame y de hilo principal para reportarlos al terminar un sweep. */
export class FrameTimer {
  private readonly frameSamples: number[] = [];
  private readonly mainThreadSamples: number[] = [];
  private lastFrameAt: number | null = null;

  beginFrame(now: number): void {
    if (this.lastFrameAt !== null) {
      this.frameSamples.push(now - this.lastFrameAt);
    }
    this.lastFrameAt = now;
  }

  endFrame(startedAt: number, now: number): void {
    this.mainThreadSamples.push(now - startedAt);
  }

  reset(): void {
    this.frameSamples.length = 0;
    this.mainThreadSamples.length = 0;
    this.lastFrameAt = null;
  }

  stats(): FrameStats {
    const frameMs = percentiles(this.frameSamples);
    return {
      frames: this.frameSamples.length,
      fps: frameMs.p50 > 0 ? 1000 / frameMs.p50 : 0,
      frameMs,
      mainThreadMs: percentiles(this.mainThreadSamples),
    };
  }
}
