import { Chip8 } from "./chip8/chip8";
import { keymap } from "./keymap";
import { Renderer } from "./renderer";
import { UI } from "./UI";

export class App {

    PIXEL_SIZE = 10;

    ui = new UI(keymap);
    chip8 = new Chip8();
    renderer = new Renderer();

    constructor() {
        
        this.ui.bindEvents();

        this.ui.initializeCanvas(this.chip8.SCREEN_WIDTH, this.chip8.SCREEN_HEIGHT, this.PIXEL_SIZE);

        this.ui.initializeKeyboard();

        this.ui.onKeyStateChange = (key: number, pressed: boolean) => this.onKeyStateChange(key, pressed);

        this.ui.onReset = () => this.onReset(this);

        this.ui.onRomUploaded = (filename: string, romData: Uint8Array) => this.onRomUploaded(filename, romData);

        this.chip8.onRedraw = () => this.onScreenRedraw();

        this.renderer.initialize(this.chip8.SCREEN_WIDTH, this.chip8.SCREEN_HEIGHT, this.PIXEL_SIZE);
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
    }

    /**
     * CPU event for screen redraw
     */
    private onScreenRedraw(): void {

        this.renderer.draw(this.chip8.screen);
    }

    /**
     * UI event for ROM uploaded event
     * @param filename 
     * @param romData 
     */
    private onRomUploaded(filename: string, romData: Uint8Array): void {

        this.chip8.stop();
        this.chip8.initialize();
        this.chip8.loadROM(romData);
        this.chip8.run();
    }
}
