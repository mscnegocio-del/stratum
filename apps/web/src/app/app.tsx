import { TILE_SIZE } from '@stratum/core';

/**
 * Placeholder del shell. El layout real (TitleBar, Toolbar, paneles, StatusBar)
 * llega en S1-06, despues del diseno en S0-10.
 */
export function App() {
  const hasWebGpu = 'gpu' in navigator;

  return (
    <main className="grid min-h-dvh place-items-center bg-neutral-900 text-neutral-100">
      <div className="space-y-2 text-center">
        <h1 className="font-semibold text-2xl tracking-tight">Stratum</h1>
        <p className="text-neutral-400 text-sm">
          Editor raster por capas, en el navegador, con IA local.
        </p>
        <p className="text-neutral-500 text-xs">
          Tiles de {TILE_SIZE} px · WebGPU {hasWebGpu ? 'disponible' : 'no disponible'}
        </p>
      </div>
    </main>
  );
}
