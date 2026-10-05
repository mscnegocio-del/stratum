import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../app/styles.css';
import { KitchenSink } from './kitchen-sink';

const container = document.querySelector('#root');
if (!container) {
  throw new Error('No se encontro #root en dev/ui.html');
}

createRoot(container).render(
  <StrictMode>
    <KitchenSink />
  </StrictMode>,
);
