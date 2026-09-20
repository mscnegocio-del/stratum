# Principios de UX — Stratum (pilar #1)

> Meta: que alguien que viene de Photoshop se sienta en casa en 30 segundos,
> y que alguien nuevo logre su primera edición sin leer nada.

## 1. Los 10 principios
1. **El canvas es el protagonista.** La interfaz ocupa lo mínimo; la imagen, lo máximo.
2. **Familiar primero, innovador después.** Atajos, nombres y lógica de capas de Photoshop.
   Innovar solo donde Photoshop es torpe (búsqueda de acciones, HUD en canvas, IA).
3. **Fluidez percibida > velocidad real.** Zoom, pan y pincel a 60 fps SIEMPRE. Lo lento se hace
   en segundo plano con progreso visible y cancelable.
4. **Todo es reversible.** Undo ilimitado razonable, ajustes no destructivos, autoguardado.
   El usuario nunca debe temer perder trabajo.
5. **Preview en vivo de todo.** Ningún ajuste se aplica "a ciegas". Antes/después con `\`.
6. **Contexto, no menús.** La acción aparece donde está la atención (barra contextual, HUD).
7. **Un atajo para cada acción frecuente; búsqueda para todo lo demás** (Ctrl+K).
8. **Feedback inmediato y honesto.** Cada acción tiene respuesta visual < 100 ms.
   Errores explicados en lenguaje humano con salida clara.
9. **Privacidad visible.** Comunicar que nada sale del navegador (badge "Local" en IA).
10. **Accesible por defecto.** Teclado completo, foco visible, contraste AA, respeta reduced-motion.

## 2. Patrones de interacción obligatorios
- **Command Palette (Ctrl/Cmd+K):** busca herramientas, filtros, ajustes, comandos, capas y ajustes
  recientes. Fuzzy search, muestra el atajo al lado. Acción recientes arriba.
- **Barra contextual flotante:** aparece junto a la selección o capa transformada con las 3–5 acciones
  más probables (p. ej. selección activa → Rellenar con IA, Máscara, Invertir, Recortar).
- **HUD en canvas:**
  - Alt+Clic derecho arrastre (o Ctrl+Alt+arrastre): tamaño horizontal / dureza vertical del pincel.
  - Durante transformación: ancho, alto, ángulo junto al cursor.
  - Zoom actual flotante al hacer zoom, se desvanece a 1 s.
- **Scrubby sliders:** arrastrar sobre la etiqueta de cualquier campo numérico cambia el valor
  (Shift = ×10, Alt = ×0.1). Doble clic = reset al valor por defecto.
- **Inputs numéricos con matemática:** `120*2`, `+15`, `50%`.
- **Drag & drop universal:** soltar imagen en canvas = nueva capa; en pantalla inicio = nuevo documento;
  arrastrar capas entre pestañas; pegar (Ctrl+V) desde portapapeles.
- **Modo foco:** Tab oculta paneles; F cicla fondos del área de trabajo.
- **Paneles:** colapsables, redimensionables, recuerdan su estado. Layout por defecto opinado y bueno.
- **Deshacer visible:** toast breve tras acciones destructivas ("Capa eliminada · Deshacer").

## 3. Estados que TODO componente/flujo debe diseñar
Vacío · Cargando · Éxito · Error · Deshabilitado · Hover · Activo · Foco (teclado) · Arrastrando.

## 4. Onboarding sin tutorial
- Pantalla de inicio: soltar imagen / nuevo documento con presets / recientes (miniaturas desde OPFS).
- Tooltips ricos con nombre + atajo + mini descripción (delay 500 ms, instantáneo al moverse entre ellos).
- Primera vez que se usa una herramienta: pista contextual discreta de 1 línea, descartable para siempre.
- Nada de modales de bienvenida que bloqueen.

## 5. Microcopy
- Español e inglés desde el inicio (i18n). Tono: claro, breve, sin jerga innecesaria.
- Verbos en botones ("Aplicar", "Quitar fondo"), nunca "OK/Aceptar" genérico.
- Errores: qué pasó + por qué + qué hacer. Ej.: "Esta imagen es muy grande para la memoria disponible.
  Prueba reducirla al 50% o cerrar otras pestañas."

## 6. Rendimiento como UX (umbrales)
| Interacción | Máximo |
|---|---|
| Respuesta visual a input | 16 ms (1 frame) |
| Abrir menú/panel | 100 ms |
| Preview de ajuste | 1 frame en GPU; si no, preview progresivo en < 100 ms |
| Abrir imagen 24 MP | < 1.5 s hasta ver algo (mostrar baja resolución primero) |
| Tarea larga (IA, filtros pesados) | Progreso + cancelar a partir de 500 ms |

## 7. Validación
- Cada sprint: 1 prueba de usabilidad rápida (3 personas, 3 tareas, cronometradas). Registrar hallazgos en tasks.md.
- Tareas de referencia: (a) quitar fondo y poner otro, (b) recortar y ajustar niveles, (c) retocar una mancha.
- Métrica: tiempo por tarea y número de "¿dónde está…?". Comparar contra Photopea.
