import { ConfigProvider } from 'tabby-core'

/** @hidden */
export class QuickCmdBtnConfigProvider extends ConfigProvider {
    defaults = {
        quickCmdBtnPlugin: {
            disableTabs: false,
            useSystemTheme: false,
            displayMode: 'floating', // 'floating' 或 'sidebar'
            sidebarCollapsed: false,
        },
        hotkeys: {
            'toggle-tabs': [],
            'toggle-sidebar-mode': [],
        },
    }
}
