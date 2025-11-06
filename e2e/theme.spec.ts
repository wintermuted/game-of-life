import { test, expect } from '@playwright/test';

test.describe('Game of Life - Theme Toggle', () => {
  test('should toggle between light and dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Look for the theme toggle button using aria-label
    const themeToggle = page.getByRole('button', { name: /toggle dark mode/i });
    
    await expect(themeToggle).toBeVisible();
    
    // Get the current theme (by checking body or html background)
    const initialBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // Click the theme toggle
    await themeToggle.click();
    
    // Wait for the background color to change
    await page.waitForFunction(
      (expectedColor) => window.getComputedStyle(document.body).backgroundColor !== expectedColor,
      initialBgColor,
      { timeout: 2000 }
    );
    
    // Get the new theme
    const newBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // The background color should have changed
    expect(initialBgColor).not.toBe(newBgColor);
    
    // Toggle back
    await themeToggle.click();
    
    // Wait for the background color to change back
    await page.waitForFunction(
      (expectedColor) => window.getComputedStyle(document.body).backgroundColor !== expectedColor,
      newBgColor,
      { timeout: 2000 }
    );
    
    // Should return to original color
    const finalBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    expect(finalBgColor).toBe(initialBgColor);
  });
});
