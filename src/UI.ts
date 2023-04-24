export class UI {

    app = document.querySelector<HTMLDivElement>('#app')!;
    resetButton = document.querySelector("#resetButton")!;
    debuggerButton = document.querySelector("#debuggerButton")!;
    powerLed = document.querySelector("#power-led")!;
    tapeLed = document.querySelector("#tape-led")!;
    runLed = document.querySelector("#run-led")!;
    canvas = document.querySelector("canvas")!;

    keymap: {[key: string]: number};

    public onKeyStateChange?: (key: number, pressed: boolean) => void;
    public onReset?: () => void;

    constructor(keymap: {[key: string]: number}) {

      this.keymap = keymap;
    }

    /**
     * Bind events to DOM elements
     */
    public bindEvents(): void {

      this.resetButton.addEventListener("click", () => this.onResetClick(this));

      this.debuggerButton.addEventListener("click", () => this.onDebuggerClick(this.app));

      document.addEventListener("keydown", (event: KeyboardEvent) => this.onDocumentKeyDown(event, this));
        
      document.addEventListener("keyup", (event: KeyboardEvent) => this.onDocumentKeyUp(event, this));
    }

    /**
     * Reset button click event
     * @param ui 
     */
    public onResetClick(ui: UI): void {

      if(ui.onReset) ui.onReset();
    }

    /**
     * Debugger button click event
     * @param app 
     */
    private onDebuggerClick(app: HTMLDivElement): void {

        app.className = app.className == "debug" ? "" : "debug";
    }

    /**
     * 
     * @param event 
     */
    private onDocumentKeyDown(event: KeyboardEvent, ui: UI): void {

      const key = ui.keymap[event.key] - 1;
      ui.setKeyState(key, true);
    }

    /**
     * 
     * @param event 
     */
    private onDocumentKeyUp(event: KeyboardEvent, ui: UI): void {

      const key = ui.keymap[event.key] - 1;
      ui.setKeyState(key, false);
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
              this.setKeyState(key - 1, true);
            });
        
            button.addEventListener('mouseup', () => {
              this.setKeyState(key - 1, false);
            });
        
            td.appendChild(button);
        
            if(index % 4 == 0) {
              tr = document.createElement('tr');
              keyboardTable.appendChild(tr);
            }
        
            tr!.appendChild(td);
          }
    }

    /**
     * Change buttons state and emit event to App
     * @param key 
     * @param state 
     */
    private setKeyState(key: number, state: boolean): void {

      const button = document.querySelector(`button[key="${key}"]`);

      if(!button) return;
    
      button.className = state ? 'active' : '';

      if(this.onKeyStateChange) this.onKeyStateChange(key, state);
    }
    
}
