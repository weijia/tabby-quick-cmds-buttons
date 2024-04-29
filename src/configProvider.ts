import { ConfigProvider } from 'tabby-core'

/** @hidden */
export class QuickCmdBtnConfigProvider extends ConfigProvider {
    defaults = {
        quickCmdBtnPlugin: {
            disableTabs: false,
        },
        hotkeys: {
            'toggle-tabs': [],
        },
    }
}
