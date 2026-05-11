const { chromium } = require('playwright');
const path = require('path');
const dir = process.cwd();

(async () => {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];
    await page.waitForTimeout(2000);

    page.on('dialog', async d => { console.log('Confirm:', d.message()); await d.accept(); });

    // 1. Create command in "Temp" group
    const addBtn = await page.locator('button:has-text("Add Command")').first();
    await addBtn.click();
    await page.waitForTimeout(500);

    const ni = await page.locator('input[placeholder="e.g., List Files"]').first();
    await page.mouse.click((await ni.boundingBox()).x + 50, (await ni.boundingBox()).y + 10);
    await page.waitForTimeout(100);
    await page.keyboard.type('TempCmd');

    const ta = await page.locator('textarea[placeholder="e.g., ls -la"]').first();
    await page.mouse.click((await ta.boundingBox()).x + 50, (await ta.boundingBox()).y + 10);
    await page.waitForTimeout(100);
    await page.keyboard.type('echo temp');

    const gi = await page.locator('input[placeholder="e.g., System"]').first();
    await page.mouse.click((await gi.boundingBox()).x + 50, (await gi.boundingBox()).y + 10);
    await page.waitForTimeout(100);
    await page.keyboard.press('Control+a');
    await page.keyboard.type('Temp');

    await page.locator('button:has-text("Save Command")').first().click();
    await page.waitForTimeout(500);
    console.log('1. Created "TempCmd" in "Temp" group');
    await page.screenshot({ path: path.join(dir, 'e2e-1-created.png') });

    // 2. Click the Temp tab
    await page.evaluate(() => {
        const links = document.querySelectorAll('#app-parent a');
        for (const a of links) { if (a.textContent.trim() === 'Temp') { a.click(); break; } }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(dir, 'e2e-2-temptab.png') });
    console.log('2. Switched to Temp tab');

    // 3. Right-click TempCmd
    const btns = await page.locator('button:has-text("TempCmd")').all();
    let clicked = false;
    for (const btn of btns) {
        if (await btn.isVisible()) {
            const box = await btn.boundingBox();
            await page.mouse.click(box.x + box.width/2, box.y + box.height/2, { button: 'right' });
            clicked = true;
            break;
        }
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(dir, 'e2e-3-contextmenu.png') });
    console.log('3. Right-clicked, context menu: ' + clicked);

    // 4. Click Delete using mouse coordinates
    const delItems = await page.locator('div.context-menu-item').all();
    for (const item of delItems) {
        const text = await item.textContent();
        if (text.trim() === 'Delete' && await item.isVisible()) {
            const box = await item.boundingBox();
            await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
            console.log('4. Clicked Delete');
            break;
        }
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(dir, 'e2e-4-deleted.png') });

    // 5. Verify
    const remaining = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button'))
            .filter(b => b.textContent.includes('TempCmd') && b.offsetParent !== null).length;
    });
    console.log('5. Visible "TempCmd" remaining: ' + remaining);
    console.log(remaining === 0 ? '\nSUCCESS' : '\nFAIL');

    await browser.close();
})();
