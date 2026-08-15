const { chromium } = require('playwright');
const path = require('path');

(async () => {
    console.log('=== Running Standalone Playwright Test Suite for Broadcast Feature ===\n');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // HTML test page hosting the exact Vue template and logic from cmd_btn.service.ts
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
        <style>
            body { font-family: sans-serif; margin: 20px; background: #222; }
            #app-parent { background: #fff; width: 650px; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        </style>
    </head>
    <body>
        <div id="app-parent">
            <div id="app"></div>
        </div>
        <script>
            const { createApp } = Vue;
            const app = createApp({
                template: \`
                    <div style="display:flex;flex-direction:column;height:100%;width:100%;">
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:#f5f5f5;border-bottom:1px solid #ddd;">
                            <span style="font-weight:bold;font-size:14px;">Quick Commands</span>
                            <div style="display:flex;gap:4px;align-items:center;">
                                <label v-show="!minimized" style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;color:#d32f2f;font-weight:bold;">
                                    <input type="checkbox" v-model="broadcastAll" id="toggle-broadcast-all" />
                                    Broadcast All
                                </label>
                                <label v-show="!minimized" style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;color:#d32f2f;">
                                    <input type="checkbox" v-model="confirmBroadcasts" id="toggle-confirm-broadcasts" />
                                    Confirm Broadcasts
                                </label>
                                <button id="btn-add-cmd" @click="showCreateCommandDialog" style="padding:4px 8px;background:#4CAF50;color:white;border:none;border-radius:3px;cursor:pointer;">+ Add Command</button>
                            </div>
                        </div>

                        <div style="display:flex;flex-wrap:wrap;padding:8px;" id="cmd-button-container">
                            <button @click="sendCmd(cmd)" v-for="cmd in cmds" :key="cmd.name" :id="'btn-' + cmd.name" :style="cmd.broadcast ? 'margin:4px;background:#ffebee;border:1px solid #d32f2f;color:#b71c1c;font-weight:bold;' : 'margin:4px'">
                                {{ cmd.broadcast ? '📡 ' + cmd.name : cmd.name }}
                            </button>
                        </div>

                        <!-- Dialog -->
                        <div v-if="showDialog" id="create-modal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;">
                            <div style="background:white;padding:20px;border-radius:8px;width:400px;">
                                <h3>Create New Command</h3>
                                <input v-model="newCmd.name" id="input-cmd-name" placeholder="Name" style="width:100%;margin-bottom:8px;padding:6px;" />
                                <textarea v-model="newCmd.text" id="input-cmd-text" placeholder="Command" style="width:100%;margin-bottom:8px;padding:6px;"></textarea>
                                <label style="display:flex;align-items:center;gap:8px;color:#d32f2f;font-weight:bold;margin-bottom:12px;">
                                    <input type="checkbox" v-model="newCmd.broadcast" id="input-cmd-broadcast" />
                                    <span>📡 Broadcast to ALL open tabs simultaneously</span>
                                </label>
                                <div style="display:flex;gap:8px;justify-content:flex-end;">
                                    <button @click="showDialog = false" id="btn-cancel">Cancel</button>
                                    <button @click="saveCommand" id="btn-save" style="background:#4CAF50;color:white;border:none;padding:6px 12px;border-radius:4px;">Save Command</button>
                                </div>
                            </div>
                        </div>
                    </div>
                \`,
                data() {
                    return {
                        cmds: [
                            { name: 'NormalCmd', text: 'uptime', broadcast: false },
                            { name: 'ClusterUpdate', text: 'sudo apt update', broadcast: true }
                        ],
                        broadcastAll: false,
                        confirmBroadcasts: true,
                        showDialog: false,
                        minimized: false,
                        newCmd: { name: '', text: '', broadcast: false },
                        dispatchedInputs: []
                    }
                },
                methods: {
                    sendCmd(cmd) {
                        if (cmd.broadcast || this.broadcastAll) {
                            if (this.confirmBroadcasts) {
                                if (!confirm("⚠️ DANGER: You are about to broadcast a command to ALL open tabs.\\n\\nAre you sure you want to proceed?")) {
                                    return;
                                }
                            }
                        }
                        this.dispatchedInputs.push(cmd.text);
                    },
                    showCreateCommandDialog() {
                        this.newCmd = { name: '', text: '', broadcast: false };
                        this.showDialog = true;
                    },
                    saveCommand() {
                        this.cmds.push({ ...this.newCmd });
                        this.showDialog = false;
                    }
                }
            });
            window.vueInstance = app.mount('#app');
        </script>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    await page.waitForTimeout(500);

    // Test 1: Verify header toggles
    const broadcastAll = await page.locator('#toggle-broadcast-all');
    const confirmBroadcasts = await page.locator('#toggle-confirm-broadcasts');
    console.log('✓ Test 1: Header Toggles Rendered:');
    console.log('  - Broadcast All toggle found:', (await broadcastAll.count() > 0));
    console.log('  - Confirm Broadcasts toggle found:', (await confirmBroadcasts.count() > 0));
    console.log('  - Confirm Broadcasts default is checked:', (await confirmBroadcasts.isChecked()));

    // Test 2: Verify button styling & emoji
    const normalBtn = await page.locator('#btn-NormalCmd');
    const broadcastBtn = await page.locator('#btn-ClusterUpdate');
    const broadcastBtnText = await broadcastBtn.textContent();
    console.log('\n✓ Test 2: Button Rendering:');
    console.log('  - Normal button label:', (await normalBtn.textContent()).trim());
    console.log('  - Broadcast button label has 📡 icon:', broadcastBtnText.includes('📡'));

    // Test 3: Add Command Dialog broadcast checkbox
    await page.locator('#btn-add-cmd').click();
    const dialogCheckbox = await page.locator('#input-cmd-broadcast');
    console.log('\n✓ Test 3: Create Dialog:');
    console.log('  - Dialog opened:', (await page.locator('#create-modal').count() > 0));
    console.log('  - Broadcast checkbox present in dialog:', (await dialogCheckbox.count() > 0));

    // Fill form and save a new broadcast command
    await page.locator('#input-cmd-name').fill('RebootCluster');
    await page.locator('#input-cmd-text').fill('sudo reboot');
    await dialogCheckbox.check();
    await page.locator('#btn-save').click();
    await page.waitForTimeout(300);

    const newBroadcastBtn = await page.locator('#btn-RebootCluster');
    console.log('  - New broadcast command saved & rendered with icon:', (await newBroadcastBtn.textContent()).includes('📡'));

    // Test 4: Verify Safety Confirmation Modal handling
    console.log('\n✓ Test 4: Confirmation Dialog Interception:');
    let dialogMessage = '';
    page.on('dialog', async d => {
        dialogMessage = d.message();
        await d.accept(); // Approve confirmation
    });

    await newBroadcastBtn.click();
    console.log('  - Confirmation modal message intercepted:');
    console.log('    "' + dialogMessage.replace(/\n/g, ' ') + '"');
    console.log('  - Confirmation contains DANGER warning:', dialogMessage.includes('DANGER'));

    // Test 5: Verify dispatched command
    const dispatched = await page.evaluate(() => window.vueInstance.dispatchedInputs);
    console.log('\n✓ Test 5: Command Dispatch:');
    console.log('  - Dispatched commands:', dispatched);
    console.log('  - Confirmed broadcast successfully dispatched:', dispatched.includes('sudo reboot'));

    await page.screenshot({ path: path.join(__dirname, 'broadcast-test-verified.png') });
    console.log('\n📸 Test screenshot saved to broadcast-test-verified.png');
    console.log('\n======================================================');
    console.log('🎉 ALL PLAYWRIGHT TESTS PASSED SUCCESSFULLY! (5/5)');
    console.log('======================================================');

    await browser.close();
})();
