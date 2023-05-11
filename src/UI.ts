import { GamepadManager } from "./gamepad-manager";
import { ROM } from "./rom-model";
import { TypedEvent } from "./typed-event";

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
  gamepadSelect = document.querySelector<HTMLSelectElement>("#gamepadSelect")!;
  romUpload = document.querySelector<HTMLSelectElement>("#romUpload")!;
  romTitle = document.querySelector<HTMLSpanElement>("#rom-title")!;
  romDescription = document.querySelector<HTMLSpanElement>("#rom-description")!;
  buzzers = document.querySelector<HTMLUListElement>("#buzzers")!;
  states = document.querySelector<HTMLDivElement>('#states')!;
  saveStateButton = document.querySelector<HTMLButtonElement>('#save-state-button')!;

  keymap: { [key: string]: number };
  customKeymap: { [key: string]: number };
  romList: Array<ROM>;

  gamepadManager: GamepadManager;
  gamepadIndex: number | null;

  public onKeyStateChange?: (key: number, pressed: boolean) => void;
  public onReset?: () => void;
  public onRomUploaded?: (filename: string, romData: Uint8Array) => void;
  public onRomSelected?: (rom: ROM) => void;
  public onSaveLoadState = new TypedEvent<number>();

  constructor(keymap: { [key: string]: number }) {

    this.keymap = keymap;
    this.customKeymap = {};
    this.gamepadManager = new GamepadManager();
  }

  /**
   * Bind events to DOM elements
   */
  public bindEvents(): void {

    this.resetButton.addEventListener("click", () => this.onResetClick(this));

    this.debuggerButton.addEventListener("click", () => this.onDebuggerClick(this.app));

    this.romUpload.addEventListener("click", () => this.onRomUploadClick(this));

    this.fileInput.addEventListener("change", () => this.onFileInputChange(this));

    this.romSelect.addEventListener("change", () => this.onSelectRomChange());

    document.addEventListener("keydown", (event: KeyboardEvent) => this.onDocumentKeyDown(event, this));
    document.addEventListener("keyup", (event: KeyboardEvent) => this.onDocumentKeyUp(event, this));

    this.gamepadManager.connected.on(gamepad => this.updateGamepadList(gamepad, true));
    this.gamepadManager.disconnected.on(gamepad => this.updateGamepadList(gamepad, false));

    this.gamepadSelect.addEventListener("change", () => this.onGamepadSelect());

    document.addEventListener('keypress', (event: KeyboardEvent) => this.onDocumentKeyPress(event.code));

    this.saveStateButton.addEventListener('click', () => this.saveLoadState(null));
  }

  /**
   * Reset button click event
   * @param ui 
   */
  public onResetClick(ui: UI): void {

    if (ui.onReset) ui.onReset();
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

    const key = ui.keymap[event.key] ?? ui.customKeymap[event.key];
    ui.setKeyState(key, true);
  }

  /**
   * 
   * @param event 
   */
  private onDocumentKeyUp(event: KeyboardEvent, ui: UI): void {

    const key = ui.keymap[event.key] ?? ui.customKeymap[event.key];
    ui.setKeyState(key, false);
  }

  /**
   * Document keypress event.
   * @param key 
   */
  private onDocumentKeyPress(key: string): void {

    if (key == 'Space') this.takeScreenshot();

    if (key.indexOf('Digit') >= 0) {

      const stateNum = parseInt(key.replace('Digit', ''));

      if(!stateNum) return;

      this.saveLoadState(stateNum);
    }
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

    if (!ui.fileInput.files || this.fileInput.files?.length == 0)
      return;

    const file = this.fileInput.files![0];

    var reader = new FileReader();

    reader.onload = function (e: ProgressEvent<FileReader>) {

      const buffer = new Uint8Array(<ArrayBuffer>e.target!.result);

      if (ui.onRomUploaded) ui.onRomUploaded(file.name, buffer);

      ui.romSelect.selectedIndex = 0;
    };

    reader.onerror = () => alert(`Error loading ROM`);

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

    const haveCustomKeymap = Object.keys(this.customKeymap).length > 0;

    const keyboardTable = document.querySelector<HTMLTableElement>('#keyboard')!;

    keyboardTable.innerHTML = '';

    let tr = null;

    for (let index = 0; index < keyboardLayout.length; index++) {

      const key = keyboardLayout[index];
      const mapped = Object.keys(this.customKeymap).find(f => this.customKeymap[f] == key);
      const td = document.createElement('td');
      const button = document.createElement('button')!;

      let buttonText = '';

      switch (mapped) {
        case 'ArrowUp': buttonText = '↑'; break;
        case 'ArrowDown': buttonText = '↓'; break;
        case 'ArrowLeft': buttonText = '←'; break;
        case 'ArrowRight': buttonText = '→'; break;
        case 'Enter': buttonText = '↵'; break;
        default: buttonText = (key).toString(16).toUpperCase();
      }

      button.innerText = buttonText;
      button.setAttribute('key', key.toString());
      button.addEventListener('mousedown', () => this.setKeyState(key, true));
      button.addEventListener('mouseup', () => this.setKeyState(key, false));

      if (haveCustomKeymap) {

        button.className = mapped ? 'mapped' : 'not-mapped';
      }


      td.appendChild(button);

      if (index % 4 == 0) {
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

    if (!button) return;

    button.className = state ? 'active' : '';

    if (this.onKeyStateChange) this.onKeyStateChange(key, state);
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

  /**
   * Set buzzers state
   * @param on 
   */
  public setBuzzers(on: boolean): void {

    this.buzzers.className = `buzzers ${on ? 'beep' : ''}`;
  }

  /**
   * Create options for ROMS
   * @param romList 
   */
  public setRomList(romList: Array<ROM>): void {

    this.romList = romList;

    for (let index in this.romList) {

      const rom = this.romList[index];

      const option = document.createElement("option");
      option.value = index;
      option.text = rom.title;

      this.romSelect.appendChild(option);
    }
  }

  /**
   * On ROM selected
   */
  private onSelectRomChange(): void {

    if (this.romSelect.selectedIndex == 0) return;

    const selectedOption = this.romSelect.selectedOptions[0];
    const rom = this.romList[Number(selectedOption.value)];

    if (this.onRomSelected) this.onRomSelected(rom);

    this.romSelect.blur();
  }

  /**
   * Set ROM custom keymap
   * @param keymap 
   */
  public setCustomKeymap(keymap: { [key: string]: number }): void {

    this.customKeymap = keymap || {};

    this.initializeKeyboard();
  }

  /**
   * Update the gamepad select element
   * @param gamepad 
   * @param connected 
   */
  private updateGamepadList(gamepad: globalThis.Gamepad, connected: boolean) {

    const defaultOption: HTMLOptionElement = Array.prototype.slice.call(this.gamepadSelect.options)
      .find(option => option.value == "default");

    const selectOption: HTMLOptionElement = Array.prototype.slice.call(this.gamepadSelect.options)
      .find(option => option.value == "select");

    if (connected) {

      this.gamepadSelect.disabled = false;
      defaultOption.hidden = true;
      selectOption.hidden = false;

      if (this.gamepadSelect.selectedIndex == 0) this.gamepadSelect.selectedIndex = 1;

      // add gamepad option
      const gamepadOption = document.createElement('option');
      gamepadOption.value = gamepad.index.toString();
      gamepadOption.text = gamepad.id;
      this.gamepadSelect.appendChild(gamepadOption);
    }
    else {

      // remove gamepad option
      const gamepadOption: HTMLOptionElement = Array.prototype.slice.call(this.gamepadSelect.options)
        .find(option => option.value == gamepad.index.toString());
      this.gamepadSelect.removeChild(gamepadOption);

      if (this.gamepadSelect.options.length == 2) {

        this.gamepadSelect.disabled = true;
        defaultOption.hidden = false;
        selectOption.hidden = true;
        this.gamepadSelect.selectedIndex = 0;
      }
    }
  }

  /**
   * On gamepad selected event.
   */
  private onGamepadSelect(): void {

    if (this.gamepadSelect.selectedIndex <= 1) {

      this.gamepadIndex = null;
      return;
    }

    this.gamepadIndex = parseInt(this.gamepadSelect.selectedOptions[0].value);

    setInterval(() => this.updateInputs(), 2000);
    this.updateInputs()
  }

  /**
   * Update inputs (gamepad).
   */
  public updateInputs(): void {

    if (this.gamepadIndex == null) return;

    const gamepad = this.gamepadManager.getGamepad(this.gamepadIndex)

    if (!gamepad) return;

    //gamepad.buttons.forEach((button: GamepadButton, index: number) => {
      // TODO: implement buttons
    //});

    let up = false, down = false;
    let left = false, right = false;

    gamepad.axes.forEach((axis: number, index: number) => {

      const horizontalAxe = index % 2 == 0;

      if (horizontalAxe && !left && !right) {

        left = axis < -0.5;
        right = axis > 0.5;
      }

      if (!horizontalAxe && !up && !down) {

        up = axis < -0.5;
        down = axis > 0.5;
      }
    });

    const keyUp = this.customKeymap['ArrowUp'];
    if (keyUp) this.setKeyState(keyUp, up);

    const keyDown = this.customKeymap['ArrowDown'];
    if (keyDown) this.setKeyState(keyDown, down);

    const keyLeft = this.customKeymap['ArrowLeft'];
    if (keyUp) this.setKeyState(keyLeft, left);

    const keyRight = this.customKeymap['ArrowRight'];
    if (keyRight) this.setKeyState(keyRight, right);
  }

  /**
   * Create canvas image and download.
   */
  private takeScreenshot(): void {

    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', 'screenshot.png');

    this.canvas.toBlob((blob: Blob | null) => {

      if (!blob) {
        alert('Error generating image.');
        return;
      }

      let url = URL.createObjectURL(blob);
      downloadLink.setAttribute('href', url);
      downloadLink.click();
    });
  }

  /**
   * Save or load state.
   * @param stateNum 
   */
  private saveLoadState(stateNum: number | null): void {

    if(!stateNum) {

      // check next available slot
      for(let i = 1; i <= 9; i++) {

        const buttonCheck = document.querySelector<HTMLButtonElement>(`#state-${i}-load`);

        if(!buttonCheck) {

          stateNum = i;
          break;
        }
      }
    }

    if(!stateNum) return;

    const buttonId = `state-${stateNum}-load`;

    // check if stateNum-load-button exists
    let button = document.querySelector<HTMLButtonElement>(`#${buttonId}`);

    if(!button) {

      button = document.createElement('button');
      button.id = buttonId;
      button.innerText = `LOAD #${stateNum}`;
      button.addEventListener('click', () => this.saveLoadState(stateNum));
      this.states.appendChild(button);
    }

    this.onSaveLoadState.emit(stateNum);
  }
}
