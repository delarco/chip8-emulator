export class UI {

    app = document.querySelector<HTMLDivElement>('#app')!;
    resetButton = document.querySelector("#resetButton")!;
    debuggerButton = document.querySelector("#debuggerButton")!;
    powerLed = document.querySelector("#power-led")!;
    tapeLed = document.querySelector("#tape-led")!;
    runLed = document.querySelector("#run-led")!;
    canvas = document.querySelector("canvas")!;

    /**
     * Bind events to DOM elements
     */
    public bindEvents(): void {

        this.debuggerButton.addEventListener("click", () => this.onDebuggerClick(this.app));
    }

    /**
     * Debugger button click event
     * @param app 
     */
    private onDebuggerClick(app: HTMLDivElement): void {

        app.className = app.className == "debug" ? "" : "debug";
    }

    /**
     * Initialize canvas dimensions
     */
    public initializeCanvas(displayWidth: number, displayHeight: number, pixelSize: number): void {

        this.canvas.width = displayWidth * pixelSize;
        this.canvas.height = displayHeight * pixelSize;
    }

    /**
     * Generate keyboard table and bind click event
     */
    public initializeKeyboard(): void {

        const keyboardLayout = [
            0x1, 0x2, 0x3, 0xC,
            0x4, 0x5, 0x6, 0xD,
            0x7, 0x8, 0x9, 0xE,
            0xA, 0x0, 0xB, 0xF
          ];

        const keyboardTable = document.querySelector<HTMLTableElement>('#keyboard')!;

        let tr = null;

        for(let index = 0; index < keyboardLayout.length; index++) {

            const key = keyboardLayout[index];
            const td = document.createElement('td');
            const button = document.createElement('button')!;
            
            button.innerText = (key).toString(16).toUpperCase();
            button.setAttribute('key', (key-1).toString());
        
            button.addEventListener('mousedown', () => {
              button.className = "active";
            });
        
            button.addEventListener('mouseup', () => {
              button.className = "";
            });
        
            td.appendChild(button);
        
            if(index % 4 == 0) {
              tr = document.createElement('tr');
              keyboardTable.appendChild(tr);
            }
        
            tr!.appendChild(td);
          }
    }
}
