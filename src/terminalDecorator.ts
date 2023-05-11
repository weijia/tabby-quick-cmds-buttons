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
    private tab: BaseTerminalTabComponent
    constructor (
        private clippy: ClippyService,
    ) {
        super()
    }

    attach (tab: BaseTerminalTabComponent): void {
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
        console.log(tab)
        this.tab = tab
    }

    private attachToSession (session: BaseSession) {
        let thisVar = this
        window.Vue.createApp({
            data() {
              let cmds = []
              for (var element of thisVar.clippy.config.store.qc.cmds) {
                // console.log(element)
                if (element.group === 'cmds') {
                    cmds.push(element)
                }
              }
              console.log("---------------------------------", cmds)
              return {
                cmds: cmds,
                dialogPos: {
                    x: 300,
                    y: 300,
                },
                dialogArea: {
                    width: 100,
                    height: 100,
                },
                isVis: true,
              }
            },
            methods: {
                sendCmd(cmd) {
                    thisVar.tab.sendInput(cmd.text + (cmd.appendCR ? "\n" : ""))
                },
                onPan(evt) {
                    console.log("onPan--------------------")
                    this.dialogPos.value.x = this.dialogPos.value.x + evt.delta.x
                    this.dialogPos.value.y = this.dialogPos.value.y + evt.delta.y
                }
            },
            mounted() {
                console.log(`the component is now mounted.`)
                // console.log(document.querySelector('#app'), this.$el, this)
                // document.querySelector('#app').parentNode["style"] = this.dialogStyle
            },
            computed: {
                dialogStyle() {
                    console.log(this.dialogPos)
                    // const res =  `top:${this.dialogPos.x}px;left:${this.dialogPos.y}px;position:absolute;z-index:99999`
                    const res =  `transform: translate(${this.dialogPos.x}px, ${this.dialogPos.y}px); width:${this.dialogArea.width}px; height:${this.dialogArea.height}px;`
                    console.log(res)
                    return res
                }
            }
        }).mount('#app')
        session.output$.subscribe(data => {
            for (var element of this.clippy.config.store.qc.cmds) {
                if (element.group === 'auto') {
                    if (data.includes(element.name)) {
                        // this.clippy.speak('It looks like you\'ve typed in an incorrect command. Consider typing in a correct command instead.')
                        this.tab.sendInput(element.text + (element.appendCR ? "\n" : ""))
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
