import { test, expect } from '@playwright/test';

test.describe('Game of Life - Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page title is present
    await expect(page.getByText("Conway's Game of Life")).toBeVisible();
  });

  test('should display the grid canvas', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the canvas to be visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should display pattern selector', async ({ page }) => {
    await page.goto('/');
    
    // Check for pattern selector heading
    const patternHeading = page.getByText('Select a Pattern');
    await expect(patternHeading).toBeVisible();
  });

  test('should display grid controls', async ({ page }) => {
    await page.goto('/');
    
    // Check for play/pause button (using aria-label)
    const playButton = page.getByRole('button', { name: /play|pause/i });
    await expect(playButton).toBeVisible();
    
    // Check for step button
    const stepButton = page.getByRole('button', { name: /step|next/i });
    await expect(stepButton).toBeVisible();
    
    // Check for clear button
    const clearButton = page.getByRole('button', { name: /clear|reset/i });
    await expect(clearButton).toBeVisible();
  });

  test('should display diagnostics section', async ({ page }) => {
    await page.goto('/');
    
    // Check for diagnostics heading
    const diagnosticsHeading = page.getByText('Diagnostics');
    await expect(diagnosticsHeading).toBeVisible();
    
    // Check for statistics section
    const statisticsHeading = page.getByText('Statistics');
    await expect(statisticsHeading).toBeVisible();
    
    // Check for generation count
    const generationsText = page.getByText(/Generations:/);
    await expect(generationsText).toBeVisible();
    
    // Check for live cells count
    const liveCellsText = page.getByText(/Live Cells:/);
    await expect(liveCellsText).toBeVisible();
  });
});
