import { Chip8 } from "./chip8";

/**
 * Chip8 Instruction Set
 */
export class Chip8IS {

    cpu: Chip8;

    constructor(cpu: Chip8) {

        this.cpu = cpu;
    }

    /**
     * Code 0NNN
     * Calls machine code routine (RCA 1802 for COSMAC VIP) at 
     * address NNN. Not necessary for most ROMs.
     * @param cpu 
     */
    public SYS(): void {
            
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 00E0
     * Clears the screen
     * @param cpu 
     */
    public CLS(): void {

        for(let i = 0; i < this.cpu.SCREEN_WIDTH * this.cpu.SCREEN_HEIGHT; i++)
            this.cpu.screen[i] = 0x0;
        
        this.cpu.redraw = true;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 00EE
     * Returns from a subroutine.
     * @param cpu 
     */
    public RET(): void {

        this.cpu.stackPointer = (this.cpu.stackPointer - 1) & (this.cpu.stack.length - 1);
        this.cpu.pc = this.cpu.stack[this.cpu.stackPointer];
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 1NNN
     * Jumps to address NNN.
     * @param nnn 
     */
    JP_nnn(nnn: number): void {
        this.cpu.pc = nnn;
    }

    /**
     * Code 8XY0
     * Sets VX to the value of VY.
     * @param x 
     * @param y 
     * @returns 
     */
    LD_Vx_Vy(x: number, y: number) {

        this.cpu.V[x] = this.cpu.V[y];
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 6XNN
     * Sets VX to NN.
     * @param x 
     * @param nn
     * @returns 
     */
    LD_Vx_nn(x: number, nn: number) {

        this.cpu.V[x] = nn;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 8XY1
     * Sets VX to VX or VY. (bitwise OR operation)
     * @param x 
     * @param y 
     * @returns 
     */
    OR_Vx_Vy(x: number, y: number): void {
        
        this.cpu.V[x] = this.cpu.V[x] | this.cpu.V[y];
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 8XY2
     * Sets VX to VX and VY. (bitwise AND operation)
     * @param x 
     * @param y 
     * @returns 
     */
    AND_Vx_Vy(x: number, y: number): void {
        
        this.cpu.V[x] = this.cpu.V[x] & this.cpu.V[y];
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 8XY3
     * Sets VX to VX xor VY.
     */
    XOR_Vx_Vy(x: number, y: number): void {
        
        this.cpu.V[x] = this.cpu.V[x] ^ this.cpu.V[y];
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 8XY4
     * Adds VY to VX. VF is set to 1 when there's a carry, 
     * and to 0 when there is not.
     */
    ADD_Vx_Vy(x: number, y: number): void {
        
        let sum = this.cpu.V[x] + this.cpu.V[y];
        this.cpu.V[0xF] = (sum > 0xFF ? 1 : 0); // carry
        this.cpu.V[x] = sum;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 8XY5
     * VY is subtracted from VX. VF is set to 0 when there's 
     * a borrow, and 1 when there is not.
     */
    SUB_Vx_Vy(x: number, y: number): void {
        
        this.cpu.V[0xF] = (this.cpu.V[x] >= this.cpu.V[y] ? 1 : 0); // NOT borrow
        this.cpu.V[x] = this.cpu.V[x] - this.cpu.V[y];
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 8XY7
     * Sets VX to VY minus VX. VF is set to 0 when there's a 
     * borrow, and 1 when there is not.
     * @param x 
     * @param y 
     */
    SUBN_Vx_Vy(x: number, y: number): void {
        
        this.cpu.V[0xF] = (this.cpu.V[y] >= this.cpu.V[x] ? 1 : 0); // NOT borrow
        this.cpu.V[x] = this.cpu.V[y] - this.cpu.V[x];
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 8XY6
     * Stores the least significant bit of VX in VF and then 
     * shifts VX to the right by 1.
     */
    SHR_Vx_Vy(x: number, y: number): void {
        
        if (this.cpu.quirks.shift) {
            y = x;
        }

        this.cpu.V[0xF] = this.cpu.V[y] & 0x01;
        this.cpu.V[x] = this.cpu.V[y] >> 1;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 8XYE
     * Stores the most significant bit of VX in VF and then 
     * shifts VX to the left by 1.
     */
    SHL_Vx_Vy(x: number, y: number): void {

        if (this.cpu.quirks.shift) {
            y = x;
        }

        this.cpu.V[0xF] = (this.cpu.V[y] >> 7) & 0x01;
        this.cpu.V[x] = this.cpu.V[y] << 1;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 7XNN
     * Adds NN to VX (carry flag is not changed).
     */
    ADD_Vx_nn(x: number, nn: number): void {
        
        this.cpu.V[x] = this.cpu.V[x] + nn;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;   
    }

    /**
     * Code 9XY0
     * @param x 
     * @param y 
     */
    SNE_Vx_Vy(x: number, y: number): void {
        
        if (this.cpu.V[x] !== this.cpu.V[y]) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 4XNN
     * @param x 
     * @param nn 
     */
    SNE_Vx_nn(x: number, nn: number): void {
        
        if (this.cpu.V[x] !== nn) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 3XNN
     * @param x 
     * @param nn 
     */
    SE_Vx_nn(x: number, nn: number): void {
        
        if (this.cpu.V[x] === nn) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 5XY0
     * @param x 
     * @param y 
     */
    SE_Vx_Vy(x: number, y: number): void {
        
        if (this.cpu.V[x] === this.cpu.V[y]) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code 2NNN
     * @param nnn 
     */
    CALL_nnn(nnn: number): void {

        this.cpu.stack[this.cpu.stackPointer] = this.cpu.pc;
        this.cpu.stackPointer++;
        this.cpu.pc = nnn;
    }

    /**
     * Code ANNN
     * @param nnn 
     */
    LD_I_nnn(nnn: number): void {
        
        this.cpu.i = nnn;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code BNNN
     * @param nnn 
     */
    JP_V0_nnn(nnn: number): void {
        
        this.cpu.pc = (nnn + this.cpu.V[0]) & 0x0FFF;
    }

    /**
     * Code CXNN
     * @param x 
     * @param nn 
     */
    RND_Vx_nn(x: number, nn: number): void {

        this.cpu.V[x] = Math.floor(Math.random() * (0xFF + 1)) & nn;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code FX33
     * @param x 
     */
    LD_B_Vx(x: number) {

        this.cpu.memory[this.cpu.i]     = (this.cpu.V[x] / 100) >> 0;
        this.cpu.memory[this.cpu.i + 1] = (this.cpu.V[x] % 100 / 10) >> 0;
        this.cpu.memory[this.cpu.i + 2] = this.cpu.V[x] % 10;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code FX07
     * @param x 
     */
    LD_Vx_DT(x: number): void {

        this.cpu.V[x] = this.cpu.delayTimer;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code FX15
     * @param x 
     */
    LD_DT_Vx(x: number): void {

        this.cpu.delayTimer = this.cpu.V[x];
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code FX18
     * @param x 
     */
    LD_ST_Vx(x: number): void {

        this.cpu.soundTimer = this.cpu.V[x];
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code FX1E
     * @param x 
     */
    ADD_I_Vx(x: number): void {

        this.cpu.i = (this.cpu.i + this.cpu.V[x]) & 0xFFF;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code FX55
     * @param x 
     */
    LD_I_Vx(x: number): void {

        for (var i = 0 ; i <= x; ++i) {
            this.cpu.memory[this.cpu.i + i] = this.cpu.V[i];
        }

        if (!this.cpu.quirks.loadStore) {
            this.cpu.i += x + 1;
        }

        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code FX65
     * @param x 
     */
    LD_Vx_I(x: number): void {

        for (var i = 0; i <= x; ++i) {
            this.cpu.V[i] = this.cpu.memory[this.cpu.i + i];
        }

        if (!this.cpu.quirks.loadStore) {
            this.cpu.i += x + 1;
        }

        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code FX0A
     * @param x 
     */
    LD_Vx_K(x: number): void {
        
        for(let i = 0; i < 16; i++) {

            if(this.cpu.keys[i] == 1) {
                this.cpu.V[x] = i;
                this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
            }
        }
    }

    /**
     * Code EX9E
     * @param x 
     */
    SKP_Vx(x: number): void {

        if (this.cpu.keys[this.cpu.V[x]] == 1) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }

        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code EXA1
     * @param x 
     */
    SKNP_Vx(x: number): void {
        
        if (this.cpu.keys[this.cpu.V[x]] == 0) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Code FX29
     * @param x 
     */
    LD_F_Vx(x: number): void {

        this.cpu.i = this.cpu.V[x] * 5;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * Toggle screen pixel
     * @param x 
     * @param y 
     * @returns 
     */
    togglePixel(x: number, y: number): boolean {
        let idx = x + y * this.cpu.SCREEN_WIDTH;

        let collision = !!this.cpu.screen[idx];
        this.cpu.screen[idx] ^= 1;

        return collision;
    }

    /**
     * Code DXYN
     * @param x 
     * @param y 
     * @param n 
     */
    DRW_Vx_Vy_n(x: number, y: number, n: number) {
        
        var hline, vline, membyte, coll;

        this.cpu.V[0xF] = 0;
        for (hline = 0; hline < n; ++hline) {
            membyte = this.cpu.memory[this.cpu.i + hline];

            for  (vline = 0; vline < 8; ++vline) {
                if ((membyte & (0x80 >> vline)) !== 0) {
                    
                    coll = this.togglePixel(this.cpu.V[x] + vline, this.cpu.V[y] + hline);

                    if (coll) {

                        this.cpu.V[0xF] = 1;
                    }
                }
            }
        }

        this.cpu.redraw = true;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }
}
