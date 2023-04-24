export class Renderer {

    canvas = document.querySelector("canvas")!;
    context: CanvasRenderingContext2D | null;
    
    displayWidth: number;
    displayHeight: number;
    pixelSize: number;

    /**
     * Initialize renderer and clear the screen
     */
    public initialize(displayWidth: number, displayHeight: number, pixelSize: number): void {

        this.context = this.canvas.getContext('2d');
        
        if(!this.context) throw "Could not create 2D rendering context";

        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.pixelSize = pixelSize;

        this.clear();
    }
    
    /**
     * Clear screen
     */
    private clear(): void {

        this.context!.fillStyle = "rgb(50,50,50)";
        this.context!.fillRect(0, 0, this.displayWidth * this.pixelSize, this.displayHeight * this.pixelSize);
    }

    /**
     * Draws screen buffer on canvas
     * @param screen 
     */
    public draw(screen: Uint8Array): void {

        // TODO: implement
    }
}