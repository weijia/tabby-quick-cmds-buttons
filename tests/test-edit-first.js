const { chromium } = require('playwright');
const path = require('path');
const dir = process.cwd();

(async () => {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];
    await page.waitForTimeout(2000);

    // 1. Verify "Edit first" checkbox exists
    const checkbox = await page.locator('label:has-text("Edit first") input[type="checkbox"]').first();
    const exists = await checkbox.count() > 0;
    console.log('1. "Edit first" checkbox: ' + (exists ? 'FOUND' : 'MISSING'));
    await page.screenshot({ path: path.join(dir, 'edit-1-checkbox.png') });

    // 2. Check it's unchecked by default
    const checked = await checkbox.isChecked();
    console.log('2. Default state: ' + (checked ? 'checked' : 'unchecked'));

    // 3. Click a command button WITHOUT "Edit first" - should execute (append \r)
    // Find the first visible command button in Sessions tab
    const firstCmd = await page.locator('#app-parent button[title]').first();
    const cmdText = await firstCmd.textContent();
    console.log('3. Testing with command: "' + cmdText.trim() + '"');

    // 4. Check the checkbox to enable edit mode
    const labelBox = await page.locator('label:has-text("Edit first")').first().boundingBox();
    await page.mouse.click(labelBox.x + labelBox.width/2, labelBox.y + labelBox.height/2);
    await page.waitForTimeout(200);
    const nowChecked = await checkbox.isChecked();
    console.log('4. After clicking, checked: ' + nowChecked);
    await page.screenshot({ path: path.join(dir, 'edit-2-checked.png') });

    console.log('\n' + (exists && !checked && nowChecked ? 'SUCCESS: Edit first checkbox works!' : 'FAIL'));

    await browser.close();
})();
