import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { createApp } from 'vue'
// import { ref } from 'vue'
import {Tabs, Tab} from 'vue3-tabs-component';
import PrimeVue from 'primevue/config';
import 'primevue/resources/primevue.min.css';
import 'primevue/resources/themes/saga-blue/theme.css'; // Choose your preferred theme
import 'tabs-component.css';

@Injectable({ providedIn: 'root'})
export class CmdBtnService {
    public  tabs = []
    private app: any = null
    private div: HTMLElement | null = null
    private subscriptions: any[] = []

    constructor (
        public config: ConfigService,
    ) {
        // Clean up any previous instance
        this.cleanup()
        console.log('✓ CmdBtnService loaded with quick-add feature (v1.1.1)')

        // Unique marker to verify THIS version is loaded
        const markerEl = document.createElement('div')
        markerEl.id = 'PLUGIN_VERSION_MARKER_20250510_184500_TYPING_FIX'
        markerEl.style.display = 'none'
        document.body.appendChild(markerEl)

        const div = document.createElement('div')
        div.setAttribute("style", 'position:absolute;top:40px;right:10px;z-index:99999;max-height:70vh;min-height:40px;width:650px;overflow-y:auto;overflow-x:hidden;flex-shrink:0;-webkit-app-region:no-drag;')
        div.setAttribute("id", 'app-parent')
        console.log('✓ Created #app-parent div')

        // Create header separately outside of Vue
        const header = document.createElement('div')
        header.setAttribute("id", 'app-parent-header')
        header.setAttribute("style", 'background:#f5f5f5;padding:8px;border-bottom:1px solid #ccc;')
        header.textContent = "Quick Commands Header"
        console.log('✓ Created header element')

        const appDiv = document.createElement('div')
        appDiv.setAttribute("id", 'app')
        appDiv.style.height = '100%'
        appDiv.style.width = '100%'
        appDiv.style.display = 'flex'
        appDiv.style.flexDirection = 'column'
        div.appendChild(appDiv)
        div.style.width = '650px'
        div.style.height = 'auto'
        div.style.minHeight = '80px'
        document.querySelector('body').appendChild(div)

        const templateHTML = `
            <div style="display:flex;flex-direction:column;height:100%;width:100%;">
                <!-- Header Section -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:#f5f5f5;border-bottom:1px solid #ddd;flex-shrink:0;">
                    <span style="font-weight:bold;font-size:14px;">Quick Commands</span>
                    <div style="display:flex;gap:4px;align-items:center;">
                        <label v-show="!minimized" title="When checked, clicking ANY button will broadcast it to ALL open terminal tabs simultaneously!" style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;color:#d32f2f;font-weight:bold;white-space:nowrap;">
                            <input type="checkbox" v-model="broadcastAll" />
                            Broadcast All
                        </label>
                        <label v-show="!minimized" title="Require confirmation before sending a broadcast command" style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;color:#d32f2f;white-space:nowrap;">
                            <input type="checkbox" v-model="confirmBroadcasts" />
                            Confirm Broadcasts
                        </label>
                        <label v-show="!minimized" title="When checked, commands are typed into the terminal without pressing Enter, so you can edit them first" style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;color:#666;white-space:nowrap;">
                            <input type="checkbox" v-model="editBeforeSend" />
                            Edit first
                        </label>
                        <button v-show="!minimized" @click="showCreateCommandDialog" title="Add a new quick command" style="padding:4px 8px;background:#4CAF50;color:white;border:none;border-radius:3px;cursor:pointer;font-weight:bold;">+ Add Command</button>
                        <button @click="minimized = !minimized" :title="minimized ? 'Expand panel' : 'Minimize panel'" style="padding:4px 8px;background:#f0f0f0;border:1px solid #ccc;border-radius:3px;cursor:pointer;">{{ minimized ? '▢' : '—' }}</button>
                        <button @click="closePanel" style="padding:4px 8px;background:#f0f0f0;border:1px solid #ccc;border-radius:3px;cursor:pointer;">✕</button>
                    </div>
                </div>

                <div v-show="isTabVisible===false && !minimized" :class="{'use-fixed-theme': !isUseSystemTheme}" style="display:flex;flex-wrap:wrap;padding:8px;flex:1;overflow-y:auto;min-height:0;">
                    <button @click="sendCmd(cmd)" @contextmenu="openCmdContextMenu($event, cmd)" v-for="cmd in cmds" :key="cmd.name" :title="(cmd.description || cmd.text || '') + (cmd.broadcast ? ' (BROADCAST COMMAND)' : '') + ' | Right-click to edit/delete'" :style="cmd.broadcast ? 'margin:4px;background:#ffebee;border:1px solid #d32f2f;color:#b71c1c;font-weight:bold;' : 'margin:4px'">
                        {{ cmd.broadcast ? '📡 ' + cmd.name : cmd.name }}
                    </button>
                </div>
                <div v-show="isTabVisible && !minimized" :class="{'use-fixed-theme': !isUseSystemTheme}" style="flex:1;overflow-y:auto;min-height:0;display:flex;flex-direction:column;">
                    <tabs ref="cmdTabs" :options="{ useUrlFragment: false }" >
                        <tab v-bind:name="cmdGroup" v-for="(cmds, cmdGroup) in tabToCmds" :key="cmdGroup">
                            <div style="display:flex;flex-wrap:wrap;padding:8px;">
                                <button @click="sendCmd(cmd)" @contextmenu="openCmdContextMenu($event, cmd)" v-for="cmd in cmds" :key="cmd.name" :title="(cmd.description || cmd.text || '') + (cmd.broadcast ? ' (BROADCAST COMMAND)' : '') + ' | Right-click to edit/delete'" :style="cmd.broadcast ? 'margin:4px;background:#ffebee;border:1px solid #d32f2f;color:#b71c1c;font-weight:bold;' : 'margin:4px'">
                                    {{ cmd.broadcast ? '📡 ' + cmd.name : cmd.name }}
                                </button>
                            </div>
                        </tab>
                    </tabs>
                </div>

                <!-- Create Command Dialog -->
                <div v-if="showDialog" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:100000;pointer-events:none;" @click="closeDialog">
                    <div style="background:white;padding:20px;border-radius:8px;min-width:400px;max-height:90vh;overflow-y:auto;box-shadow:0 2px 10px rgba(0,0,0,0.1);pointer-events:auto;" @click.stop @mousedown.stop @keydown.stop @keyup.stop @keypress.stop>
                        <h3 style="margin-top:0;margin-bottom:16px;">Create New Command</h3>
                        <div style="margin-bottom:12px;">
                            <label style="display:block;margin-bottom:4px;font-weight:bold;font-size:12px;">Command Name</label>
                            <input v-model="newCmd.name" type="text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" placeholder="e.g., List Files" @click.stop />
                        </div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block;margin-bottom:4px;font-weight:bold;font-size:12px;">Command Text</label>
                            <textarea v-model="newCmd.text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;font-family:monospace;height:80px;" placeholder="e.g., ls -la" @click.stop />
                        </div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block;margin-bottom:4px;font-weight:bold;font-size:12px;">Description</label>
                            <input v-model="newCmd.description" type="text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" placeholder="What does this command do?" @click.stop />
                        </div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block;margin-bottom:4px;font-weight:bold;font-size:12px;">Group/Tab</label>
                            <input v-model="newCmd.group" type="text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" placeholder="e.g., System" @click.stop />
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:8px;">
                                <input v-model="newCmd.appendCR" type="checkbox" />
                                <span style="font-size:12px;">Append newline (Enter)</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;color:#d32f2f;font-weight:bold;">
                                <input v-model="newCmd.broadcast" type="checkbox" />
                                <span style="font-size:12px;">📡 Broadcast to ALL open tabs simultaneously</span>
                            </label>
                        </div>
                        <div style="display:flex;gap:8px;justify-content:flex-end;">
                            <button @click="closeDialog" style="padding:8px 16px;background:#f0f0f0;border:1px solid #ccc;border-radius:4px;cursor:pointer;">Cancel</button>
                            <button @click="saveCommand" style="padding:8px 16px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;">Save Command</button>
                        </div>
                    </div>
                </div>

                <!-- Context Menu -->
                <div v-if="showContextMenu" :style="{'position':'fixed','top':contextMenuY+'px','left':contextMenuX+'px','background':'white','border':'1px solid #ccc','border-radius':'4px','box-shadow':'0 2px 8px rgba(0,0,0,0.15)','z-index':'100001'}" @mouseleave="showContextMenu = false" @mousedown.stop @click.stop>
                    <div @click="editCommand(contextMenuCmd)" style="padding:8px 16px;cursor:pointer;font-size:12px;user-select:none;" class="context-menu-item">
                        Edit
                    </div>
                    <div @click="deleteCommand(contextMenuCmd)" style="padding:8px 16px;cursor:pointer;font-size:12px;color:#f44336;user-select:none;" class="context-menu-item">
                        Delete
                    </div>
                </div>

                <!-- Resize Handle -->
                <div v-show="!minimized" id="resize-handle" style="position:absolute;bottom:0;right:0;width:20px;height:20px;background:linear-gradient(135deg,transparent 50%,#ccc 50%);cursor:nwse-resize;border-radius:0 0 8px 0;" @mousedown="startResize"></div>
            </div>
        `
        this.div = div

        let thisVar = this

        console.log('✓ templateHTML defined, length:', templateHTML.length)
        console.log('✓ First 200 chars:', templateHTML.substring(0, 200))
        console.log('✓ #app div found:', !!document.getElementById('app'))
        console.log('✓ About to create Vue app...')

        const appConfig = {
            template: templateHTML,
            mounted: function(){
                console.log('✓ Vue app mounted successfully!')
                console.log('✓ Vue component this:', !!this)
                console.log('✓ template rendered, tabToCmds:', Object.keys(this.tabToCmds).length)
                if (this.$refs.cmdTabs && Object.keys(this.tabToCmds).length > 0) {
                    this.$refs.cmdTabs.selectTab("#"+Object.keys(this.tabToCmds)[0])
                }
            },
            data() {
                // const cmdTabs = ref(null)
                // This function will be called only once.
                let vueThis = this
                const updateUI = () => {
                    const tabToCmds = vueThis.updateCmds();
                    if (vueThis.$refs && vueThis.$refs.cmdTabs && Object.keys(tabToCmds).length > 0) {
                        vueThis.$refs.cmdTabs.selectTab("#" + Object.keys(tabToCmds)[0])
                    }
                    vueThis.tabToCmds = tabToCmds
                    vueThis.isTabVisible = vueThis.getIsVisible()
                    vueThis.isUseSystemTheme = vueThis.getIsUseSystemTheme()
                    vueThis.cmds = vueThis.getCmds()
                }

                const sub1 = thisVar.config.ready$.subscribe(() => {
                    updateUI()
                });
                const sub2 = thisVar.config.changed$.subscribe(() => {
                    updateUI()
                })
                thisVar.subscriptions.push(sub1, sub2)
                return {
                    tabToCmds: this.updateCmds(),
                    isTabVisible: this.getIsVisible(),
                    isUseSystemTheme: this.getIsUseSystemTheme(),
                    cmds: this.getCmds(),
                    showDialog: false,
                    showContextMenu: false,
                    contextMenuX: 0,
                    contextMenuY: 0,
                    contextMenuCmd: null,
                    broadcastAll: false,
                    confirmBroadcasts: true,
                    editBeforeSend: false,
                    minimized: false,
                    newCmd: {
                        name: '',
                        text: '',
                        description: '',
                        group: 'default',
                        appendCR: true,
                        broadcast: false,
                    },
                }
            },
            // computed: {
            //     cmds: (vm) => {
            //         let cmds = []
            //         for(const group in vueThis.tabToCmds) 
            //     }
            // },
            methods: {
                sendCmd(cmd) {
                    if (cmd.broadcast || this.broadcastAll) {
                        if (this.confirmBroadcasts) {
                            if (!confirm(`⚠️ DANGER: You are about to broadcast a command to ALL open tabs.\n\nAre you sure you want to proceed?`)) {
                                return;
                            }
                        }
                    }
                    thisVar.sendCmdToFocusTab(cmd, this.editBeforeSend, this.broadcastAll)
                },
                showCreateCommandDialog() {
                    this.newCmd = {
                        name: '',
                        text: '',
                        description: '',
                        group: 'default',
                        appendCR: true,
                        broadcast: false,
                    }
                    this.showDialog = true
                    this.showContextMenu = false
                },
                closeDialog() {
                    this.showDialog = false
                },
                saveCommand() {
                    if (!this.newCmd.name || !this.newCmd.text) {
                        alert('Name and command text are required')
                        return
                    }
                    // Add command to config store
                    if (!thisVar.config.store.qc.cmds) {
                        thisVar.config.store.qc.cmds = []
                    }
                    // Check if editing existing command
                    const existingIndex = thisVar.config.store.qc.cmds.findIndex(c => c.name === this.newCmd.name)
                    if (existingIndex >= 0) {
                        // Update existing
                        thisVar.config.store.qc.cmds[existingIndex] = {
                            name: this.newCmd.name,
                            text: this.newCmd.text,
                            description: this.newCmd.description || '',
                            group: this.newCmd.group || 'default',
                            appendCR: this.newCmd.appendCR,
                            broadcast: !!this.newCmd.broadcast,
                        }
                    } else {
                        // Add new
                        thisVar.config.store.qc.cmds.push({
                            name: this.newCmd.name,
                            text: this.newCmd.text,
                            description: this.newCmd.description || '',
                            group: this.newCmd.group || 'default',
                            appendCR: this.newCmd.appendCR,
                            broadcast: !!this.newCmd.broadcast,
                        })
                    }
                    // Persist changes - this will trigger config.changed$ subscription
                    thisVar.config.save()
                    this.closeDialog()
                },
                openCmdContextMenu(event, cmd) {
                    event.preventDefault()
                    this.contextMenuX = event.clientX
                    this.contextMenuY = event.clientY
                    this.contextMenuCmd = cmd
                    this.showContextMenu = true
                },
                editCommand(cmd) {
                    this.newCmd = { ...cmd }
                    this.showContextMenu = false
                    this.showDialog = true
                },
                deleteCommand(cmd) {
                    if (confirm('Delete command: ' + cmd.name + '?')) {
                        const index = thisVar.config.store.qc.cmds.findIndex(c => c.name === cmd.name)
                        if (index >= 0) {
                            thisVar.config.store.qc.cmds.splice(index, 1)
                            // Persist changes - this will trigger config.changed$ subscription
                            thisVar.config.save()
                        }
                    }
                    this.showContextMenu = false
                },
                showSettings() {
                    // Placeholder for settings - could open settings tab or dialog
                    console.log('Settings clicked')
                },
                updateCmds() {
                    const tabToCmds: { [key: string]: any } = {};
                    if(thisVar.config.store){
                        for (let element of thisVar.config.store.qc.cmds) {
                            if (!tabToCmds.hasOwnProperty(element.group)) {
                                tabToCmds[element.group] = []
                            }
                            tabToCmds[element.group].push(element)
                        }
                    }
                    return tabToCmds
                },
                getIsVisible() {
                    var isTabVisible = null
                    if (thisVar.config.store && thisVar.config.store.quickCmdBtnPlugin) {
                        isTabVisible = !thisVar.config.store.quickCmdBtnPlugin.disableTabs
                    }
                    return isTabVisible
                },
                getIsUseSystemTheme() {
                    var isUseSystemTheme = null
                    if (thisVar.config.store && thisVar.config.store.quickCmdBtnPlugin) {
                        isUseSystemTheme = !thisVar.config.store.quickCmdBtnPlugin.useSystemTheme
                    }
                    return isUseSystemTheme
                },
                getCmds() {
                    let cmds = []
                    if(thisVar.config.store){
                        for (let element of thisVar.config.store.qc.cmds) {
                            cmds.push(element)
                        }
                    }
                    return cmds
                },
                closePanel() {
                    thisVar.cleanup()
                },
                startResize(e) {
                    e.preventDefault()
                    const div = thisVar.div
                    const startX = e.clientX
                    const startY = e.clientY
                    const startWidth = div.offsetWidth
                    const startHeight = div.offsetHeight

                    const onMouseMove = (event) => {
                        const newWidth = Math.max(300, startWidth + (event.clientX - startX))
                        const newHeight = Math.max(100, startHeight + (event.clientY - startY))
                        div.style.width = newWidth + 'px'
                        div.style.height = newHeight + 'px'
                        div.style.maxHeight = newHeight + 'px'
                    }

                    const onMouseUp = () => {
                        document.removeEventListener('mousemove', onMouseMove)
                        document.removeEventListener('mouseup', onMouseUp)
                    }

                    document.addEventListener('mousemove', onMouseMove)
                    document.addEventListener('mouseup', onMouseUp)
                }
            }
        }
        this.app = createApp(appConfig)
        this.app.use(PrimeVue);
        this.app.component('tabs', Tabs)
        .component('tab', Tab)
        .mount('#app');

        console.log('✓ Vue app.mount() called')
        setTimeout(() => {
            // Header is created by Vue template, no need to create separately

            const headerEl = document.getElementById('app-parent-header')
            const finalAppEl = document.getElementById('app')
            const finalAppParentEl = document.getElementById('app-parent')
            console.log('✓ After Vue mount:')
            console.log('#app element:', !!finalAppEl)
            if (finalAppEl) console.log('#app innerHTML length:', finalAppEl.innerHTML.length)
            console.log('#app-parent-header element:', !!headerEl)
            console.log('#app-parent element:', !!finalAppParentEl)
            if (finalAppParentEl) {
                const style = window.getComputedStyle(finalAppParentEl)
                console.log('display:', style.display)
                console.log('visibility:', style.visibility)
                console.log('opacity:', style.opacity)
                console.log('width:', style.width)
                console.log('height:', style.height)
            }
        }, 500)

        // Button click handlers are managed by Vue template via @click directives

        // Make the DIV element draggable:
        dragElement(document.getElementById("app-parent"));

        function dragElement(element) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (document.getElementById(element.id + "header")) {
                document.getElementById(element.id + "header").onmousedown = dragMouseDown;
            } else {
                element.onmousedown = dragMouseDown;
            }

            function dragMouseDown(e) {
                if(e.target.tagName === "BUTTON" || e.target.tagName === "A") {
                    return;
                }
                if(e.target.closest('.tabs-component-tab') || e.target.closest('.tabs-component-panels')) {
                    return;
                }
                e = e || window.event;
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                let newTop = element.offsetTop - pos2;
                let newLeft = element.offsetLeft - pos1;
                const maxTop = window.innerHeight - 40;
                const maxLeft = window.innerWidth - 80;
                newTop = Math.max(0, Math.min(newTop, maxTop));
                newLeft = Math.max(-(element.offsetWidth - 80), Math.min(newLeft, maxLeft));
                element.style.top = newTop + "px";
                element.style.left = newLeft + "px";
                element.style.right = "auto";
            }

            function closeDragElement() {
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    }

    sendCmdToFocusTab(cmd, editBeforeSend = false, broadcastAll = false) {
        for (let tab of this.tabs) {
            if (tab.hasFocus || cmd.broadcast || broadcastAll) {
                const appendCR = editBeforeSend ? false : cmd.appendCR
                tab.sendInput(cmd.text + (appendCR ? "\r" : ""))
            }
        }
    }
    
    addTab (tab: any) {
        // console.log("adding tab")
        this.tabs.push(tab)
    }

    private cleanup() {
        // Unsubscribe from all stored subscriptions
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe()
        }
        this.subscriptions = []

        // Destroy Vue app instance if it exists
        if (this.app) {
            this.app.unmount()
            this.app = null
        }

        // Remove DOM element if it exists
        if (this.div && this.div.parentNode) {
            this.div.parentNode.removeChild(this.div)
            this.div = null
        }

        // Clear tabs array
        this.tabs = []
    }
}
