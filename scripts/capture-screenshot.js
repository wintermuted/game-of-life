const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshot() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Navigate to the local server
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Wait a bit for the game to render
  await page.waitForTimeout(2000);
  
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: path.join(screenshotsDir, 'app-screenshot.png'),
    fullPage: false
  });
  
  await browser.close();
  console.log('Screenshot captured successfully!');
}

captureScreenshot().catch(console.error);
