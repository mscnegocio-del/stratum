# Riesgos — Stratum
| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Scope creep (agregar funciones fuera de fase) | Alta | Alto | scope.md firme; no pasar de fase sin cerrar hito |
| R2 | Abandono a mitad del proyecto | Media | Alto | Publicar v0.1 temprano; sprints cortos con demo; hitos visibles |
| R3 | Curva WebGPU/WGSL | Media | Alto | Spikes en Sprint 0; estudiar Graphite; empezar simple |
| R4 | Soporte desigual de WebGPU entre navegadores | Media | Medio | Verificar en S0-01; fallback WebGL2; aviso honesto |
| R5 | Límite de memoria de la pestaña | Media | Alto | Tiles, LRU, OPFS, presupuesto de undo, overlay de memoria |
| R6 | Licencias de modelos IA incompatibles | Media | Alto | ADR obligatorio por modelo; evitar no comerciales |
| R7 | Tamaño de modelos IA (descarga lenta) | Alta | Medio | Bajo demanda, caché OPFS, variantes ligeras, progreso |
| R8 | Calidad de healing/content-aware inferior a lo esperado | Media | Medio | IA (LaMa/MI-GAN) + PatchMatch como fallback; expectativas claras |
| R9 | Deuda técnica por código generado con IA | Alta | Medio | Revisión línea a línea en core/engine; tests de invariantes |
| R10 | Atajos bloqueados por el navegador | Alta | Bajo | Modo PWA, alternativas, atajos reasignables |
| R11 | El diferenciador de IA local lo absorbe el navegador antes del release | Media | Alto | Priorizar en v0.1 una base de edición excelente; la IA llega después. El valor central es la UX de edición, no la IA |
| R12 | Modelos de IA obsoletos al llegar al sprint que los usa | Alta | Bajo | No decidir el modelo por adelantado; re-verificar candidatos al inicio del sprint (ver ai-local.md) |
