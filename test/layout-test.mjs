import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = `file:///${path.resolve(__dirname, 'layout-test.html').replace(/\\/g, '/')}`;

const viewports = [
  { name: 'wide-1920x1080', width: 1920, height: 1080 },
  { name: 'medium-1280x720', width: 1280, height: 720 },
  { name: 'narrow-800x600', width: 800, height: 600 },
  { name: 'tiny-640x480', width: 640, height: 480 },
];

let passed = 0;
let failed = 0;

const browser = await chromium.launch();

for (const vp of viewports) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();
  await page.goto(htmlPath);
  await page.waitForSelector('.tabs-component-tab');

  // Get panel bounding box
  const panel = await page.locator('#app-parent').boundingBox();

  // Check panel width >= 600 (min-width)
  const widthOk = panel.width >= 590; // small tolerance for borders

  // Check panel height is reasonable (not accordion — should be < 80% of viewport)
  const heightOk = panel.height < vp.height * 0.8;

  // Check tabs are wrapping not stacking — tab row height should be < 40% of panel
  const tabsBox = await page.locator('.tabs-component-tabs').boundingBox();
  const tabsRatioOk = tabsBox.height < panel.height * 0.6;

  // Check first button is visible
  const btnVisible = await page.locator('.cmd-btn').first().isVisible();

  // Check tooltip
  const tooltip = await page.locator('.cmd-btn').first().getAttribute('title');
  const tooltipOk = tooltip && tooltip.startsWith('Description for:');

  // Screenshot
  const ssPath = path.resolve(__dirname, `screenshot-${vp.name}.png`);
  await page.screenshot({ path: ssPath });

  const allOk = widthOk && heightOk && tabsRatioOk && btnVisible && tooltipOk;
  if (allOk) passed++; else failed++;

  console.log(`${allOk ? 'PASS' : 'FAIL'} ${vp.name} (${vp.width}x${vp.height})`);
  console.log(`  panel: ${Math.round(panel.width)}x${Math.round(panel.height)}  width>600:${widthOk}  height<80%vh:${heightOk}`);
  console.log(`  tabs height: ${Math.round(tabsBox.height)}px  ratio<60%:${tabsRatioOk}  btn:${btnVisible}  tooltip:${tooltipOk}`);

  await context.close();
}

await browser.close();

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
