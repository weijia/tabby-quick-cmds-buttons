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
        div.setAttribute("style", 'position:absolute;top:300px;left:300px;z-index:99999')
        //const newContent = document.createTextNode("Hi there and greetings!");
        // add the text node to the newly created div
        //div.appendChild(newContent);

        div.innerHTML= `

        <script type="importmap">
        {
          "imports": {
            "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
          }
        }
      </script>
      
      <div id="app">{{ message }}</div>
      
      <script>
      window.addEventListener("load", function(event) {

      
        Vue.createApp({
          data() {
            return {
              message: 'Hello Vue!'
            }
          }
        }).mount('#app')
        // here is the Vue code
      });
      </script>
        `

        document.querySelector('body').appendChild(div)


        setInterval(() => {
            this.agent?.animate()
        }, 10000)

        hotkeys.hotkey$.subscribe(h => {
            if (h === 'toggle-clippy') {
                this.toggle()
            }
        })
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
