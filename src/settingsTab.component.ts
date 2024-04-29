import { Component } from '@angular/core'
import { ConfigService } from 'tabby-core'

/** @hidden */
@Component({
    template: require('./settingsTab.component.pug'),
})
export class QuickCmdBtnSettingsTabComponent {
    agents = [
        'Bonzi',
        'QuickCmdBtn',
        'F1',
        'Genie',
        'Genius',
        'Links',
        'Merlin',
        'Peedy',
        'Rocky',
        'Rover',
    ]

    constructor (
        public config: ConfigService,
    ) { }
}
