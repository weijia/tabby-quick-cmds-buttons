const { chromium } = require('playwright');
const path = require('path');
const dir = process.cwd();

(async () => {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];
    await page.waitForTimeout(2000);

    // Open dialog with normal click
    await page.locator('button:has-text("+")').first().click();
    await page.waitForTimeout(500);

    // --- Test 1: Normal mouse click on input, then keyboard type ---
    const nameInput = await page.locator('input[placeholder="e.g., List Files"]').first();
    const box = await nameInput.boundingBox();
    
    // Simulate exactly what a human does: move mouse, mousedown, mouseup
    await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(200);
    
    const focused = await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        placeholder: document.activeElement?.placeholder
    }));
    console.log('After real mouse click, focused:', JSON.stringify(focused));
    
    // Type with real keyboard
    await page.keyboard.type('My New Command');
    await page.waitForTimeout(200);
    const nameVal = await nameInput.inputValue();
    console.log('Name field: "' + nameVal + '"');

    // --- Click into Command Text textarea ---
    const textArea = await page.locator('textarea[placeholder="e.g., ls -la"]').first();
    const tbox = await textArea.boundingBox();
    await page.mouse.move(tbox.x + tbox.width/2, tbox.y + tbox.height/2);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(200);
    await page.keyboard.type('echo "it works!"');
    await page.waitForTimeout(200);
    const textVal = await textArea.inputValue();
    console.log('Text field: "' + textVal + '"');

    // --- Click into Description ---
    const descInput = await page.locator('input[placeholder="What does this command do?"]').first();
    const dbox = await descInput.boundingBox();
    await page.mouse.move(dbox.x + dbox.width/2, dbox.y + dbox.height/2);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(200);
    await page.keyboard.type('Testing real clicks');
    await page.waitForTimeout(200);
    const descVal = await descInput.inputValue();
    console.log('Desc field: "' + descVal + '"');

    // --- Click into Group field and set non-default ---
    const groupInput = await page.locator('input[placeholder="e.g., System"]').first();
    const gbox = await groupInput.boundingBox();
    await page.mouse.move(gbox.x + gbox.width/2, gbox.y + gbox.height/2);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(200);
    // Select all existing text and replace
    await page.keyboard.press('Control+a');
    await page.keyboard.type('Custom Group');
    await page.waitForTimeout(200);
    const groupVal = await groupInput.inputValue();
    console.log('Group field: "' + groupVal + '"');

    await page.screenshot({ path: path.join(dir, 'test-real-filled.png') });
    console.log('\nScreenshot: form filled with real clicks');

    // Save it
    const saveBox = await page.locator('button:has-text("Save Command")').first().boundingBox();
    await page.mouse.move(saveBox.x + saveBox.width/2, saveBox.y + saveBox.height/2);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(dir, 'test-real-saved.png') });

    // Create a second command in the same group
    await page.locator('button:has-text("+")').first().click();
    await page.waitForTimeout(500);

    const ni2 = await page.locator('input[placeholder="e.g., List Files"]').first();
    const b2 = await ni2.boundingBox();
    await page.mouse.move(b2.x + b2.width/2, b2.y + b2.height/2);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(200);
    await page.keyboard.type('Second Command');
    
    const ta2 = await page.locator('textarea[placeholder="e.g., ls -la"]').first();
    const tb2 = await ta2.boundingBox();
    await page.mouse.move(tb2.x + tb2.width/2, tb2.y + tb2.height/2);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(200);
    await page.keyboard.type('whoami');

    const gi2 = await page.locator('input[placeholder="e.g., System"]').first();
    const gb2 = await gi2.boundingBox();
    await page.mouse.move(gb2.x + gb2.width/2, gb2.y + gb2.height/2);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(200);
    await page.keyboard.press('Control+a');
    await page.keyboard.type('Custom Group');

    await page.screenshot({ path: path.join(dir, 'test-real-filled2.png') });

    // Save second
    const sb2 = await page.locator('button:has-text("Save Command")').first().boundingBox();
    await page.mouse.move(sb2.x + sb2.width/2, sb2.y + sb2.height/2);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(dir, 'test-real-final.png') });

    // Verify
    const btn1 = await page.locator('button:has-text("My New Command")').count();
    const btn2 = await page.locator('button:has-text("Second Command")').count();
    console.log('\nVerification:');
    console.log('  "My New Command": ' + (btn1 > 0 ? 'FOUND' : 'MISSING'));
    console.log('  "Second Command": ' + (btn2 > 0 ? 'FOUND' : 'MISSING'));
    
    if (btn1 > 0 && btn2 > 0) console.log('\nSUCCESS: Both buttons created with real mouse clicks and keyboard!');
    else console.log('\nFAIL');

    await browser.close();
})();
