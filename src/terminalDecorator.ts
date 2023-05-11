import { Injectable } from '@angular/core'
import { bufferTime } from 'rxjs'
import { TerminalDecorator, BaseTerminalTabComponent, BaseSession } from 'tabby-terminal'
import { ClippyService } from './clippy.service'


declare global {
    interface Window {
        Vue:any;
    }
}

@Injectable()
export class ClippyDecorator extends TerminalDecorator {
    // private tab: BaseTerminalTabComponent
    constructor (
        private clippy: ClippyService,
    ) {
        super()
    }

    attach (tab: BaseTerminalTabComponent): void {
        // console.log(tab)
        this.clippy.addTab(tab)
        tab.input$.pipe(bufferTime(3000)).subscribe((buffers: Buffer[])  => {
            if (Buffer.concat(buffers).toString().includes('ls\r')) {
                this.clippy.speak('It looks like you\'re using the "ls" command. Did you know that you can use it to list files?')
            }
        })
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
            for (let element of thisVar.clippy.config.store.qc.cmds) {
                if (element.group === 'auto') {
                    // console.log(data, element, thisVar.tab)
                    if (data.includes(element.name)) {
                        // this.clippy.speak('It looks like you\'ve typed in an incorrect command. Consider typing in a correct command instead.')
                        // thisVar.tab.sendInput(element.text + (element.appendCR ? "\n" : ""))
                        thisVar.clippy.sendCmdToFocusTab(element)
                        // console.log('matched, ', data)
                    }
                    else {
                        // console.log('not match')
                    }
                }
            }
        })
        
        // session.output$.subscribe(data => {
        //     if (data.includes('command not found')) {
        //         this.clippy.speak('It looks like you\'ve typed in an incorrect command. Consider typing in a correct command instead.')
        //     }
        // })
    }
}
