/**
 * Genera la imagen 4K del spike por codigo: evita meter un binario con licencia
 * al repo y da un patron con detalle fino, que es donde se nota el aliasing al
 * alejar el zoom.
 */
export async function createTestImage(width = 3840, height = 2160): Promise<ImageBitmap> {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('OffscreenCanvas no devolvio un contexto 2d');
  }

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#1f3a5f');
  background.addColorStop(0.5, '#8d4e85');
  background.addColorStop(1, '#f2a65a');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  for (let i = 0; i < 140; i += 1) {
    const radius = 20 + ((i * 37) % 260);
    ctx.beginPath();
    ctx.arc((i * 271) % width, (i * 523) % height, radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${(i * 17) % 360}, 70%, 60%, 0.45)`;
    ctx.fill();
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 180px system-ui, sans-serif';
  ctx.fillText(`${width}x${height}`, 120, height - 140);

  return createImageBitmap(canvas);
}
