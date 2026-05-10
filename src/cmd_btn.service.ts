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
                <div v-show="isTabVisible===false" :class="{'use-fixed-theme': !isUseSystemTheme}" style="display:flex;flex-wrap:wrap">
                    <button @click="sendCmd(cmd)" v-for="cmd in cmds" :key="cmd.name" :title="cmd.description || cmd.text || ''" style="margin:4px">
                        {{ cmd.name }}
                    </button>
                </div>
                <div v-show="isTabVisible" :class="{'use-fixed-theme': !isUseSystemTheme}">
                    <tabs ref="cmdTabs" :options="{ useUrlFragment: false }" >
                        <tab v-bind:name="cmdGroup" v-for="(cmds, cmdGroup) in tabToCmds" :key="cmdGroup">
                            <div style="display:flex;flex-wrap:wrap">
                                <button @click="sendCmd(cmd)" v-for="cmd in cmds" :key="cmd.name" :title="cmd.description || cmd.text || ''" style="margin:4px">
                                    {{ cmd.name }}
                                </button>
                            </div>
                        </tab>
                    </tabs>
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
                    // thisVar.tab.sendInput(cmd.text + (cmd.appendCR ? "\n" : ""))
                    // console.log(cmd, thisVar.tabs)
                    thisVar.sendCmdToFocusTab(cmd)
                },
                updateCmds() {
                    const tabToCmds: { [key: string]: any } = {};
                    if(thisVar.config.store){
                        for (let element of thisVar.config.store.qc.cmds) {
                            // console.log(element)
                            if (!tabToCmds.hasOwnProperty(element.group)) {
                                tabToCmds[element.group] = []
                                // console.log(JSON.stringify(tabToCmds))
                            }
                            tabToCmds[element.group].push(element)
                            // console.log(JSON.stringify(tabToCmds))
                        }
                    }
                    // console.log("returning:", tabToCmds)
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
