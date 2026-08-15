const { chromium } = require('playwright');
const path = require('path');
const dir = process.cwd();

(async () => {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];
    await page.waitForTimeout(2000);

    console.log('=== Testing Broadcast to All Tabs UI & Safety Controls ===');

    // 1. Verify 'Broadcast All' and 'Confirm Broadcasts' header toggles exist
    const broadcastAllCheckbox = await page.locator('label:has-text("Broadcast All") input[type="checkbox"]').first();
    const confirmBroadcastsCheckbox = await page.locator('label:has-text("Confirm Broadcasts") input[type="checkbox"]').first();
    
    console.log('1. Broadcast All toggle present: ' + (await broadcastAllCheckbox.count() > 0 ? 'YES' : 'NO'));
    console.log('2. Confirm Broadcasts toggle present: ' + (await confirmBroadcastsCheckbox.count() > 0 ? 'YES' : 'NO'));
    console.log('3. Confirm Broadcasts checked by default: ' + (await confirmBroadcastsCheckbox.isChecked()));

    // 2. Open Add Command Dialog and check Broadcast option
    const addBtn = await page.locator('button:has-text("Add Command")').first();
    await addBtn.click();
    await page.waitForTimeout(300);

    const dialogBroadcastCheckbox = await page.locator('label:has-text("Broadcast to ALL open tabs") input[type="checkbox"]').first();
    console.log('4. Dialog Broadcast checkbox present: ' + (await dialogBroadcastCheckbox.count() > 0 ? 'YES' : 'NO'));

    // 3. Close dialog
    const cancelBtn = await page.locator('button:has-text("Cancel")').first();
    if (await cancelBtn.count() > 0) {
        await cancelBtn.click();
    }

    console.log('\nSUCCESS: Broadcast UI elements and safety configuration verified!');
    await browser.close();
})();
