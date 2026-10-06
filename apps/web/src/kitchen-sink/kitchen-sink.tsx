import { Badge, Button, IconButton, Kbd } from '@stratum/ui-kit';
import { type ReactNode, useEffect, useState } from 'react';

/**
 * Kitchen Sink (S0-11): referencia viva de tokens y componentes del ui-kit en ambos temas.
 * design-system.md §1. Cada componente nuevo del ui-kit se agrega aqui con todos sus estados.
 */

type Theme = 'dark' | 'light';
const THEME_KEY = 'stratum.kitchen-sink.theme';

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

const surfaces = ['bg-app', 'bg-canvas', 'bg-panel', 'bg-elevated', 'bg-hover', 'bg-active'];
const borders = ['border-subtle', 'border-strong'];
const texts = ['text-primary', 'text-secondary', 'text-muted'];
const signals = ['accent', 'accent-hover', 'accent-fill', 'success', 'warning', 'danger', 'ai'];

const typeScale = [
  ['text-micro', '11 · micro', 'text-micro'],
  ['text-ui', '12 · base UI', 'text-ui'],
  ['text-title', '13 · titulo de panel', 'text-title'],
  ['text-dialog', '15 · dialogo', 'text-dialog'],
  ['text-display', '20 · pantalla de inicio', 'text-display'],
] as const;

const radii = [
  ['rounded-input', 'input · 4'],
  ['rounded-button', 'boton · 6'],
  ['rounded-panel', 'panel · 8'],
  ['rounded-dialog', 'dialogo · 12'],
] as const;

const spacing = [2, 4, 6, 8, 12, 16, 24, 32];

export function KitchenSink() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);
  const [activeTool, setActiveTool] = useState('move');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Sin almacenamiento (modo privado): el tema simplemente no se recuerda.
    }
  }, [theme]);

  return (
    <div className="min-h-dvh bg-app text-fg">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-line-subtle border-b bg-panel px-4 py-2">
        <h1 className="font-semibold text-title">Stratum · Kitchen Sink</h1>
        <Badge>S0-11</Badge>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-fg-muted">Tema</span>
          <Button
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          >
            {theme === 'dark' ? 'Oscuro' : 'Claro'}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
        <Section title="Color · superficies">
          <SwatchGrid tokens={surfaces} />
        </Section>
        <Section title="Color · bordes, texto y señales">
          <SwatchGrid tokens={[...borders, ...texts, ...signals]} />
        </Section>

        <Section title="Tipografia">
          <div className="space-y-2">
            {typeScale.map(([token, label, cls]) => (
              <div key={token} className="flex items-baseline gap-4">
                <code className="w-28 shrink-0 font-mono text-fg-muted text-micro">{token}</code>
                <span className={cls}>{label} — Ajustar niveles de la capa</span>
              </div>
            ))}
            <div className="flex items-baseline gap-4">
              <code className="w-28 shrink-0 font-mono text-fg-muted text-micro">font-mono</code>
              <span className="font-mono tabular-nums">#5F8FFF · 3840 × 2160 · 363.8%</span>
            </div>
          </div>
        </Section>

        <Section title="Espaciado (base 4 px) y radios">
          <div className="flex flex-wrap items-end gap-3">
            {spacing.map((px) => (
              <div key={px} className="flex flex-col items-center gap-1">
                <div className="bg-accent" style={{ width: px, height: px }} />
                <span className="font-mono text-fg-muted text-micro">{px}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {radii.map(([cls, label]) => (
              <div
                key={cls}
                className={`flex h-14 w-28 items-center justify-center border border-line-strong bg-elevated text-fg-secondary text-micro ${cls}`}
              >
                {label}
              </div>
            ))}
            <div className="flex h-14 w-28 items-center justify-center rounded-panel bg-elevated text-fg-secondary text-micro shadow-float">
              shadow-float
            </div>
          </div>
        </Section>

        <Section title="Button">
          <StateHint />
          <div className="space-y-3">
            {(['primary', 'secondary', 'ghost', 'danger'] as const).map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-2">
                <code className="w-20 font-mono text-fg-muted text-micro">{variant}</code>
                <Button variant={variant}>Aplicar</Button>
                <Button variant={variant} size="sm">
                  Pequeño
                </Button>
                <Button variant={variant} disabled>
                  Deshabilitado
                </Button>
              </div>
            ))}
          </div>
        </Section>

        <Section title="IconButton (toggle de herramienta)">
          <div className="flex items-center gap-1 rounded-panel border border-line-subtle bg-panel p-1">
            {tools.map((tool) => (
              <IconButton
                key={tool.id}
                label={tool.label}
                pressed={activeTool === tool.id}
                onClick={() => setActiveTool(tool.id)}
              >
                {tool.icon}
              </IconButton>
            ))}
            <IconButton label="Deshabilitado" disabled>
              {tools[0]?.icon}
            </IconButton>
          </div>
          <p className="mt-2 text-fg-muted">
            Activa: fondo <code className="font-mono">--bg-active</code> + icono{' '}
            <code className="font-mono">--accent</code> (aria-pressed).
          </p>
        </Section>

        <Section title="Kbd y Badge">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
              <span className="ml-1 text-fg-secondary">Command Palette</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd>V</Kbd>
              <span className="ml-1 text-fg-secondary">Mover</span>
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="ai">✦ Local</Badge>
            <Badge tone="success">Guardado</Badge>
            <Badge tone="warning">Sin GPU</Badge>
            <Badge tone="danger">Error</Badge>
          </div>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-panel border border-line-subtle bg-panel p-4">
      <h2 className="mb-3 font-semibold text-fg-secondary text-title">{title}</h2>
      {children}
    </section>
  );
}

