import { Injectable } from '@angular/core'
import { TerminalDecorator, BaseTerminalTabComponent, BaseSession } from 'tabby-terminal'
import { CmdBtnService } from './cmd_btn.service'


@Injectable()
export class QuickCmdBtnDecorator extends TerminalDecorator {
    // private tab: BaseTerminalTabComponent
    constructor (
        private quickCmdBtn: CmdBtnService,
    ) {
        super()
    }

    attach (tab: BaseTerminalTabComponent): void {
        // console.log(tab)
        this.quickCmdBtn.addTab(tab)
        tab.sessionChanged$.subscribe(session => {
            if (session) {
                this.attachToSession(session)
            }
        })
        if (tab.session) {
            this.attachToSession(tab.session)
        }
        // console.log(tab)
        // this.tab = tab
    }

    private attachToSession (session: BaseSession) {
        // console.log("attached to session", session)
        let thisVar = this
        session.output$.subscribe(data => {
            if (thisVar.quickCmdBtn.config.store){
                for (let element of thisVar.quickCmdBtn.config.store.qc.cmds) {
                    if (element.group === 'auto') {
                        // console.log(data, element, thisVar.tab)
                        if (data.includes(element.name)) {
                            // this.quickCmdBtn.speak('It looks like you\'ve typed in an incorrect command. Consider typing in a correct command instead.')
                            // thisVar.tab.sendInput(element.text + (element.appendCR ? "\n" : ""))
                            thisVar.quickCmdBtn.sendCmdToFocusTab(element)
                            // console.log('matched, ', data)
                        }
                        else {
                            // console.log('not match')
                        }
                    }
                }
            }
        })
    }
}
