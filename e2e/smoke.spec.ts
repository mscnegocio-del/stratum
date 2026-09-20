import { expect, test } from '@playwright/test';

test('la app carga y monta el shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Stratum' })).toBeVisible();
});
