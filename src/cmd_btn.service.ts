import { Injectable } from '@angular/core'
import { ConfigService, HotkeysService } from 'tabby-core'
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

    constructor (
        public config: ConfigService,
        private hotkeys: HotkeysService,
    ) {
        const div = document.createElement('div')
        div.setAttribute("id", 'app-parent')
        
        // 根据显示模式设置不同的样式
        this.updateAppParentStyle(div)

        div.innerHTML= `
            <div id="app">
                <div class="cmd-btn-toggle-sidebar" @click="toggleSidebar">
                    <span v-if="isSidebarCollapsed">»</span>
                    <span v-else>«</span>
                </div>
                <div v-show="isTabVisible===false" :class="{'use-fixed-theme': !isUseSystemTheme, 'cmd-btn-sidebar': true, 'collapsed': isSidebarCollapsed}">
                    <button @click="sendCmd(cmd)" v-for="cmd in cmds" :key="cmd.name" class="cmd-btn">
                        {{ cmd.name }}
                    </button>
                </div>
                <div v-show="isTabVisible" :class="{'use-fixed-theme': !isUseSystemTheme, 'cmd-btn-sidebar': true, 'collapsed': isSidebarCollapsed}">
                    <tabs ref="cmdTabs" :options="{ useUrlFragment: false }" >
                        <tab v-bind:name="cmdGroup" v-for="(cmds, cmdGroup) in tabToCmds" :key="cmdGroup">
                            <div>
                                <button @click="sendCmd(cmd)" v-for="cmd in cmds" :key="cmd.name" class="cmd-btn">
                                    {{ cmd.name }}
                                </button>
                            </div>
                        </tab>
                    </tabs>
                </div>
            </div>
        `

        document.querySelector('body').appendChild(div)

        let thisVar = this
        
        const app = createApp({
            mounted: function(){
                console.log("====================mounted", this, "#"+Object.keys(this.tabToCmds)[0])
                this.$refs.cmdTabs.selectTab("#"+Object.keys(this.tabToCmds)[0])
            },
            data() {
                // const cmdTabs = ref(null)
                // This function will be called only once.
                let vueThis = this
                console.log("---------------------------------data called", vueThis)
                console.log("---------------------------------", thisVar)
                thisVar.config.ready$.subscribe(()=>{
                    console.log("---------------------------------config.ready", 
                        thisVar, thisVar.config, thisVar.config.store,
                        vueThis, vueThis.$refs.cmdTabs)
                    // if(vueThis.$refs.cmdTabs.value) {
                    //     console.log(vueThis.$refs.cmdTabs.value,
                    //         vueThis.$refs.cmdTabs.value.selectTab("helm"))
                    // }
                    const tabToCmds = vueThis.updateCmds();
                    // if(vueThis.$refs && vueThis.$refs.cmdTabs) {
                        // const firstGroup = "#"+Object.keys(tabToCmds)[0]
                        // console.log(vueThis.$refs.cmdTabs.selectTab, firstGroup)
                        // vueThis.$refs.cmdTabs.selectTab(firstGroup)
                        setTimeout(() => {
                            console.log("next tick:", vueThis.$refs)
                            const firstGroup = "#"+Object.keys(tabToCmds)[0]
                            console.log(vueThis.$refs.cmdTabs.selectTab, firstGroup)
                            vueThis.$refs.cmdTabs.selectTab(firstGroup)
                        }, 3000);
                    // }
                    vueThis.tabToCmds = tabToCmds
                    vueThis.isTabVisible = vueThis.getIsVisible()
                    vueThis.isUseSystemTheme = vueThis.getIsUseSystemTheme()
                    vueThis.cmds = vueThis.getCmds()
                });
                thisVar.config.changed$.subscribe(() => {
                    console.log('==================config changed', vueThis)
                    const tabToCmds = vueThis.updateCmds();
                    vueThis.$refs.cmdTabs.selectTab("#"+Object.keys(tabToCmds)[0])
                    vueThis.tabToCmds = tabToCmds
                    vueThis.isTabVisible = vueThis.getIsVisible()
                    vueThis.isUseSystemTheme = vueThis.getIsUseSystemTheme()
                    vueThis.cmds = vueThis.getCmds()
                    // console.log(vueThis.$refs.cmdTabs.selectTab)
                })
                return {
                    tabToCmds: this.updateCmds(),
                    isTabVisible: this.getIsVisible(),
                    isUseSystemTheme: this.getIsUseSystemTheme(),
                    cmds: this.getCmds(),
                    isSidebarCollapsed: this.getIsSidebarCollapsed(),
                    displayMode: this.getDisplayMode()
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
                toggleSidebar() {
                    this.isSidebarCollapsed = !this.isSidebarCollapsed;
                    if (thisVar.config.store && thisVar.config.store.quickCmdBtnPlugin) {
                        thisVar.config.store.quickCmdBtnPlugin.sidebarCollapsed = this.isSidebarCollapsed;
                        thisVar.config.save();
                    }
                    // 更新父元素样式
                    thisVar.updateAppParentStyle(document.getElementById('app-parent'));
                },
                getIsVisible() {
                    var isTabVisible = null
                    console.log(thisVar.config.store)
                    if (thisVar.config.store && thisVar.config.store.quickCmdBtnPlugin) {
                        isTabVisible = !thisVar.config.store.quickCmdBtnPlugin.disableTabs
                    }
                    console.log("returning: ", isTabVisible)
                    return isTabVisible
                },
                getIsUseSystemTheme() {
                    var isUseSystemTheme = null
                    console.log(thisVar.config.store)
                    if (thisVar.config.store && thisVar.config.store.quickCmdBtnPlugin) {
                        isUseSystemTheme = !thisVar.config.store.quickCmdBtnPlugin.useSystemTheme
                    }
                    console.log("returning: ", isUseSystemTheme)
                    return isUseSystemTheme
                },
                getIsSidebarCollapsed() {
                    var isSidebarCollapsed = false
                    if (thisVar.config.store && thisVar.config.store.quickCmdBtnPlugin) {
                        isSidebarCollapsed = thisVar.config.store.quickCmdBtnPlugin.sidebarCollapsed || false
                    }
                    return isSidebarCollapsed
                },
                getDisplayMode() {
                    var displayMode = 'floating'
                    if (thisVar.config.store && thisVar.config.store.quickCmdBtnPlugin) {
                        displayMode = thisVar.config.store.quickCmdBtnPlugin.displayMode || 'floating'
                    }
                    return displayMode
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
        app.use(PrimeVue);
        app.component('tabs', Tabs)
        .component('tab', Tab)
        .mount('#app');

        // 监听热键事件
        this.hotkeys.matchedHotkey.subscribe(hotkey => {
            if (hotkey === 'toggle-sidebar-mode') {
                this.toggleDisplayMode();
            }
        });

        // 根据显示模式决定是否启用拖动功能
        if (this.getDisplayMode() === 'floating') {
            // Make the DIV element draggable:
            dragElement(document.getElementById("app-parent"));
        }

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
                // console.log(e);
                if(e.target.id == "cmd-input" || e.target.classList.contains('cmd-btn-toggle-sidebar')) return;
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
                // set the element's new position:
                element.style.top = (element.offsetTop - pos2) + "px";
                element.style.left = (element.offsetLeft - pos1) + "px";
            }

            function closeDragElement() {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    }

    // 切换显示模式（浮动/侧边栏）
    toggleDisplayMode() {
        if (this.config.store && this.config.store.quickCmdBtnPlugin) {
            const currentMode = this.config.store.quickCmdBtnPlugin.displayMode || 'floating';
            this.config.store.quickCmdBtnPlugin.displayMode = currentMode === 'floating' ? 'sidebar' : 'floating';
            this.config.save();
            
            // 更新元素样式
            this.updateAppParentStyle(document.getElementById('app-parent'));
            
            // 如果切换到浮动模式，启用拖动功能
            if (this.config.store.quickCmdBtnPlugin.displayMode === 'floating') {
                // 重新加载页面以应用拖动功能
                window.location.reload();
            }
        }
    }

    // 根据显示模式更新父元素样式
    updateAppParentStyle(element) {
        const displayMode = this.getDisplayMode();
        const isSidebarCollapsed = this.getIsSidebarCollapsed();
        
        if (displayMode === 'sidebar') {
            // 侧边栏模式
            element.setAttribute("style", `
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                z-index: 99999;
                height: 100vh;
                width: ${isSidebarCollapsed ? '40px' : '250px'};
                transition: width 0.3s ease;
                display: flex;
                flex-direction: column;
            `);
        } else {
            // 浮动模式
            element.setAttribute("style", 'position:absolute;top:500px;left:1000px;z-index:99999;height:0px');
        }
    }

    // 获取显示模式
    getDisplayMode() {
        if (this.config.store && this.config.store.quickCmdBtnPlugin) {
            return this.config.store.quickCmdBtnPlugin.displayMode || 'floating';
        }
        return 'floating';
    }

    // 获取侧边栏是否折叠
    getIsSidebarCollapsed() {
        if (this.config.store && this.config.store.quickCmdBtnPlugin) {
            return this.config.store.quickCmdBtnPlugin.sidebarCollapsed || false;
        }
        return false;
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
}