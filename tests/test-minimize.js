const { chromium } = require('playwright');
const path = require('path');
const dir = process.cwd();

(async () => {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];
    await page.waitForTimeout(2000);

    // 1. Verify minimize button exists
    const minBtn = await page.locator('button:has-text("—")').first();
    console.log('1. Minimize button (—): ' + (await minBtn.count() > 0 ? 'FOUND' : 'MISSING'));
    await page.screenshot({ path: path.join(dir, 'min-1-expanded.png') });

    // 2. Check panel height before minimize
    const beforeHeight = await page.evaluate(() => {
        return document.getElementById('app-parent')?.offsetHeight;
    });
    console.log('2. Panel height before: ' + beforeHeight + 'px');

    // 3. Click minimize
    const mb = await minBtn.boundingBox();
    await page.mouse.click(mb.x + mb.width/2, mb.y + mb.height/2);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(dir, 'min-2-minimized.png') });

    const afterHeight = await page.evaluate(() => {
        return document.getElementById('app-parent')?.offsetHeight;
    });
    console.log('3. Panel height after minimize: ' + afterHeight + 'px');

    // 4. Check that expand button (▢) now shows
    const expandBtn = await page.locator('button:has-text("▢")').first();
    console.log('4. Expand button (▢): ' + (await expandBtn.count() > 0 ? 'FOUND' : 'MISSING'));

    // 5. Check Add Command and Edit first are hidden
    const addBtn = await page.locator('button:has-text("Add Command")').first();
    const addVisible = await addBtn.isVisible();
    console.log('5. "+ Add Command" visible when minimized: ' + addVisible);

    // 6. Click expand
    const eb = await expandBtn.boundingBox();
    await page.mouse.click(eb.x + eb.width/2, eb.y + eb.height/2);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(dir, 'min-3-restored.png') });

    const restoredHeight = await page.evaluate(() => {
        return document.getElementById('app-parent')?.offsetHeight;
    });
    console.log('6. Panel height after restore: ' + restoredHeight + 'px');

    const minBtnBack = await page.locator('button:has-text("—")').first();
    console.log('7. Minimize button back: ' + (await minBtnBack.count() > 0 ? 'FOUND' : 'MISSING'));

    if (afterHeight < beforeHeight && !addVisible && restoredHeight > afterHeight) {
        console.log('\nSUCCESS: Minimize/restore works!');
    } else {
        console.log('\nFAIL');
    }

    await browser.close();
})();
