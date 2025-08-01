import { Injectable } from '@angular/core'
import { ConfigService, HotkeysService } from 'tabby-core'
import { createApp } from 'vue'
// import { ref } from 'vue'
import {Tabs, Tab} from 'vue3-tabs-component';
import PrimeVue from 'primevue/config';
import 'primevue/resources/primevue.min.css';
import 'primevue/resources/themes/saga-blue/theme.css'; // Choose your preferred theme
import './tabs-component.css';

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
                <div class="cmd-btn-toggle-sidebar" @click="toggleSidebar" :class="{'sidebar-mode': displayMode === 'sidebar', 'dock-mode': displayMode === 'dock'}">
                    <span v-if="isSidebarCollapsed">»</span>
                    <span v-else>«</span>
                </div>
                <div v-show="isTabVisible===false" :class="{'use-fixed-theme': !isUseSystemTheme, 'cmd-btn-sidebar': true, 'collapsed': isSidebarCollapsed}">
                    <button @click="sendCmd(cmd)" v-for="cmd in cmds" :key="cmd.name" class="cmd-btn" style="margin:10px">
                        {{ cmd.name }}
                    </button>
                </div>
                <div v-show="isTabVisible" :class="{'use-fixed-theme': !isUseSystemTheme, 'cmd-btn-sidebar': true, 'collapsed': isSidebarCollapsed, 'sidebar-mode': displayMode === 'sidebar', 'dock-mode': displayMode === 'dock'}">
                    <tabs ref="cmdTabs" :options="{ useUrlFragment: false }" :class="{'sidebar-mode': displayMode === 'sidebar', 'dock-mode': displayMode === 'dock'}" >
                        <tab v-bind:name="cmdGroup" v-for="(cmds, cmdGroup) in tabToCmds" :key="cmdGroup">
                            <div>
                                <button @click="sendCmd(cmd)" v-for="cmd in cmds" :key="cmd.name" style="margin:10px" :class="{'btn-primary': !isUseSystemTheme, 'btn': !isUseSystemTheme}">
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
                    
                    // 更新显示模式
                    const newDisplayMode = vueThis.getDisplayMode();
                    if (vueThis.displayMode !== newDisplayMode) {
                        console.log(`显示模式已更改: ${vueThis.displayMode} -> ${newDisplayMode}`);
                        const oldDisplayMode = vueThis.displayMode;
                        vueThis.displayMode = newDisplayMode;
                        
                        // 获取app-parent元素
                        const appParent = document.getElementById('app-parent');
                        
                        // 如果从dock模式切换到其他模式，需要将元素移回到body
                        if (oldDisplayMode === 'dock' && newDisplayMode !== 'dock') {
                            try {
                                // 将元素移回到body
                                document.querySelector('body').appendChild(appParent);
                                console.log('已将元素从dock模式移回到body');
                            } catch (error) {
                                console.error('将元素从dock模式移回到body时发生错误:', error);
                            }
                        }
                        
                        // 更新父元素样式以应用新的显示模式
                        thisVar.updateAppParentStyle(appParent);
                    }
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

    // 切换显示模式（浮动/侧边栏/dock）
    toggleDisplayMode() {
        if (this.config.store && this.config.store.quickCmdBtnPlugin) {
            const currentMode = this.config.store.quickCmdBtnPlugin.displayMode || 'floating';
            
            // 在三种模式之间循环切换
            let newMode;
            if (currentMode === 'floating') {
                newMode = 'sidebar';
            } else if (currentMode === 'sidebar') {
                newMode = 'dock';
            } else {
                newMode = 'floating';
            }
            
            this.config.store.quickCmdBtnPlugin.displayMode = newMode;
            this.config.save();
            
            // 更新元素样式
            this.updateAppParentStyle(document.getElementById('app-parent'));
            
            // 如果切换到浮动模式，启用拖动功能
            if (newMode === 'floating') {
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
                width: ${isSidebarCollapsed ? '40px' : '300px'};
                transition: width 0.3s ease;
                display: flex;
                flex-direction: column;
                background-color: var(--bs-body-bg, #fff);
                border-left: 1px solid var(--bs-border-color, #ddd);
            `);
        } else if (displayMode === 'dock') {
            // 获取保存的宽度（如果有）
            let dockWidth = '300px';
            if (this.config.store && this.config.store.quickCmdBtnPlugin && this.config.store.quickCmdBtnPlugin.dockWidth) {
                dockWidth = `${this.config.store.quickCmdBtnPlugin.dockWidth}px`;
            }
            
            // Dock模式 - 将元素移动到终端内部
            element.setAttribute("style", `
                position: relative;
                z-index: 10;
                height: auto;
                width: ${dockWidth};
                display: flex;
                flex-direction: column;
                background-color: var(--bs-body-bg, #fff);
                border-left: 1px solid var(--bs-border-color, #ddd);
            `);
            
            // 将元素移动到终端内部
            this.moveElementToDock(element);
        } else {
            // 浮动模式
            element.setAttribute("style", 'position:absolute;top:500px;left:1000px;z-index:99999;height:0px');
        }
    }
    
    // 将元素移动到终端内部
    moveElementToDock(element) {
        // 在dock模式下，确保侧边栏不折叠
        if (this.config.store && this.config.store.quickCmdBtnPlugin && this.config.store.quickCmdBtnPlugin.sidebarCollapsed) {
            this.config.store.quickCmdBtnPlugin.sidebarCollapsed = false;
            this.config.save();
            console.log('在dock模式下，侧边栏默认展开');
        }
        
        // 查找content元素的父节点，以便将我们的元素与content并列
        const contentElement = document.querySelector('.content.ng-tns-c29-0');
        if (!contentElement || !contentElement.parentElement) {
            console.error('无法找到content元素或其父节点，无法进入dock模式');
            this.fallbackToSidebar(element);
            return;
        }
        
        // 获取content元素的父节点
        const parentContainer = contentElement.parentElement;
        
        try {
            // 将元素移动到content的父节点中，与content并列
            parentContainer.appendChild(element);
            
            // 设置父容器为水平布局
            const htmlParentContainer = parentContainer as HTMLElement;
            htmlParentContainer.style.display = 'flex';
            htmlParentContainer.style.flexDirection = 'row';
            
            // 获取侧边栏宽度，在dock模式下默认为300px
            let sidebarWidth = '300px';
            if (this.config.store && this.config.store.quickCmdBtnPlugin && this.config.store.quickCmdBtnPlugin.dockWidth) {
                sidebarWidth = `${this.config.store.quickCmdBtnPlugin.dockWidth}px`;
            }
            
            // 调整content元素的宽度，为我们的应用腾出空间
            // 将contentElement转换为HTMLElement类型，以便访问style属性
            const htmlContentElement = contentElement as HTMLElement;
            htmlContentElement.style.width = `calc(100% - ${sidebarWidth})`;
            
            // 设置dock窗口的样式，确保它在右侧，并且顶部与content区域对齐
            element.style.width = sidebarWidth;
            element.style.height = 'auto';
            element.style.flexShrink = '0'; // 防止dock窗口被压缩
            element.style.marginTop = '0'; // 确保顶部没有边距
            element.style.paddingTop = '0'; // 确保顶部没有内边距
            
            // 获取Vue应用的根元素
            const vueApp = document.getElementById('app');
            if (vueApp) {
                // 确保Vue应用的顶部与content区域对齐
                vueApp.style.marginTop = '0';
                vueApp.style.paddingTop = '0';
                
                // 调整tabs组件的顶部边距，使其与content区域对齐
                const tabsComponent = vueApp.querySelector('.tabs-component');
                if (tabsComponent) {
                    (tabsComponent as HTMLElement).style.marginTop = '0';
                    (tabsComponent as HTMLElement).style.paddingTop = '0';
                }
            }
            
            // 查找终端元素
            const terminalSelectors = [
                '.terminal.xterm',
                '.xterm',
                '.terminal'
            ];
            
            let terminal = null;
            for (const selector of terminalSelectors) {
                terminal = contentElement.querySelector(selector);
                if (terminal) break;
            }
            
            if (terminal) {
                // 调整终端元素的宽度
                // 将terminal转换为HTMLElement类型，以便访问style属性
                const htmlTerminal = terminal as HTMLElement;
                htmlTerminal.style.width = `100%`;
                console.log(`调整终端宽度为: 100%`);
            }
            
            // 创建可拖动的分隔条
            this.createResizer(element, contentElement, parentContainer);
            
            console.log('成功进入dock模式');
        } catch (error) {
            console.error('进入dock模式时发生错误:', error);
            this.fallbackToSidebar(element);
        }
    }
    
    // 创建可拖动的分隔条
    createResizer(sidebarElement, terminalElement, _parentContainer) {
        // 注意：_parentContainer 参数目前未使用，但保留以便将来可能的扩展
        // 检查是否已存在分隔条
        let resizer = document.getElementById('cmd-btn-resizer');
        if (resizer) {
            resizer.remove();
        }
        
        // 创建分隔条元素
        resizer = document.createElement('div');
        resizer.id = 'cmd-btn-resizer';
        
        // 设置侧边栏为相对定位，这样分隔条可以相对于它定位
        sidebarElement.style.position = 'relative';
        
        // 设置分隔条样式
        resizer.style.cssText = `
            width: 5px;
            height: 100%;
            background-color: var(--bs-border-color, #ddd);
            cursor: col-resize;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 100;
        `;
        
        // 将分隔条添加到侧边栏元素中
        sidebarElement.appendChild(resizer);
        
        // 添加拖动事件处理
        let startX, startWidth;
        
        const startDrag = (e) => {
            e.preventDefault(); // 防止文本选择
            e.stopPropagation(); // 阻止事件冒泡
            startX = e.clientX;
            startWidth = parseInt(getComputedStyle(sidebarElement).width, 10);
            document.addEventListener('mousemove', doDrag);
            document.addEventListener('mouseup', stopDrag);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        };
        
        const doDrag = (e) => {
            e.preventDefault(); // 防止文本选择
            e.stopPropagation(); // 阻止事件冒泡
            const dx = e.clientX - startX;
            const newSidebarWidth = Math.max(100, Math.min(500, startWidth - dx)); // 限制宽度在100px到500px之间
            
            // 更新侧边栏宽度
            sidebarElement.style.width = `${newSidebarWidth}px`;
            
            // 更新终端宽度
            terminalElement.style.width = `calc(100% - ${newSidebarWidth}px)`;
            
            // 确保分隔条始终位于侧边栏的左侧边缘
            resizer.style.left = '0';
            
            // 更新Vue应用内部的布局
            // 获取Vue应用的根元素
            const vueApp = document.getElementById('app');
            if (vueApp) {
                // 更新Vue应用的宽度
                vueApp.style.width = '100%';
                
                // 更新tabs组件的宽度
                const tabsComponent = vueApp.querySelector('.tabs-component');
                if (tabsComponent) {
                    (tabsComponent as HTMLElement).style.width = '100%';
                }
                
                // 更新tabs面板的宽度
                const tabsPanels = vueApp.querySelector('.tabs-component-panels');
                if (tabsPanels) {
                    (tabsPanels as HTMLElement).style.width = `calc(100% - 120px)`; // 减去tabs列表的宽度
                }
                
                // 更新按钮区域的宽度
                const buttonAreas = vueApp.querySelectorAll('.tabs-component-panel');
                buttonAreas.forEach(area => {
                    (area as HTMLElement).style.width = '100%';
                });
            }
            
            // 保存当前宽度到配置
            if (this.config.store && this.config.store.quickCmdBtnPlugin) {
                this.config.store.quickCmdBtnPlugin.dockWidth = newSidebarWidth;
            }
        };
        
        const stopDrag = () => {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            // 确保分隔条位置正确
            resizer.style.left = '0';
            
            // 保存配置
            if (this.config.store && this.config.store.quickCmdBtnPlugin) {
                this.config.save();
            }
            
            // 拖动结束后，确保 terminalElement 和 tab-body 的大小正确
            const newSidebarWidth = parseInt(getComputedStyle(sidebarElement).width, 10);
            terminalElement.style.width = `calc(100% - ${newSidebarWidth}px)`;
            
            // 调整 terminalElement 内部的 tab-body 宽度
            const tabBody = terminalElement.querySelector('.content-tab');
            if (tabBody) {
                tabBody.style.width = `calc(100% - ${newSidebarWidth}px)`;
            }
        };
        
        resizer.addEventListener('mousedown', startDrag);
        
        // 应用保存的宽度（如果有）
        if (this.config.store && this.config.store.quickCmdBtnPlugin && this.config.store.quickCmdBtnPlugin.dockWidth) {
            const savedWidth = this.config.store.quickCmdBtnPlugin.dockWidth;
            sidebarElement.style.width = `${savedWidth}px`;
            terminalElement.style.width = `calc(100% - ${savedWidth}px)`;
        }
    }
    
    // 回退到侧边栏模式
    fallbackToSidebar(element) {
        console.log('回退到侧边栏模式');
        if (this.config.store && this.config.store.quickCmdBtnPlugin) {
            this.config.store.quickCmdBtnPlugin.displayMode = 'sidebar';
            this.config.save();
            this.updateAppParentStyle(element);
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