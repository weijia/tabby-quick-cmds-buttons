import { Injectable } from '@angular/core'
import { SettingsTabProvider } from 'tabby-settings'

import { QuickCmdBtnSettingsTabComponent } from './settingsTab.component'

/** @hidden */
@Injectable()
export class QuickCmdBtnSettingsTabProvider extends SettingsTabProvider {
    id = 'QuickCmdBtn'
    icon = 'paperclip'
    title = 'Quick Cmd Buttons'

    getComponentType (): any {
        return QuickCmdBtnSettingsTabComponent
    }
}
