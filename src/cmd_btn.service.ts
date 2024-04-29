import { Injectable } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { createApp } from 'vue'
import {Tabs, Tab} from 'vue3-tabs-component';
import PrimeVue from 'primevue/config';
import 'primevue/resources/primevue.min.css';
import 'primevue/resources/themes/saga-blue/theme.css'; // Choose your preferred theme
import 'tabs-component.css';

@Injectable({ providedIn: 'root'})
export class CmdBtnService {
    public  tabs = []

    constructor (
        public config: ConfigService,
    ) {
        const div = document.createElement('div')
        div.setAttribute("style", 'position:absolute;top:500px;left:1000px;z-index:99999')
        div.setAttribute("id", 'app-parent')

        div.innerHTML= `
            <div id="app">
                <style lang="scss">
                /* Global styles */
                .tabs {
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #ccc;
                  }
                  
                  .tab {
                    padding: 10px;
                    cursor: pointer;
                  }
                  
                  .tab.active {
                    background-color: #007bff;
                    color: white;
                  }
                  
                  .tab-content {
                    padding: 10px;
                    border-top: 1px solid #ccc;
                  }
                </style>
                <div>
                    <tabs :options="{ useUrlFragment: false }" >
                        <tab v-bind:name="cmdGroup" v-for="(cmds, cmdGroup) in tabToCmds" :key="cmdGroup">
                            <div>
                                <button @click="sendCmd(cmd)" v-for="cmd in cmds" :key="cmd.name" style="margin:10px">
                                    {{ cmd.name }}
                                </button>
                            </div>
                        </tab>
                        <tab name="History" suffix=" <span class='badge'>Fixed</span>" :is-disabled="true">
                            This is the content of the second tab
                        </tab>
                    </tabs>
                </div>
            </div>
        `

        document.querySelector('body').appendChild(div)

        let thisVar = this
        
        const app = createApp({
            data() {
                let vueThis = this
                console.log("---------------------------------", vueThis)
                console.log("---------------------------------", thisVar)
                thisVar.config.ready$.subscribe(()=>{
                    console.log("---------------------------------", thisVar, thisVar.config, thisVar.config.store);
                    vueThis.tabToCmds = vueThis.updateCmds();
                });
                thisVar.config.changed$.subscribe(() => {
                    console.log('==================config changed', vueThis)
                    vueThis.tabToCmds = vueThis.updateCmds()
                })
                return {
                    tabToCmds: this.updateCmds(),
                }
            },
            methods: {
                sendCmd(cmd) {
                    // thisVar.tab.sendInput(cmd.text + (cmd.appendCR ? "\n" : ""))
                    // console.log(cmd, thisVar.tabs)
                    thisVar.sendCmdToFocusTab(cmd)
                },
                updateCmds() {
                    const tabToCmds: { [key: string]: any } = {};
                    if(thisVar.config.store){
                        for (let element of thisVar.config.store.qc.cmds) {
                            // console.log(element)
                            if (!tabToCmds.hasOwnProperty(element.group)) {
                                tabToCmds[element.group] = []
                                // console.log(JSON.stringify(tabToCmds))
                            }
                            tabToCmds[element.group].push(element)
                            // console.log(JSON.stringify(tabToCmds))
                        }
                    }
                    // console.log("returning:", tabToCmds)
                    return tabToCmds
                }
            }
        })
        app.use(PrimeVue);
        app.component('tabs', Tabs)
        .component('tab', Tab)
        .mount('#app');


        // Make the DIV element draggable:
        dragElement(document.getElementById("app-parent"));

        function dragElement(element) {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (document.getElementById(element.id + "header")) {
                // if present, the header is where you move the DIV from:
                document.getElementById(element.id + "header").onmousedown = dragMouseDown;
            } else {
                // otherwise, move the DIV from anywhere inside the DIV:
                element.onmousedown = dragMouseDown;
            }

            function dragMouseDown(e) {
                // console.log(e);
                if(e.target.id == "cmd-input") return;
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
                element.style.top = (element.offsetTop - pos2) + "px";
                element.style.left = (element.offsetLeft - pos1) + "px";
            }

            function closeDragElement() {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    }

    sendCmdToFocusTab(cmd) {
        for (let tab of this.tabs) {
            if (tab.hasFocus) {
                tab.sendInput(cmd.text + (cmd.appendCR ? "\r" : ""))
            }
        }
    }
    
    addTab (tab: any) {
        // console.log("adding tab")
        this.tabs.push(tab)
    }
}
