import { keymap } from "./keymap";
import { UI } from "./UI";

export class App {

    PIXEL_SIZE = 10;

    // TODO: move dimensions to chip8 class
    SCREEN_WIDTH = 64;
    SCREEN_HEIGHT = 32;

    ui = new UI(keymap);

    constructor() {
        
        this.ui.bindEvents();

        this.ui.initializeCanvas(64, 32, this.PIXEL_SIZE);

        this.ui.initializeKeyboard();

        this.ui.onKeyStateChange = this.onKeyStateChange;
    }

    /**
     * UI Event for keydown/keyup
     * @param key 
     * @param pressed 
     */
    private onKeyStateChange(key: number, pressed: boolean): void {

        console.log('key', key, 'pressed', pressed);
    }
}
