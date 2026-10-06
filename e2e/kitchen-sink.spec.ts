import { expect, test } from '@playwright/test';

test.describe('Kitchen Sink del ui-kit', () => {
  test('carga y aplica los tokens del tema oscuro por defecto', async ({ page }) => {
    await page.goto('/dev/ui.html');
    await expect(page.getByRole('heading', { name: 'Stratum · Kitchen Sink' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    // --bg-app oscuro (#17181b); si Tailwind no generara las utilidades, el fondo seria transparente.
    await expect(page.locator('body > #root > div')).toHaveCSS(
      'background-color',
      'rgb(23, 24, 27)',
    );
  });

  test('cambia a tema claro y lo recuerda al recargar', async ({ page }) => {
    await page.goto('/dev/ui.html');
    await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('body > #root > div')).toHaveCSS(
      'background-color',
      'rgb(244, 244, 245)',
    );
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('IconButton expone nombre accesible y estado pressed', async ({ page }) => {
    await page.goto('/dev/ui.html');
    const brush = page.getByRole('button', { name: 'Pincel (B)' });
    await expect(brush).toHaveAttribute('aria-pressed', 'false');
    await brush.click();
    await expect(brush).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Mover (V)' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('el foco por teclado es visible', async ({ page }) => {
    await page.goto('/dev/ui.html');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus-visible');
    await expect(focused).toHaveCSS('outline-style', 'solid');
  });
});
