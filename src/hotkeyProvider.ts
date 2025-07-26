import { Injectable } from '@angular/core'
import { HotkeyDescription, HotkeyProvider } from 'tabby-core'

/** @hidden */
@Injectable()
export class QuickCmdBtnHotkeyProvider extends HotkeyProvider {
    async provide (): Promise<HotkeyDescription[]> {
        return [
            {
                id: 'toggle-quick-cmd-btn',
                name: '显示/隐藏快速命令按钮',
            },
            {
                id: 'toggle-sidebar-mode',
                name: '切换侧边栏模式',
            },
        ]
    }
}
