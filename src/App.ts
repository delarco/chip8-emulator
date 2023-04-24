import { UI } from "./UI";

export class App {

    PIXEL_SIZE = 10;

    // TODO: move dimensions to chip8 class
    SCREEN_WIDTH = 64;
    SCREEN_HEIGHT = 32;

    ui = new UI();

    constructor() {
        
        this.ui.bindEvents();

        this.ui.initializeCanvas(64, 32, this.PIXEL_SIZE);

        this.ui.initializeKeyboard();
    }
}
