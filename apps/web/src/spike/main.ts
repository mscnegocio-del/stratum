import {
  createGpuContext,
  type FrameStats,
  FrameTimer,
  fitToViewport,
  panBy,
  type Size,
  TextureQuadRenderer,
  type Viewport,
  zoomAt,
} from '@stratum/engine';
import { createTestImage } from './test-image';
import './spike.css';

const SWEEP_FRAMES = 600;
/** El primer frame paga la subida de la textura 4K y la creacion del pipeline
 *  (~1 s medido en SwiftShader). Sin descartarlo, p95 y max no dicen nada. */
const WARMUP_FRAMES = 30;
const FRAME_BUDGET_MS = 16;
const FRAME_HARD_LIMIT_MS = 33;
const MAIN_THREAD_BUDGET_MS = 8;

const root = document.querySelector('#spike');
if (!root) {
  throw new Error('No se encontro #spike');
}

function fail(message: string): never {
  root?.replaceChildren(
    Object.assign(document.createElement('p'), { className: 'spike-error', textContent: message }),
  );
  throw new Error(message);
}

const canvas = document.createElement('canvas');
canvas.className = 'spike-canvas';
const hud = document.createElement('pre');
hud.className = 'spike-hud';
const runButton = document.createElement('button');
runButton.className = 'spike-button';
runButton.textContent = `Medir sweep (${SWEEP_FRAMES} frames)`;
root.replaceChildren(canvas, hud, runButton);

const gpu = await createGpuContext(canvas);
if (!gpu.ok) {
  fail(`${gpu.error} El spike de S0-08 necesita WebGPU; prueba en Chrome o Edge actualizados.`);
}

const image = await createTestImage();
const renderer = TextureQuadRenderer.create(gpu.value, image);
const imageSize: Size = { width: image.width, height: image.height };

let canvasSize: Size = { width: 1, height: 1 };
let viewport: Viewport = { x: 0, y: 0, scale: 1 };
const timer = new FrameTimer();

function resize(): void {
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  canvas.width = width;
  canvas.height = height;
  canvasSize = { width, height };
}

function resetViewport(): void {
  viewport = fitToViewport(imageSize, canvasSize, 16 * (window.devicePixelRatio || 1));
}

resize();
resetViewport();
new ResizeObserver(() => {
  resize();
  resetViewport();
}).observe(canvas);

const toDevicePx = (event: PointerEvent | WheelEvent) => {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * dpr, y: (event.clientY - rect.top) * dpr };
};

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  viewport = zoomAt(viewport, toDevicePx(event), Math.exp(-event.deltaY * 0.0015));
});

let dragging = false;
canvas.addEventListener('pointerdown', (event) => {
  dragging = true;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointerup', () => {
  dragging = false;
});
canvas.addEventListener('pointermove', (event) => {
  if (!dragging) {
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  viewport = panBy(viewport, event.movementX * dpr, event.movementY * dpr);
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'f') {
    resetViewport();
  }
});

/** Recorrido determinista: pan a fit, zoom hasta 400% y pan al 100%. */
function applySweepFrame(frame: number): void {
  const progress = frame / SWEEP_FRAMES;
  const wave = Math.sin(progress * Math.PI * 6);
  if (progress < 0.34) {
    resetViewport();
    viewport = panBy(viewport, wave * canvasSize.width * 0.3, 0);
    return;
  }
  resetViewport();
  const zoom = progress < 0.67 ? 1 + (progress - 0.34) * 12 : 8;
  viewport = zoomAt(viewport, { x: canvasSize.width / 2, y: canvasSize.height / 2 }, zoom);
  if (progress >= 0.67) {
    viewport = panBy(viewport, wave * canvasSize.width * 0.5, wave * canvasSize.height * 0.25);
  }
}

let sweepFrame: number | null = null;
let onSweepDone: (() => void) | null = null;
let lastSweep: FrameStats | null = null;

function frameLoop(now: number): void {
  const startedAt = performance.now();
  timer.beginFrame(now);

  if (sweepFrame !== null) {
    applySweepFrame(sweepFrame);
    sweepFrame += 1;
    if (sweepFrame === WARMUP_FRAMES) {
      timer.reset();
    }
    if (sweepFrame > SWEEP_FRAMES) {
      sweepFrame = null;
      lastSweep = timer.stats();
      onSweepDone?.();
      onSweepDone = null;
    }
  }

  renderer.render(viewport, canvasSize);
  timer.endFrame(startedAt, performance.now());
  updateHud();
  requestAnimationFrame(frameLoop);
}

function verdict(stats: FrameStats): string {
  if (stats.frameMs.p95 <= FRAME_BUDGET_MS + 1 && stats.mainThreadMs.p95 <= MAIN_THREAD_BUDGET_MS) {
    return 'OK — dentro del presupuesto de 16 ms / 8 ms';
  }
  if (stats.frameMs.p95 <= FRAME_HARD_LIMIT_MS) {
    return 'JUSTO — pasa el limite duro de 33 ms pero no el objetivo de 16 ms';
  }
  return 'FUERA DE PRESUPUESTO — revisar antes de confirmar ADR-001';
}

function updateHud(): void {
  const stats = timer.stats();
  const info = gpu.ok ? gpu.value.adapterInfo : null;
  hud.textContent = [
    `adaptador   ${info?.vendor || 'desconocido'} ${info?.architecture ?? ''}`.trim(),
    `imagen      ${imageSize.width}x${imageSize.height}`,
    `canvas      ${canvasSize.width}x${canvasSize.height} @${window.devicePixelRatio || 1}x`,
    `zoom        ${(viewport.scale * 100).toFixed(1)}%`,
    `frames      ${stats.frames}`,
    `fps (p50)   ${stats.fps.toFixed(1)}`,
    `frame ms    p50 ${stats.frameMs.p50.toFixed(2)} · p95 ${stats.frameMs.p95.toFixed(2)} · max ${stats.frameMs.max.toFixed(2)}`,
    `main ms     p50 ${stats.mainThreadMs.p50.toFixed(2)} · p95 ${stats.mainThreadMs.p95.toFixed(2)} · max ${stats.mainThreadMs.max.toFixed(2)}`,
    '',
    sweepFrame !== null
      ? `midiendo... ${sweepFrame}/${SWEEP_FRAMES}`
      : lastSweep
        ? `ultimo sweep: ${verdict(lastSweep)}`
        : 'sin medir todavia — pulsa el boton para el sweep',
    '',
    'rueda = zoom · arrastrar = pan · F = ajustar',
  ].join('\n');
}

function runSweep(): Promise<FrameStats> {
  timer.reset();
  sweepFrame = 0;
  return new Promise((resolve) => {
    onSweepDone = () => resolve(lastSweep ?? timer.stats());
  });
}

runButton.addEventListener('click', () => {
  runButton.disabled = true;
  void runSweep().then((stats) => {
    runButton.disabled = false;
    console.table(stats);
  });
});

// Punto de entrada para automatizar la medicion desde Playwright o la consola.
Object.defineProperty(window, 'runSpikeSweep', { value: runSweep });

requestAnimationFrame(frameLoop);
