import { Injectable } from '@angular/core'
import { MenuItemOptions } from 'tabby-core'
import { BaseTerminalTabComponent, TerminalContextMenuItemProvider } from 'tabby-terminal'
import { CmdBtnService } from './cmd_btn.service'

@Injectable()
export class ClippyContextMenuProvider extends TerminalContextMenuItemProvider {
    weight = 10

    constructor (
        private clippy: CmdBtnService,
    ) {
        super()
    }

    async getItems (tab: BaseTerminalTabComponent): Promise<MenuItemOptions[]> {
        return [
            {
                label: 'Toggle Clippy',
                click: () => {
                    console.log(this.clippy, tab)
                },
            },
        ]
    }
}
