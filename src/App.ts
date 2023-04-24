import { Chip8 } from "./chip8/chip8";
import { keymap } from "./keymap";
import { Renderer } from "./renderer";
import { UI } from "./UI";

export class App {

    PIXEL_SIZE = 10;

    ui = new UI(keymap);
    chip8 = new Chip8();
    renderer = new Renderer();
    audio = new Audio();

    lastRomData: Uint8Array;

    constructor() {
        
        this.ui.bindEvents();

        this.ui.initializeCanvas(this.chip8.SCREEN_WIDTH, this.chip8.SCREEN_HEIGHT, this.PIXEL_SIZE);

        this.ui.initializeKeyboard();

        this.ui.onKeyStateChange = (key: number, pressed: boolean) => this.onKeyStateChange(key, pressed);

        this.ui.onReset = () => this.onReset(this);

        this.ui.onRomUploaded = (filename: string, romData: Uint8Array) => this.onRomUploaded(filename, romData);

        this.chip8.onRedraw = () => this.onScreenRedraw();

        this.chip8.onPlaySound = () => this.onPlaySound();
        this.chip8.onStopSound = () => this.onStopSound();

        this.renderer.initialize(this.chip8.SCREEN_WIDTH, this.chip8.SCREEN_HEIGHT, this.PIXEL_SIZE);

        this.ui.setPowerLed(true);
    }

    /**
     * UI Event for keydown/keyup
     * @param key 
     * @param pressed 
     */
    private onKeyStateChange(key: number, pressed: boolean): void {

        this.chip8.keys[key] = pressed ? 1 : 0;
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

        this.ui.setBuzzers(true);
    }

    /**
     * CPU event for stop sound
     */
    private onStopSound(): void {

        this.ui.setBuzzers(false);
    }

    /**
     * UI event for ROM uploaded event
     * @param filename 
     * @param romData 
     */
    private onRomUploaded(filename: string, romData: Uint8Array): void {

        this.lastRomData = romData;

        this.ui.setRomInfo(filename, '');

        this.chip8.stop();
        this.chip8.initialize();
        this.chip8.loadROM(romData);
        this.chip8.run();

        this.ui.setTapeLed(true);
        this.ui.setRunLed(true);
    }
}
