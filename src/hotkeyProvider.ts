import { Injectable } from '@angular/core'
import { HotkeyDescription, HotkeyProvider } from 'tabby-core'

/** @hidden */
@Injectable()
export class QuickCmdBtnHotkeyProvider extends HotkeyProvider {
    async provide (): Promise<HotkeyDescription[]> {
        return [
            {
                id: 'toggle-quick-cmd-btn',
                name: 'Show/hide QuickCmdBtn',
            },
        ]
    }
}
