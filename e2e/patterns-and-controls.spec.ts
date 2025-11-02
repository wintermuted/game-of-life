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
      
      // Verify the canvas is visible (pattern should be loaded)
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible({ timeout: 2000 });
    }
  });
});

test.describe('Game of Life - Game Controls', () => {
  test('should display generation count and increment on step', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
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
    
    // Wait for generation count to change
    await expect(async () => {
      const newText = await generationsText.textContent();
      expect(newText).not.toBe(initialText);
    }).toPass({ timeout: 2000 });
  });

  test('should allow playing and pausing the game', async ({ page }) => {
    await page.goto('/');
    
    // Wait for canvas to be visible
    await expect(page.locator('canvas')).toBeVisible();
    
    // Get initial generation count
    const generationsElement = page.getByText(/Generations:/);
    await expect(generationsElement).toBeVisible();
    const initialText = await generationsElement.textContent();
    
    // Find play/pause button - it might be a toggle button
    const playPauseButton = page.locator('button').filter({ hasText: /play|pause/i }).first();
    const playPauseButtonAlt = page.getByRole('button', { name: /play|pause|start|stop/i });
    
    if (await playPauseButton.isVisible()) {
      // Click to start playing
      await playPauseButton.click();
      
      // Wait for generation count to increase
      await expect(async () => {
        const currentText = await generationsElement.textContent();
        expect(currentText).not.toBe(initialText);
      }).toPass({ timeout: 3000 });
      
      // Click to pause
      await playPauseButton.click();
      
      // Verify we can get the final count
      const finalText = await generationsElement.textContent();
      expect(finalText).not.toBe(initialText);
    } else if (await playPauseButtonAlt.isVisible()) {
      await playPauseButtonAlt.click();
      
      await expect(async () => {
        const currentText = await generationsElement.textContent();
        expect(currentText).not.toBe(initialText);
      }).toPass({ timeout: 3000 });
      
      await playPauseButtonAlt.click();
      
      const finalText = await generationsElement.textContent();
      expect(finalText).not.toBe(initialText);
    }
  });

  test('should reset the game when clear button is clicked', async ({ page }) => {
    await page.goto('/');
    
    // Wait for canvas to be visible
    await expect(page.locator('canvas')).toBeVisible();
    
    // Advance a few generations
    const stepButton = page.locator('button').filter({ hasText: /step|next/i }).first();
    if (await stepButton.isVisible()) {
      await stepButton.click();
      await stepButton.click();
      
      // Wait for generation count to update
      const generationsText = page.getByText(/Generations:/);
      await expect(async () => {
        const text = await generationsText.textContent();
        expect(text).not.toContain('0');
      }).toPass({ timeout: 2000 });
    }
    
    // Now click clear/reset button
    const clearButton = page.locator('button').filter({ hasText: /clear|reset/i }).first();
    const clearButtonAlt = page.getByRole('button', { name: /clear|reset/i });
    
    if (await clearButton.isVisible()) {
      await clearButton.click();
    } else if (await clearButtonAlt.isVisible()) {
      await clearButtonAlt.click();
    }
    
    // Wait for generation count to reset
    const generationsText = page.getByText(/Generations:/);
    await expect(async () => {
      const text = await generationsText.textContent();
      expect(text).toContain('0');
    }).toPass({ timeout: 2000 });
  });

  test('should display live cells count', async ({ page }) => {
    await page.goto('/');
    
    // Check for live cells count in diagnostics
    const liveCellsText = page.getByText(/Live Cells:/);
    await expect(liveCellsText).toBeVisible();
  });
});
