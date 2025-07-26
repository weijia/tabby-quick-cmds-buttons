import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'

/** @hidden */
@Component({
    template: require('./settingsTab.component.pug'),
})
export class QuickCmdBtnSettingsTabComponent {
    displayModes = [
        { id: 'floating', name: '浮动模式' },
        { id: 'sidebar', name: '侧边栏模式' },
    ]

    constructor (
        public config: ConfigService,
    ) {
        // 确保配置项存在
        if (!this.config.store.quickCmdBtnPlugin) {
            this.config.store.quickCmdBtnPlugin = {};
        }
        
        // 设置默认值
        if (this.config.store.quickCmdBtnPlugin.displayMode === undefined) {
            this.config.store.quickCmdBtnPlugin.displayMode = 'floating';
        }
        
        if (this.config.store.quickCmdBtnPlugin.sidebarCollapsed === undefined) {
            this.config.store.quickCmdBtnPlugin.sidebarCollapsed = false;
        }
    }
}
