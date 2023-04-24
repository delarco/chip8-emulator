export class UI {

    app = document.querySelector<HTMLDivElement>('#app')!;
    resetButton = document.querySelector<HTMLButtonElement>("#resetButton")!;
    debuggerButton = document.querySelector<HTMLButtonElement>("#debuggerButton")!;
    powerLed = document.querySelector<HTMLDivElement>("#power-led")!;
    tapeLed = document.querySelector<HTMLDivElement>("#tape-led")!;
    runLed = document.querySelector<HTMLDivElement>("#run-led")!;
    canvas = document.querySelector<HTMLCanvasElement>("canvas")!;
    fileInput = document.querySelector<HTMLInputElement>("#fileInput")!;
    romSelect = document.querySelector<HTMLSelectElement>("#romSelect")!;
    romUpload = document.querySelector<HTMLSelectElement>("#romUpload")!;
    romTitle = document.querySelector<HTMLSpanElement>("#rom-title")!;
    romDescription = document.querySelector<HTMLSpanElement>("#rom-description")!;

    keymap: {[key: string]: number};

    public onKeyStateChange?: (key: number, pressed: boolean) => void;
    public onReset?: () => void;
    public onRomUploaded?: (filename: string, romData: Uint8Array) => void;

    constructor(keymap: {[key: string]: number}) {

      this.keymap = keymap;
    }

    /**
     * Bind events to DOM elements
     */
    public bindEvents(): void {

      this.resetButton.addEventListener("click", () => this.onResetClick(this));

      this.debuggerButton.addEventListener("click", () => this.onDebuggerClick(this.app));

      this.romUpload.addEventListener("click", () => this.onRomUploadClick(this));

      this.fileInput.addEventListener("change", () => this.onFileInputChange(this));

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
     * @param event return response.arrayBuffer();
     */
    private onDocumentKeyDown(event: KeyboardEvent, ui: UI): void {

      const key = ui.keymap[event.key];
      ui.setKeyState(key, true);
    }

    /**
     * 
     * @param event 
     */
    private onDocumentKeyUp(event: KeyboardEvent, ui: UI): void {

      const key = ui.keymap[event.key];
      ui.setKeyState(key, false);
    }

    /**
     * ROM upload button click event
     * @param ui 
     */
    private onRomUploadClick(ui: UI): void {

      ui.fileInput.click();
    }

    /**
     * ROM file selected
     * @param ui 
     * @returns 
     */
    private onFileInputChange(ui: UI): void {

      if(!ui.fileInput.files || this.fileInput.files?.length == 0)
        return;
      
      const file = this.fileInput.files![0];

      var reader = new FileReader();
  
      reader.onload = function(e: ProgressEvent<FileReader>) {

        const buffer = new Uint8Array(<ArrayBuffer>e.target!.result);

        if(ui.onRomUploaded) ui.onRomUploaded(file.name, buffer);
      };
    
      reader.onerror = (e) => console.log('Error : ' + e.type);

      reader.readAsArrayBuffer(file);
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
            button.setAttribute('key', key.toString());
        
            button.addEventListener('mousedown', () => {
              this.setKeyState(key, true);
            });
        
            button.addEventListener('mouseup', () => {
              this.setKeyState(key, false);
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

    /**
     * Edit rom info
     * @param title 
     * @param desription 
     */
    public setRomInfo(title: string, description: string): void {

      this.romTitle.innerText = title;
      this.romDescription.innerText = description;
    }

    /**
     * Set power led state
     * @param on 
     */
    public setPowerLed(on: boolean): void {

      this.powerLed.className = `led ${on ? 'active' : ''}`;
    }

    /**
     * Set tape led state
     * @param on 
     */
    public setTapeLed(on: boolean): void {

      this.tapeLed.className = `led ${on ? 'active' : ''}`;
    }

    /**
     * Set run led state
     * @param on 
     */
    public setRunLed(on: boolean): void {

      this.runLed.className = `led ${on ? 'active' : ''}`;
    }
}