function StateHint() {
  return (
    <p className="mb-3 text-fg-muted">
      Estados en vivo: pasa el cursor (hover), haz clic (active) y navega con <Kbd>Tab</Kbd> (foco).
    </p>
  );
}

function SwatchGrid({ tokens }: { tokens: readonly string[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {tokens.map((token) => (
        <div key={token} className="overflow-hidden rounded-input border border-line-subtle">
          <div className="h-10" style={{ background: `var(--${token})` }} />
          <div className="bg-elevated px-2 py-1 font-mono text-fg-secondary text-micro">
            --{token}
          </div>
        </div>
      ))}
    </div>
  );
}

// Iconos provisionales dibujados a mano (20 px, trazo 1.5) hasta elegir set en S0-10.
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const tools = [
  {
    id: 'move',
    label: 'Mover (V)',
    icon: (
      <Icon>
        <path d="M10 2v16M2 10h16M10 2l-2.5 2.5M10 2l2.5 2.5M10 18l-2.5-2.5M10 18l2.5-2.5M2 10l2.5-2.5M2 10l2.5 2.5M18 10l-2.5-2.5M18 10l-2.5 2.5" />
      </Icon>
    ),
  },
  {
    id: 'marquee',
    label: 'Marco rectangular (M)',
    icon: (
      <Icon>
        <rect x="3.5" y="3.5" width="13" height="13" rx="1" strokeDasharray="2.5 2" />
      </Icon>
    ),
  },
  {
    id: 'brush',
    label: 'Pincel (B)',
    icon: (
      <Icon>
        <path d="M16.5 3.5l-8 8M8.5 11.5c-2 0-3.5 1.5-3.5 3.5 0 .8-.5 1.5-1.5 1.5 1 1 2.5 1 3.5 1 2.2 0 3.5-1.5 3.5-3.5" />
      </Icon>
    ),
  },
  {
    id: 'ai-select',
    label: 'Seleccionar sujeto (IA local)',
    icon: (
      <Icon>
        <path d="M10 3l1.5 3.5L15 8l-3.5 1.5L10 13l-1.5-3.5L5 8l3.5-1.5z" />
        <path d="M15 13l.75 1.75L17.5 15.5l-1.75.75L15 18l-.75-1.75-1.75-.75 1.75-.75z" />
      </Icon>
    ),
  },
];
