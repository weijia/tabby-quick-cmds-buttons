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

        const div = document.createElement('div')
        div.setAttribute("style", 'position:absolute;top:40px;right:10px;z-index:99999;max-height:70vh;min-height:40px;min-width:600px;overflow-y:auto;overflow-x:hidden;flex-shrink:0;-webkit-app-region:no-drag;transform:translateZ(0);')
        div.setAttribute("id", 'app-parent')

        div.innerHTML= `
            <div id="app">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #ccc;background:#f5f5f5;" id="app-parent-header">
                    <span style="font-weight:bold;font-size:12px;">Quick Commands</span>
                    <div style="display:flex;gap:4px;">
                        <button @click="showCreateCommandDialog" style="padding:4px 8px;font-size:12px;cursor:pointer;" title="Add new command">+</button>
                        <button @click="showSettings" style="padding:4px 8px;font-size:12px;cursor:pointer;" title="Settings">⚙️</button>
                    </div>
                </div>
                <div v-show="isTabVisible===false" :class="{'use-fixed-theme': !isUseSystemTheme}" style="display:flex;flex-wrap:wrap;padding:8px;">
                    <button @click="sendCmd(cmd)" @contextmenu="openCmdContextMenu($event, cmd)" v-for="cmd in cmds" :key="cmd.name" :title="cmd.description || cmd.text || ''" style="margin:4px">
                        {{ cmd.name }}
                    </button>
                </div>
                <div v-show="isTabVisible" :class="{'use-fixed-theme': !isUseSystemTheme}">
                    <tabs ref="cmdTabs" :options="{ useUrlFragment: false }" >
                        <tab v-bind:name="cmdGroup" v-for="(cmds, cmdGroup) in tabToCmds" :key="cmdGroup">
                            <div style="display:flex;flex-wrap:wrap;padding:8px;">
                                <button @click="sendCmd(cmd)" @contextmenu="openCmdContextMenu($event, cmd)" v-for="cmd in cmds" :key="cmd.name" :title="cmd.description || cmd.text || ''" style="margin:4px">
                                    {{ cmd.name }}
                                </button>
                            </div>
                        </tab>
                    </tabs>
                </div>

                <!-- Create Command Dialog -->
                <div v-if="showDialog" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:100000;" @click="closeDialog">
                    <div style="background:white;padding:20px;border-radius:8px;min-width:400px;box-shadow:0 2px 10px rgba(0,0,0,0.1);" @click.stop>
                        <h3 style="margin-top:0;margin-bottom:16px;">Create New Command</h3>
                        <div style="margin-bottom:12px;">
                            <label style="display:block;margin-bottom:4px;font-weight:bold;font-size:12px;">Command Name</label>
                            <input v-model="newCmd.name" type="text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" placeholder="e.g., List Files" />
                        </div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block;margin-bottom:4px;font-weight:bold;font-size:12px;">Command Text</label>
                            <textarea v-model="newCmd.text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;font-family:monospace;height:80px;" placeholder="e.g., ls -la" />
                        </div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block;margin-bottom:4px;font-weight:bold;font-size:12px;">Description</label>
                            <input v-model="newCmd.description" type="text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" placeholder="What does this command do?" />
                        </div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block;margin-bottom:4px;font-weight:bold;font-size:12px;">Group/Tab</label>
                            <input v-model="newCmd.group" type="text" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;" placeholder="e.g., System" />
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                                <input v-model="newCmd.appendCR" type="checkbox" />
                                <span style="font-size:12px;">Append newline (Enter)</span>
                            </label>
                        </div>
                        <div style="display:flex;gap:8px;justify-content:flex-end;">
                            <button @click="closeDialog" style="padding:8px 16px;background:#f0f0f0;border:1px solid #ccc;border-radius:4px;cursor:pointer;">Cancel</button>
                            <button @click="saveCommand" style="padding:8px 16px;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;">Save Command</button>
                        </div>
                    </div>
                </div>

                <!-- Context Menu -->
                <div v-if="showContextMenu" :style="{position:'fixed',top:contextMenuY+'px',left:contextMenuX+'px',background:'white',border:'1px solid #ccc',border-radius:'4px',box-shadow:'0 2px 8px rgba(0,0,0,0.15)',z-index:'100001'}" @mouseleave="showContextMenu = false">
                    <div @click="editCommand(contextMenuCmd)" style="padding:8px 16px;cursor:pointer;font-size:12px;user-select:none;" class="context-menu-item">
                        Edit
                    </div>
                    <div @click="deleteCommand(contextMenuCmd)" style="padding:8px 16px;cursor:pointer;font-size:12px;color:#f44336;user-select:none;" class="context-menu-item">
                        Delete
                    </div>
                </div>
            </div>
        `

        document.querySelector('body').appendChild(div)
        this.div = div

        let thisVar = this

        this.app = createApp({
            mounted: function(){
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
                    newCmd: {
                        name: '',
                        text: '',
                        description: '',
                        group: 'default',
                        appendCR: true,
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
                    thisVar.sendCmdToFocusTab(cmd)
                },
                showCreateCommandDialog() {
                    this.newCmd = {
                        name: '',
                        text: '',
                        description: '',
                        group: 'default',
                        appendCR: true,
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
                        }
                    } else {
                        // Add new
                        thisVar.config.store.qc.cmds.push({
                            name: this.newCmd.name,
                            text: this.newCmd.text,
                            description: this.newCmd.description || '',
                            group: this.newCmd.group || 'default',
                            appendCR: this.newCmd.appendCR,
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
                }
            }
        })
        this.app.use(PrimeVue);
        this.app.component('tabs', Tabs)
        .component('tab', Tab)
        .mount('#app');


        // Make the DIV element draggable:
        dragElement(document.getElementById("app-parent"));

        function dragElement(element) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (document.getElementById(element.id + "header")) {
                // if present, the header is where you move the DIV from:
                document.getElementById(element.id + "header").onmousedown = dragMouseDown;
            } else {
                // otherwise, move the DIV from anywhere inside the DIV:
                element.onmousedown = dragMouseDown;
            }

            function dragMouseDown(e) {
                // Only allow dragging from empty areas, not buttons/tabs/inputs
                if(e.target.tagName === "BUTTON" || e.target.tagName === "A" || e.target.id === "cmd-input") {
                    return;
                }
                // Check if click is inside a tab or tab-related element
                if(e.target.closest('.tabs-component-tab') || e.target.closest('.tabs-component-panels')) {
                    return;
                }
                // Don't drag from header
                if(e.target.closest('#app-parent-header')) {
                    return;
                }
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // clamp position so panel stays within viewport
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
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    }

    sendCmdToFocusTab(cmd) {
        for (let tab of this.tabs) {
            if (tab.hasFocus) {
                tab.sendInput(cmd.text + (cmd.appendCR ? "\r" : ""))
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
