import { test, expect } from '@playwright/test';

test.describe('Game of Life - Navigation', () => {
  test('should navigate to About page', async ({ page }) => {
    await page.goto('/');
    
    // Look for About button using aria-label
    const aboutButton = page.getByRole('button', { name: /about/i });
    await expect(aboutButton).toBeVisible();
    
    await aboutButton.click();
    
    // Verify we're on the about page
    await expect(page).toHaveURL(/.*about/);
    
    // Check for content on the About page
    await expect(page.getByText(/rules|Conway/i)).toBeVisible();
  });

  test('should navigate back to Home from About page', async ({ page }) => {
    await page.goto('/about');
    
    // Look for Home button using aria-label
    const homeButton = page.getByRole('button', { name: /home/i });
    await expect(homeButton).toBeVisible();
    
    await homeButton.click();
    
    // Verify we're back on the home page
    await expect(page).toHaveURL(/^[^#]*\/?$/); // Root path
    
    // Check that the canvas is visible (home page indicator)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should display GitHub link', async ({ page }) => {
    await page.goto('/');
    
    // Look for GitHub button using aria-label
    const githubButton = page.getByRole('link', { name: /github/i });
    await expect(githubButton).toBeVisible();
    
    // Verify it has the correct href
    const href = await githubButton.getAttribute('href');
    expect(href).toContain('github.com/wintermuted/game-of-life');
  });
});
