import { Injectable } from '@angular/core'
import { SettingsTabProvider } from 'tabby-settings'

import { ClippySettingsTabComponent } from './settingsTab.component'

/** @hidden */
@Injectable()
export class ClippySettingsTabProvider extends SettingsTabProvider {
    id = 'clippy'
    icon = 'paperclip'
    title = 'Quick Cmd Buttons'

    getComponentType (): any {
        return ClippySettingsTabComponent
    }
}
