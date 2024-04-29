import { ConfigProvider } from 'tabby-core'

/** @hidden */
export class QuickCmdBtnConfigProvider extends ConfigProvider {
    defaults = {
        quickCmdBtnPlugin: {
            agent: 'QuickButton',
        },
        hotkeys: {
            'toggle-tabs': [],
        },
    }
}
