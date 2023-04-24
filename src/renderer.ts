export class Renderer {

    canvas = document.querySelector("canvas")!;
    context: CanvasRenderingContext2D | null;
    
    displayWidth: number;
    displayHeight: number;
    pixelSize: number;

    pixelData: ImageData;

    /**
     * Initialize renderer and clear the screen
     */
    public initialize(displayWidth: number, displayHeight: number, pixelSize: number): void {

        this.context = this.canvas.getContext('2d');
        
        if(!this.context) throw "Could not create 2D rendering context";

        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.pixelSize = pixelSize;

        this.pixelData = this.context.createImageData(pixelSize, pixelSize);
        this.pixelData.data[0]   = 255;
        this.pixelData.data[1]   = 255;
        this.pixelData.data[2]   = 255;
        this.pixelData.data[3]   = 255;

        this.clear();
    }
    
    /**
     * Clear screen
     */
    public clear(): void {

        this.context!.fillStyle = "rgb(50,50,50)";
        this.context!.fillRect(0, 0, this.displayWidth * this.pixelSize, this.displayHeight * this.pixelSize);
    }

    /**
     * Draws screen buffer on canvas
     * @param screen 
     */
    public draw(screen: Uint8Array): void {

        this.clear();

        for(let y = 0; y < this.displayHeight; y++) {

            for(let x = 0; x < this.displayWidth; x++) {

              if(screen[(y * this.displayWidth) + x] == 1) {
                
                this.context!.putImageData(this.pixelData, x * this.pixelSize, y *  this.pixelSize);
              }
            }
        }
    }
}