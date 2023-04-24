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
    STEPS_PER_CYCLE = 10;

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
     * Step counter (used for debug)
     */
    stepCounter: number;

    /**
     * Known "quirks"
     */
    quirks: {
        loadStore: boolean,
        shift: boolean
    };
    
    /**
     * CPU run timeout handle
     */
    timeoutHandle: NodeJS.Timeout;

    /**
     * window.requestAnimationFrame handle
     */
    requestAnimationFrameHandle: number;

    /**
     * Redraw event emitter 
     */
    public onRedraw?: () => void;

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
        this.stepCounter = 0;

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

    /**
     * Runs CPU.
     */
    public run(): void {

        const tick = () => {

            this.timeoutHandle = setTimeout(() => {
                this.requestAnimationFrameHandle = window.requestAnimationFrame(tick);
                this.cycle();
            }, 1000 / this.FREQUENCY);

        };

        tick();
    }

    /**
     * Stops CPU.
     */
    public stop(): void {

        if(this.timeoutHandle) {

            window.clearTimeout(this.timeoutHandle);
        }

        if(this.requestAnimationFrameHandle) {
            window.cancelAnimationFrame(this.requestAnimationFrameHandle);
        }
    }

    /**
     * Cycle
     */
    private cycle(): void {

        this.cycleCounter++;
        
        for(let i = 0; i < this.STEPS_PER_CYCLE; i++) {
            this.step();
        }
        
        this.updateTimers();

        this.playSound();
    }

    /**
     * Step
     */
    private step(): void {

        this.stepCounter++;

        const opcode = this.fetch();

        this.execute(opcode);

        if(this.redraw && this.onRedraw) {
            
            this.onRedraw();
            this.redraw = false;
        }
    }

    /**
     * Fetchs next opcode
     * @returns next opcode (2 bytes)
     */
    private fetch(): number {

        return this.memory[this.pc] << 8 | this.memory[this.pc + 1];
    }

    /**
     * Fetches X symbol
     * @param opcode 
     * @returns X symbol (0x0X00)
     */
    private fetchX(opcode: number): number {

        return (opcode & 0x0F00) >> 8;
    }

    /**
     * Fetches Y symbol
     * @param opcode 
     * @returns Y symbol (0x00Y0)
     */
    private fetchY(opcode: number): number {

        return (opcode & 0x00F0) >> 4;
    }

    /**
     * Fetches N symbol
     * @param opcode 
     * @returns N symbol (0x000N)
     */
    private fetchN(opcode: number): number {

        return opcode & 0x000F;
    }

    /**
     * Fetches NN symbol
     * @param opcode 
     * @returns NN symbol (0x00NN)
     */
    private fetchNN(opcode: number): number {

        return opcode & 0x00FF;;
    }

    /**
     * Fetches NNN symbol
     * @param opcode 
     * @returns N symbol (0x0NNN)
     */
    private fetchNNN(opcode: number): number {

        return opcode & 0x0FFF;;
    }

    /**
     * Execute opcode
     * @param opcode 
     * @returns 
     */
    private execute(opcode: number): void {
        
        const x = this.fetchX(opcode);
        const y = this.fetchY(opcode);
        const n   = this.fetchN(opcode);
        const nn  = this.fetchNN(opcode);
        const nnn = this.fetchNNN(opcode);
        
        switch(opcode & 0xF000) {

            case 0x0000:
                switch (opcode) {
                    case 0x00E0: return this.IS.CLS();
                    case 0x00EE: return this.IS.RET();
                    default:     return this.IS.SYS();
                }

            case 0x1000: return this.IS.JP_nnn(nnn);

            case 0x2000: return this.IS.CALL_nnn(nnn);

            case 0x3000: return this.IS.SE_Vx_nn(x, nn);

            case 0x4000: return this.IS.SNE_Vx_nn(x, nn);

            case 0x5000: return this.IS.SE_Vx_Vy(x, y);

            case 0x6000: return this.IS.LD_Vx_nn(x, nn);

            case 0x7000: return this.IS.ADD_Vx_nn(x, nn);

            case 0x8000:
                switch (opcode & 0x000F) {
                    case 0x0000: return this.IS.LD_Vx_Vy(x, y);
                    case 0x0001: return this.IS.OR_Vx_Vy(x, y);
                    case 0x0002: return this.IS.AND_Vx_Vy(x, y);
                    case 0x0003: return this.IS.XOR_Vx_Vy(x, y);
                    case 0x0004: return this.IS.ADD_Vx_Vy(x, y);
                    case 0x0005: return this.IS.SUB_Vx_Vy(x, y);
                    case 0x0006: return this.IS.SHR_Vx_Vy(x, y);
                    case 0x0007: return this.IS.SUBN_Vx_Vy(x, y);
                    case 0x000E: return this.IS.SHL_Vx_Vy(x,y);
                }
                break;

            case 0x9000: return this.IS.SNE_Vx_Vy(x, y);

            case 0xA000: return this.IS.LD_I_nnn(nnn);

            case 0xB000: return this.IS.JP_V0_nnn(nnn);

            case 0xC000: return this.IS.RND_Vx_nn(x, nn);

            case 0xD000: return this.IS.DRW_Vx_Vy_n(x, y, n);

            case 0xE000:
                switch (opcode & 0x00FF) {
                    case 0x009E: return this.IS.SKP_Vx(x);
                    case 0x00A1: return this.IS.SKNP_Vx(x);
                }
                break;

            case 0xF000:
                switch (opcode & 0x00FF) {
                    case 0x0007: return this.IS.LD_Vx_DT(x);
                    case 0x000A: return this.IS.LD_Vx_K(x);
                    case 0x0015: return this.IS.LD_DT_Vx(x);
                    case 0x0018: return this.IS.LD_ST_Vx(x);
                    case 0x001E: return this.IS.ADD_I_Vx(x);
                    case 0x0029: return this.IS.LD_F_Vx(x);
                    case 0x0033: return this.IS.LD_B_Vx(x);
                    case 0x0055: return this.IS.LD_I_Vx(x);
                    case 0x0065: return this.IS.LD_Vx_I(x);
                }
                break;
        }

        this.stop();
        throw 'Unknown opcode: 0x' + opcode.toString(16);
    }

    /**
     * Updates CPU timers.
     */
    private updateTimers(): void {

        if(this.delayTimer > 0)
            this.delayTimer--;

        if(this.soundTimer > 0)        
            this.soundTimer--;
    }

    /**
     * Plays sound if needed
     */
    private playSound(): void {

        if(this.soundTimer > 0) {
            // TODO: implement sound
        }
    }
}