const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 850, height: 600 });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 30px; background: #1e1e1e; }
            #app-parent { background: #2d2d2d; width: 680px; border-radius: 6px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.5); border: 1px solid #444; color: #eee; }
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
                        <!-- Header Section -->
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#252526;border-bottom:1px solid #3e3e42;">
                            <span style="font-weight:bold;font-size:14px;color:#fff;">Quick Commands</span>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;color:#ef5350;font-weight:bold;">
                                    <input type="checkbox" v-model="broadcastAll" />
                                    Broadcast All
                                </label>
                                <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;color:#ef5350;">
                                    <input type="checkbox" v-model="confirmBroadcasts" />
                                    Confirm Broadcasts
                                </label>
                                <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;color:#aaa;">
                                    <input type="checkbox" v-model="editBeforeSend" />
                                    Edit first
                                </label>
                                <button style="padding:4px 10px;background:#4CAF50;color:white;border:none;border-radius:3px;cursor:pointer;font-size:12px;font-weight:bold;">+ Add Command</button>
                                <button style="padding:4px 8px;background:#3c3c3c;color:#ccc;border:1px solid #555;border-radius:3px;cursor:pointer;">—</button>
                                <button style="padding:4px 8px;background:#3c3c3c;color:#ccc;border:1px solid #555;border-radius:3px;cursor:pointer;">✕</button>
                            </div>
                        </div>

                        <div style="display:flex;flex-wrap:wrap;padding:14px;background:#2d2d2d;gap:4px;">
                            <button v-for="cmd in cmds" :key="cmd.name" :style="cmd.broadcast ? 'margin:4px;padding:6px 12px;background:#ffebee;border:1px solid #d32f2f;color:#b71c1c;font-weight:bold;border-radius:3px;cursor:pointer;' : 'margin:4px;padding:6px 12px;background:#3c3c3c;border:1px solid #555;color:#ddd;border-radius:3px;cursor:pointer;'">
                                {{ cmd.broadcast ? '📡 ' + cmd.name : cmd.name }}
                            </button>
                        </div>

                        <!-- Open Dialog demonstration -->
                        <div style="margin: 14px; background:#fff; color:#333; padding:20px; border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.3); border:1px solid #ccc;">
                            <h3 style="margin-top:0;margin-bottom:14px;font-size:16px;color:#111;">Create New Command (Broadcast Option)</h3>
                            <div style="margin-bottom:10px;">
                                <label style="display:block;margin-bottom:4px;font-weight:bold;font-size:12px;color:#444;">Command Name</label>
                                <input value="Sync Cluster Nodes" readonly style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;background:#fdfdfd;" />
                            </div>
                            <div style="margin-bottom:10px;">
                                <label style="display:block;margin-bottom:4px;font-weight:bold;font-size:12px;color:#444;">Command Text</label>
                                <input value="git pull && npm run build" readonly style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;font-family:monospace;background:#fdfdfd;" />
                            </div>
                            <div style="margin-bottom:16px;">
                                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:6px;font-size:12px;color:#333;">
                                    <input type="checkbox" checked disabled />
                                    <span>Append newline (Enter)</span>
                                </label>
                                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;color:#d32f2f;font-weight:bold;font-size:12px;padding:6px 8px;background:#ffebee;border-radius:4px;border:1px solid #ffcdd2;">
                                    <input type="checkbox" checked disabled />
                                    <span>📡 Broadcast to ALL open tabs simultaneously</span>
                                </label>
                            </div>
                            <div style="display:flex;gap:8px;justify-content:flex-end;">
                                <button style="padding:6px 14px;background:#f0f0f0;border:1px solid #ccc;border-radius:4px;cursor:pointer;">Cancel</button>
                                <button style="padding:6px 14px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">Save Command</button>
                            </div>
                        </div>
                    </div>
                \`,
                data() {
                    return {
                        cmds: [
                            { name: 'List Files', broadcast: false },
                            { name: 'System Status', broadcast: false },
                            { name: 'Sync Cluster Nodes', broadcast: true },
                            { name: 'Check Cluster Uptime', broadcast: true }
                        ],
                        broadcastAll: false,
                        confirmBroadcasts: true,
                        editBeforeSend: false
                    }
                }
            });
            app.mount('#app');
        </script>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    await page.waitForTimeout(500);
    const screenshotPath = path.join(__dirname, 'broadcast-feature.png');
    await page.locator('#app-parent').screenshot({ path: screenshotPath });
    console.log('Screenshot generated at:', screenshotPath);
    await browser.close();
})();
