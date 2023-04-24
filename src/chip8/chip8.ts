import { fontSet } from "./font-set";
import { Chip8IS } from "./chip8-is";

/**
 * Chip8
 */
export class Chip8 {

    MEMORY_SIZE = 4096;
    PROGRAM_START_ADDRESS = 0x200;
    FREQUENCY = 60; // Hz
    STACK_SIZE = 16;
    REGISTERS = 16;
    NUMBER_OF_KEYS = 16;
    SCREEN_WIDTH = 64;
    SCREEN_HEIGHT = 32;

    /**
     * Instruction set
     */
    IS: Chip8IS;

    /**
     * Memory
     * Layout:
     * 0x000-0x1FF - Chip 8 interpreter (contains font set in emu)
     * 0x050-0x0A0 - Used for the built in 4x5 pixel font set (0-F)
     * 0x200-0xFFF - Program ROM and work RAM
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

    /**
     * Keys array
     */
    keys: Uint8Array;

    /**
     * Cycle counter (used for debug)
     */
    cycleCounter: number;

    /**
     * Known "quirks"
     */
    quirks: {
        loadStore: boolean,
        shift: boolean
    };
    
    constructor() {

        this.IS = new Chip8IS(this);
    }

    /**
     * Initialize/Reset CPU state
     */
    public initialize(): void {

        this.memory = new Uint8Array(this.MEMORY_SIZE);
        this.V = new Uint8Array(this.REGISTERS);
        this.i = 0;
        this.pc = this.PROGRAM_START_ADDRESS;
        this.screen = new Uint8Array(this.SCREEN_WIDTH * this.SCREEN_HEIGHT);
        this.delayTimer = 0;
        this.soundTimer = 0;
        this.redraw = false;
        this.stack = new Uint16Array(this.STACK_SIZE);
        this.stackPointer = 0;
        this.keys = new Uint8Array(this.NUMBER_OF_KEYS);
        this.cycleCounter = 0;
        this.quirks = { shift: false, loadStore: false };
        this.cycleCounter = 0;

        this.loadFontSet();
    }

    /**
     * Load data to memory
     */
    private loadData(data: Uint8Array, start: number): void {

        for(let index = 0; index < data.length; index++)
            this.memory[index + start] = data[index];
    }

    /**
     * Load font set
     */
    private loadFontSet(): void {

        this.loadData(fontSet, 0);
    }

    /**
     * Load rom data
     * @param buffer 
     */
    public loadROM(buffer: Uint8Array): void {

        this.loadData(buffer, this.PROGRAM_START_ADDRESS);
    }

}