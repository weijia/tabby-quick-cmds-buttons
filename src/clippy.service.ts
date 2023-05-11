import clippy from 'clippyjs'
import { distinctUntilChanged, map } from 'rxjs'
import { Injectable } from '@angular/core'
import { Logger, LogService, ConfigService, HotkeysService } from 'tabby-core'

const CDN = 'https://gitee.com/weijia432/clippyjs/raw/master/'

@Injectable({ providedIn: 'root'})
export class ClippyService {
    private visible = true
    private agent: any
    private logger: Logger
    public  tabs = []

    constructor (
        public config: ConfigService,
        log: LogService,
        hotkeys: HotkeysService,
    ) {
        this.logger = log.create('clippy')

        this.loadAgent()
        this.config.changed$.pipe(
            map(() => this.config.store.clippyPlugin.agent),
            distinctUntilChanged(),
        ).subscribe(() => this.loadAgent())

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = `${CDN}/assets/clippy.css`
        document.querySelector('head').appendChild(link)

        const vueScript = document.createElement('script')
        vueScript.src = 'https://cdn.staticfile.org/vue/3.0.5/vue.global.js'
        document.querySelector('head').appendChild(vueScript)

        const div = document.createElement('div')
        div.setAttribute("style", 'position:absolute;top:800px;left:1000px;z-index:99999')
        div.setAttribute("id", 'app-parent')
        //const newContent = document.createTextNode("Hi there and greetings!");
        // add the text node to the newly created div
        //div.appendChild(newContent);

        div.innerHTML= `
            <div id="app">
                        <label @click="sendCmd(cmd)" v-for="cmd in cmds" :key="cmd.name" style="margin:10px">
                            {{ cmd.name }}
                        </label>
            </div>
        `

        document.querySelector('body').appendChild(div)

        let thisVar = this
        
        
        function initVue(){
            console.log(window.Vue)
            if (!window.Vue) {
                setTimeout(initVue, 1000);
                return
            }
            window.Vue.createApp({
                data() {
                  let cmds = []
                  for (let element of thisVar.config.store.qc.cmds) {
                    // console.log(element)
                    if (element.group === 'cmds') {
                        cmds.push(element)
                    }
                  }
                  console.log("---------------------------------", cmds)
                  return {
                    cmds: cmds,
                  }
                },
                methods: {
                    sendCmd(cmd) {
                        // thisVar.tab.sendInput(cmd.text + (cmd.appendCR ? "\n" : ""))
                        console.log(cmd, thisVar.tabs)
                        for (let tab of thisVar.tabs) {
                            if (tab.hasFocus) {
                                tab.sendInput(cmd.text + (cmd.appendCR ? "\n" : ""))
                            }
                        }
                    },
                }
            }).mount('#app')
        }
        setTimeout(initVue, 1000);

        // Make the DIV element draggable:
        dragElement(document.getElementById("app-parent"));

        function dragElement(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (document.getElementById(elmnt.id + "header")) {
            // if present, the header is where you move the DIV from:
            document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
        }

        setInterval(() => {
            this.agent?.animate()
        }, 10000)

        hotkeys.hotkey$.subscribe(h => {
            if (h === 'toggle-clippy') {
                this.toggle()
            }
        })
    }

    addTab (tab: any) {
        console.log("adding tab")
        this.tabs.push(tab)
    }

    async loadAgent () {
        const type = this.config.store.clippyPlugin.agent
        this.logger.info(`Loading agent: ${type}`)
        await this.hide()
        clippy.load(type, agent => {
            this.agent = agent
            this.visible = true
            agent.show()
            this.speak('Hello!')
        }, undefined, `${CDN}/assets/agents/`)
    }

    show () {
        if (!this.agent) {
            return
        }
        this.agent.show()
        this.visible = true
        this.logger.info('Shown clippy')
    }

    async hide () {
        if (!this.agent) {
            return
        }
        await new Promise(r => this.agent.hide(false, r))
        this.visible = false
        this.logger.info('Hidden clippy')
    }

    async toggle () {
        if (this.visible) {
            await this.hide()
        } else {
            await this.show()
        }
    }

    speak (what: string) {
        this.logger.info(`Speaking: ${what}`)
        this.agent?.speak(what)
    }
}
