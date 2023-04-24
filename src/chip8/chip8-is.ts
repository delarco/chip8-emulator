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
     * <pre><code>8xy6 - SHR Vx, Vy</code></pre>
     * Set Vx = Vy SHR 1.
     * If shift quirks enabled Vx = Vx SHR 1.
     * If the least-significant bit of shifted value is 1, then VF is set to 1, otherwise 0.
     * @param {number} x
     * @param {number} y
     * @returns {Function}
     */

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
     * <pre><code>9xy0 - SNE Vx, Vy</code></pre>
     * Skip next instruction if Vx != Vy.
     * @param {number} x
     * @param {number} y
     * @returns {Function}
     */
    SNE_Vx_Vy(x: number, y: number): void {
        
        if (this.cpu.V[x] !== this.cpu.V[y]) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>4xkk - SNE Vx, kk</code></pre>
     * Skip next instruction if Vx != kk.
     * @param {number} x
     * @param {number} kk
     * @returns {Function}
     */
    SNE_Vx_nn(x: number, nn: number): void {
        
        if (this.cpu.V[x] !== nn) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>3xkk - SE Vx, kk</code></pre>
     * Skip next instruction if Vx = kk.
     * @param {number} x
     * @param {number} kk
     * @returns {Function}
     */
    SE_Vx_nn(x: number, nn: number): void {
        
        if (this.cpu.V[x] === nn) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>5xy0 - SE Vx, Vy</code></pre>
     * Skip next instruction if Vx = Vy.
     * @param {number} x
     * @param {number} y
     * @returns {Function}
     */
    SE_Vx_Vy(x: number, y: number): void {
        
        if (this.cpu.V[x] === this.cpu.V[y]) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }





    /**
         * <pre><code>2nnn - CALL nnn</code></pre>
         * Call subroutine at nnn.
         * @param {number} nnn
         * @returns {Function}
         */
    CALL_nnn(nnn: number): void {

        this.cpu.stack[this.cpu.stackPointer] = this.cpu.pc;
        this.cpu.stackPointer++;
        this.cpu.pc = nnn;
    }

    /**
     * <pre><code>Annn - LD I, nnn</code></pre>
     * Set I = nnn.
     * @param {number} nnn
     * @returns {Function}
     */
    LD_I_nnn(nnn: number): void {
        
        this.cpu.i = nnn;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>Bnnn - JP V0, nnn</code></pre>
     * Jump to location nnn + V0.
     * @param {number} nnn
     * @returns {Function}
     */
    JP_V0_nnn(nnn: number): void {
        
        this.cpu.pc = (nnn + this.cpu.V[0]) & 0x0FFF;
    }

    /**
     * <pre><code>Cxkk - RND Vx, kk</code></pre>
     * Set Vx = random byte AND kk.
     * @param {number} x
     * @param {number} kk
     * @returns {Function}
     */
    RND_Vx_nn(x: number, nn: number): void {

        this.cpu.V[x] = Math.floor(Math.random() * (0xFF + 1)) & nn;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>Fx33 - LD B, Vx</code></pre>
     * Store BCD representation of Vx in memory locations I, I+1, and I+2.
     * @param {number} x
     * @returns {Function}
     */
    LD_B_Vx(x: number) {

        this.cpu.memory[this.cpu.i]     = (this.cpu.V[x] / 100) >> 0;
        this.cpu.memory[this.cpu.i + 1] = (this.cpu.V[x] % 100 / 10) >> 0;
        this.cpu.memory[this.cpu.i + 2] = this.cpu.V[x] % 10;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>Fx07 - LD Vx, DT</code></pre>
     * Set Vx = delay timer value.
     * @param {number} x
     * @returns {Function}
     */
    LD_Vx_DT(x: number): void {

        this.cpu.V[x] = this.cpu.delayTimer;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>Fx15 - LD DT, Vx</code></pre>
     * Set delay timer = Vx.
     * @param {number} x
     * @returns {Function}
     */
    LD_DT_Vx(x: number): void {

        this.cpu.delayTimer = this.cpu.V[x];
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>Fx18 - LD ST, Vx</code></pre>
     * Set sound timer = Vx.
     * @param {number} x
     * @returns {Function}
     */
    LD_ST_Vx(x: number): void {

        this.cpu.soundTimer = this.cpu.V[x];
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>Fx1E - ADD I, Vx</code></pre>
     * Set I = I + Vx.
     * @param {number} x
     * @returns {Function}
     */
    ADD_I_Vx(x: number): void {

        this.cpu.i = (this.cpu.i + this.cpu.V[x]) & 0xFFF;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>Fx55 - LD [I], Vx</code></pre>
     * Store registers V0 through Vx in memory starting at location I.
     * The value of the I register will be incremented by X + 1, if load/store quirks are disabled.
     * @param {number} x
     * @returns {Function}
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
     * <pre><code>Fx65 - LD Vx, [I]</code></pre>
     * Read registers V0 through Vx from memory starting at location I.
     * The value of the I register will be incremented by X + 1, if load/store quirks are disabled.
     * @param {number} x
     * @returns {Function}
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
     * <pre><code>Fx0A - LD Vx, K</code></pre>
     * Wait for a key press, store the value of the key in Vx.
     * @param {number} x
     * @returns {Function}
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
     * <pre><code>Ex9E - SKP Vx</code></pre>
     * Skip next instruction if key with the value of Vx is pressed.
     * @param {number} x
     * @returns {Function}
     */
    SKP_Vx(x: number): void {

        if (this.cpu.keys[this.cpu.V[x]] == 1) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }

        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>ExA1 - SKNP Vx</code></pre>
     * Skip next instruction if key with the value of Vx is not pressed.
     * @param {number} x
     * @returns {Function}
     */
    SKNP_Vx(x: number): void {
        
        if (this.cpu.keys[this.cpu.V[x]] == 0) {
            this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
        }
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }

    /**
     * <pre><code>Fx29 - LD F, Vx</code></pre>
     * Set I = location of sprite for digit Vx.
     * @param {number} x
     * @returns {Function}
     */
    LD_F_Vx(x: number): void {

        this.cpu.i = this.cpu.V[x] * 5;
        this.cpu.pc = (this.cpu.pc + 2) & 0x0FFF;
    }


    togglePixel(x: number, y: number): boolean {
        let idx = x + y * this.cpu.SCREEN_WIDTH;

        let collision = !!this.cpu.screen[idx];
        this.cpu.screen[idx] ^= 1;

        return collision;
    }

    /**
     * <pre><code>Dxyn - DRW Vx, Vy, n</code></pre>
     * Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
     * @param {number} x
     * @param {number} y
     * @param {number} n
     * @returns {Function}
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
