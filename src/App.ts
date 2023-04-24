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

        this.ui.onKeyStateChange = this.onKeyStateChange;

        this.chip8.onRedraw = this.onScreenRedraw;

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
     * CPU event for screen redraw
     */
    private onScreenRedraw(): void {

        this.renderer.draw(this.chip8.screen);
    }
}
