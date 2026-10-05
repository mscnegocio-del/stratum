import { TILE_SIZE } from '@stratum/core';

/**
 * Placeholder del shell. El layout real (TitleBar, Toolbar, paneles, StatusBar)
 * llega en S1-06, despues del diseno en S0-10.
 */
export function App() {
  const hasWebGpu = 'gpu' in navigator;

  return (
    <main className="grid min-h-dvh place-items-center bg-app px-4 text-fg">
      <div className="space-y-2 text-center">
        <h1 className="font-semibold text-display tracking-tight">Stratum</h1>
        <p className="text-dialog text-fg-secondary">
          Editor raster por capas, en el navegador, con IA local.
        </p>
        <p className="text-fg-muted">
          Tiles de {TILE_SIZE} px · WebGPU {hasWebGpu ? 'disponible' : 'no disponible'}
        </p>
      </div>
    </main>
  );
}
