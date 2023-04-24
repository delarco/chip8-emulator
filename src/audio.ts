export class Audio {

    context: AudioContext;
    oscillator: OscillatorNode | null;

    constructor() {
        
        this.context = new AudioContext();
    }

    private createOscillator() {

        this.oscillator = this.context.createOscillator();
        this.oscillator.type = "sine";
        this.oscillator.frequency.value = 400;
        this.oscillator.connect(this.context.destination);
    }

    public play(): void {

        if(!this.oscillator) {

            this.createOscillator();

            if(this.oscillator) {

                (<OscillatorNode>this.oscillator).start(0);
            }
        }
    }

    public stop(): void {

        if(this.oscillator) {

            this.oscillator.stop(0);
            this.oscillator.disconnect(this.context.destination);
            this.oscillator = null;
        }
    }
}