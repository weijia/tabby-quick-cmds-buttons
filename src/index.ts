import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import TabbyCoreModule, { ConfigProvider, HotkeyProvider, TabContextMenuItemProvider } from 'tabby-core'
import { TerminalDecorator } from 'tabby-terminal'
import { SettingsTabProvider } from 'tabby-settings'

import { QuickCmdBtnConfigProvider } from './configProvider'
import { QuickCmdBtnSettingsTabProvider } from './settingsTabProvider'
import { QuickCmdBtnSettingsTabComponent } from './settingsTab.component'
import { QuickCmdBtnDecorator } from './terminalDecorator'
import { QuickCmdBtnHotkeyProvider } from './hotkeyProvider'
import { QuickCmdBtnContextMenuProvider } from './contextMenu'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TabbyCoreModule,
    ],
    providers: [
        { provide: TabContextMenuItemProvider, useClass: QuickCmdBtnContextMenuProvider, multi: true },
        { provide: HotkeyProvider, useClass: QuickCmdBtnHotkeyProvider, multi: true },
        { provide: ConfigProvider, useClass: QuickCmdBtnConfigProvider, multi: true },
        { provide: SettingsTabProvider, useClass: QuickCmdBtnSettingsTabProvider, multi: true },
        { provide: TerminalDecorator, useClass: QuickCmdBtnDecorator, multi: true },
    ],
    entryComponents: [
        QuickCmdBtnSettingsTabComponent,
    ],
    declarations: [
        QuickCmdBtnSettingsTabComponent,
    ],
})
export default class QuickCmdBtnModule { }
