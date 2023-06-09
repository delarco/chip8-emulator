import { Audio } from "./audio";
import { Chip8 } from "./chip8/chip8";
import { Chip8CpuState } from "./chip8/chip8-cpu-state";
import { keymap } from "./keymap";
import { Renderer } from "./renderer";
import { ROM } from "./rom-model";
import { UI } from "./UI";

export class App {

    PIXEL_SIZE = 10;
    ROM_DIR = 'roms'
    ROM_LIST = `${this.ROM_DIR}/roms.json`;

    ui = new UI(keymap);
    chip8 = new Chip8();
    renderer = new Renderer();
    audio = new Audio();

    lastRomData: Uint8Array;

    states: {[key: number]: Chip8CpuState} = {};

    constructor() {
        
        this.ui.bindEvents();

        this.loadRomList(this.ROM_LIST)

        this.ui.initializeCanvas(this.chip8.SCREEN_WIDTH, this.chip8.SCREEN_HEIGHT, this.PIXEL_SIZE);
        this.ui.initializeKeyboard();
        this.ui.onKeyStateChange = (key: number, pressed: boolean) => this.onKeyStateChange(key, pressed);
        this.ui.onReset = () => this.onReset(this);
        this.ui.onRomUploaded = (filename: string, romData: Uint8Array) => this.onRomUploaded(filename, romData);
        this.ui.onRomSelected = (rom: ROM) => this.onRomSelected(rom);
        this.ui.onSaveLoadState.on(stateNum => this.onSaveLoadState(stateNum));

        this.chip8.onRedraw = () => this.onScreenRedraw();
        this.chip8.onPlaySound = () => this.onPlaySound();
        this.chip8.onStopSound = () => this.onStopSound();
        this.chip8.requestInputUpdate.on(() => this.ui.updateInputs());

        this.renderer.initialize(this.chip8.SCREEN_WIDTH, this.chip8.SCREEN_HEIGHT, this.PIXEL_SIZE);

        this.ui.setPowerLed(true);
    }

    /**
     * UI Event for keydown/keyup
     * @param key 
     * @param pressed 
     */
    private onKeyStateChange(key: number, pressed: boolean): void {
        
        if(this.chip8.keys) {
            
            this.chip8.keys[key] = pressed ? 1 : 0;
        }
    }

    /**
     * Reset CPU
     */
    public onReset(app: App): void {

        app.chip8.stop();
        app.chip8.initialize();
        app.renderer.clear();

        app.ui.setTapeLed(false);
        app.ui.setRunLed(false);

        if(app.lastRomData) {

            app.chip8.loadROM(app.lastRomData);
            app.chip8.run();

            app.ui.setTapeLed(true);
            app.ui.setRunLed(true);
        }
    }

    /**
     * CPU event for screen redraw
     */
    private onScreenRedraw(): void {

        this.renderer.draw(this.chip8.screen);
    }

    /**
     * CPU event for play sound
     */
    private onPlaySound(): void {

        this.audio.play();
        this.ui.setBuzzers(true);
    }

    /**
     * CPU event for stop sound
     */
    private onStopSound(): void {

        this.audio.stop();
        this.ui.setBuzzers(false);
    }

    /**
     * UI event for ROM uploaded event
     * @param filename 
     * @param romData 
     */
    private onRomUploaded(filename: string, romData: Uint8Array): void {

        const rom: ROM = {
            title: filename,
            author: null,
            year: null,
            description: 'Uploaded ROM',
            filename: filename,
            data: romData,
            quirks: { loadStore: false, shift: false },
            keymap: { },
        };

        this.startRom(rom);
    }

    /**
     * Load rom list json file
     * @param filepath 
     */
    public loadRomList(filepath: string): void {

        fetch(filepath)
        .then(response => response.json())
        .then((romList: Array<ROM>) => 
            this.ui.setRomList(
                romList.sort((a: ROM, b: ROM) => a.title < b.title ? -1: 1)
            )
        )
        .catch(() => alert('Error loading ROM list.'));
    }

    /**
     * UI event for ROM uploaded event
     * @param filename 
     * @param romData 
     */
    private onRomSelected(rom: ROM): void {

        fetch(`${this.ROM_DIR}/${rom.filename}`)
        .then(result => result.arrayBuffer())
        .then((buffer: ArrayBuffer) => {

            rom.data = new Uint8Array(buffer);
            this.ui.setCustomKeymap(rom.keymap);
            this.startRom(rom);
            
        })
        .catch(() => alert('Error loading ROM file.'));
    }

    /**
     * Takes a selected or uploaded ROM and start emulation
     * @param rom 
     */
    private startRom(rom: ROM): void {

        this.ui.setRomInfo(rom.title, rom.description);

        this.lastRomData = rom.data;

        this.chip8.stop();
        this.chip8.initialize();
        this.chip8.loadROM(rom.data);

        if(rom.quirks) {
            
            if(rom.quirks.loadStore) {

                this.chip8.quirks.loadStore = true;
            }

            if(rom.quirks.shift) {

                this.chip8.quirks.shift = true;
            }
        }

        this.chip8.run();

        this.ui.setTapeLed(true);
        this.ui.setRunLed(true);
    }

    /**
     * Save or load state.
     * @param stateNum 
     */
    private onSaveLoadState(stateNum: number): void {

        const state = this.states[stateNum];

        if(!state) {

            // save
            this.states[stateNum] = new Chip8CpuState(this.chip8);
        }
        else {

            // load
            this.chip8.stop();

            this.chip8.memory = new Uint8Array(state.memory);
            this.chip8.V = new Uint8Array(state.V);
            this.chip8.i = state.i;
            this.chip8.pc = state.pc;
            this.chip8.delayTimer = state.delayTimer;
            this.chip8.soundTimer = state.soundTimer;
            this.chip8.redraw = state.redraw;
            this.chip8.screen = new Uint8Array(state.screen);
            this.chip8.stack = new Uint16Array(state.stack);

            this.chip8.run();
        }
    }
}
