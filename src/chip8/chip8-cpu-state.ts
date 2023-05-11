import { Chip8 } from "./chip8";

export class Chip8CpuState {
    
    /**
     * Memory
     */
    memory: Uint8Array;

    /**
     * Registers: V0 to VF
     */
    V: Uint8Array;

    /**
     * Address register
     */
    i: number;

    /**
     * Program counter
     */
    pc: number;

    /**
     * Delay timer
     */
    delayTimer: number;

    /**
     * Sound timer
     */
    soundTimer: number;

    /**
     * Redraw screen flag 
     */
    redraw: boolean;

    /**
     * Screen array
     */
    screen: Uint8Array;

    /**
     * Stack array
     */
    stack: Uint16Array;

    /**
     * Stack pointer
     */
    stackPointer: number;

    constructor(cpu: Chip8) {
        
        this.memory = new Uint8Array(cpu.memory);
        this.V = new Uint8Array(cpu.V);
        this.i = cpu.i;
        this.pc = cpu.pc;
        this.delayTimer = cpu.delayTimer;
        this.soundTimer = cpu.soundTimer;
        this.redraw = cpu.redraw;
        this.screen = new Uint8Array(cpu.screen);
        this.stack = new Uint16Array(cpu.stack);
    }
}
