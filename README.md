# Stratum

**Editor de imágenes open source que corre 100% en tu navegador.**
Capas, máscaras, ajustes no destructivos y retoque con el flujo que ya conoces de Photoshop,
más **IA local**: quitar fondos, rellenar y seleccionar objetos **sin que tus imágenes salgan de tu equipo**.

> Inspirado en [Compositor](https://github.com/robbietilton/Compositor) (app nativa para macOS), llevado a la web:
> sin instalación, en Windows, Linux, macOS o ChromeOS.

## ¿Por qué Stratum?
- **Familiar:** atajos y lógica de capas estilo Photoshop.
- **Rápido:** render en GPU con WebGPU, 60 fps en zoom, pan y pincel.
- **Privado:** sin servidor, sin cuenta, sin anuncios, funciona offline (PWA).
- **Calidad:** composición en color lineal de alta precisión, sin banding.
- **Libre:** licencia MIT. Modifícalo a tu gusto.

## Estado
🚧 En desarrollo — Sprint 0. Ver [roadmap](process/tasks.md).

## Desarrollo local
```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # tests
pnpm bench      # benchmarks
pnpm build && pnpm preview
```
Requisitos: Node 22+, pnpm 9+, navegador con WebGPU (Chrome/Edge recomendados).

## Para colaboradores y agentes IA
Lee [AGENTS.md](AGENTS.md) y [memory.md](memory.md). El contexto técnico está en [process/](process/).

## Licencia
MIT © 2026 Milton Salcedo
