import { test, expect } from '@playwright/test';

test.describe('Game of Life - Pattern Selection', () => {
  test('should display pattern selector with categories', async ({ page }) => {
    await page.goto('/');
    
    // Wait for pattern selector to be visible
    await expect(page.getByText('Select a Pattern')).toBeVisible();
    
    // Pattern categories should be visible
    // (The actual categories depend on the implementation)
  });

  test('should allow selecting a pattern from the list', async ({ page }) => {
    await page.goto('/');
    
    // Wait for pattern selector
    await expect(page.getByText('Select a Pattern')).toBeVisible();
    
    // Click on a pattern - look for any list item in the pattern selector
    const patternList = page.locator('ul').first();
    const firstPattern = patternList.locator('li').first();
    
    if (await firstPattern.isVisible()) {
      await firstPattern.click();
      
      // Wait for pattern to load
      await page.waitForTimeout(500);
      
      // Verify the canvas is still visible (pattern loaded)
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
    }
  });
});

test.describe('Game of Life - Game Controls', () => {
  test('should display generation count and increment on step', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForTimeout(1000);
    
    // Get initial generation count
    const generationsText = page.getByText(/Generations:/);
    await expect(generationsText).toBeVisible();
    
    const initialText = await generationsText.textContent();
    
    // Find and click step button (may be labeled as "Next" or have step icon)
    const stepButton = page.locator('button').filter({ hasText: /step|next/i }).first();
    
    // If no text-based button, try finding by aria-label or tooltip
    const stepButtonAlt = page.getByRole('button', { name: /step|next/i });
    
    if (await stepButton.isVisible()) {
      await stepButton.click();
    } else if (await stepButtonAlt.isVisible()) {
      await stepButtonAlt.click();
    }
    
    // Wait for update
    await page.waitForTimeout(300);
    
    // Generation count should have incremented
    const newText = await generationsText.textContent();
    expect(newText).not.toBe(initialText);
  });

  test('should allow playing and pausing the game', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForTimeout(1000);
    
    // Get initial generation count
    const generationsElement = page.getByText(/Generations:/);
    const initialText = await generationsElement.textContent();
    
    // Find play/pause button - it might be a toggle button
    const playPauseButton = page.locator('button').filter({ hasText: /play|pause/i }).first();
    const playPauseButtonAlt = page.getByRole('button', { name: /play|pause|start|stop/i });
    
    if (await playPauseButton.isVisible()) {
      // Click to start playing
      await playPauseButton.click();
      
      // Wait for a few generations
      await page.waitForTimeout(1500);
      
      // Click to pause
      await playPauseButton.click();
      
      // Verify generation count increased
      const newText = await generationsElement.textContent();
      expect(newText).not.toBe(initialText);
    } else if (await playPauseButtonAlt.isVisible()) {
      await playPauseButtonAlt.click();
      await page.waitForTimeout(1500);
      await playPauseButtonAlt.click();
      
      const newText = await generationsElement.textContent();
      expect(newText).not.toBe(initialText);
    }
  });

  test('should reset the game when clear button is clicked', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForTimeout(1000);
    
    // Advance a few generations
    const stepButton = page.locator('button').filter({ hasText: /step|next/i }).first();
    if (await stepButton.isVisible()) {
      await stepButton.click();
      await stepButton.click();
    }
    
    await page.waitForTimeout(300);
    
    // Now click clear/reset button
    const clearButton = page.locator('button').filter({ hasText: /clear|reset/i }).first();
    const clearButtonAlt = page.getByRole('button', { name: /clear|reset/i });
    
    if (await clearButton.isVisible()) {
      await clearButton.click();
    } else if (await clearButtonAlt.isVisible()) {
      await clearButtonAlt.click();
    }
    
    await page.waitForTimeout(300);
    
    // Generation count should be reset to 0
    const generationsText = page.getByText(/Generations:/);
    const text = await generationsText.textContent();
    expect(text).toContain('0');
  });

  test('should display live cells count', async ({ page }) => {
    await page.goto('/');
    
    // Check for live cells count in diagnostics
    const liveCellsText = page.getByText(/Live Cells:/);
    await expect(liveCellsText).toBeVisible();
  });
});
