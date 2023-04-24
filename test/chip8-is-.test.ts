import { beforeEach, describe, expect, it } from "vitest";
import { Chip8 } from "../src/chip8/chip8";

describe('Chip8IS', () => {
  
    let chip8: Chip8;

    beforeEach(() => {

        chip8 = new Chip8();
        chip8.initialize();        
    })

    it('Code 0x00E0: Should clear the screen and redraw', () => {

        const data = new Uint8Array([0x00, 0xE0]);
        chip8.loadROM(data);

        for(let i = 0; i < 100; i++)
            chip8.screen[i] = Math.random();

        expect(chip8.redraw).eq(false);

        (chip8 as any).cycle();

        expect(chip8.redraw).eq(true);

        const sum = chip8.screen.reduce((prev: number, cur: number) => prev + cur);

        expect(sum).eq(0);
    })

    it('Code 0x00EE: Should jump to last stack value', () => {

        const data = new Uint8Array([0x00, 0xEE]);
        chip8.loadROM(data);

        chip8.stack[0] = 0xABC;
        chip8.stackPointer = 1;
        (chip8 as any).step();

        expect(chip8.pc).eq(0xABC + 2);

    })

    it('Code 0x1NNN: Should jump to NNN', () => {

        const data = new Uint8Array([0x1A, 0xBC]);
        chip8.loadROM(data);

        (chip8 as any).step();

        expect(chip8.pc).eq(0xABC);
    })

    it('Code 0x2NNN: Should increment stack and set pc to NNN', () => {

        const data = new Uint8Array([0x2A, 0xBC]);
        chip8.loadROM(data);

        const pcBeforeCycle = chip8.pc;
        (chip8 as any).step();

        expect(chip8.pc).eq(0xABC);
        expect(chip8.stackPointer).eq(1);
        expect(chip8.stack[0]).eq(pcBeforeCycle);
    })

    it('Code 0x3XNN: Should skip the next instruction if VX equals NN', () => {

        const data = new Uint8Array([0x3A, 0xFF]);
        chip8.loadROM(data);

        const pcBeforeCycle = chip8.pc;
        chip8.V[0xA] = 0xFF;
        (chip8 as any).step();

        expect(chip8.pc).eq(pcBeforeCycle + 4);
    })

    it('Code 0x4XNN: Should skip the next instruction if VX does not equal NN', () => {

        const data = new Uint8Array([0x4A, 0xFF]);
        chip8.loadROM(data);

        const pcBeforeCycle = chip8.pc;
        chip8.V[0xA] = 0x00;
        (chip8 as any).step();

        expect(chip8.pc).eq(pcBeforeCycle + 4);
    })

    it('Code 0x5XY0: Should skip the next instruction if VX equals VY', () => {

        const data = new Uint8Array([0x5A, 0xB0]);
        chip8.loadROM(data);

        const pcBeforeCycle = chip8.pc;
        chip8.V[0xA] = chip8.V[0xB] = 0xCD;
        (chip8 as any).step();

        expect(chip8.pc).eq(pcBeforeCycle + 4);
    })

    it('Code 0x6XNN: Should set VX to NN.', () => {

        const data = new Uint8Array([0x6F, 0xCD]);
        chip8.loadROM(data);

        chip8.V[0xF] = 0x00;
        (chip8 as any).step();
        
        expect(chip8.V[0xF]).eq(0xCD);
    })

    it('Code 0x7XNN: Should add NN to VX (carry flag is not changed).', () => {

        const data = new Uint8Array([0x7A, 0xBC]);
        chip8.loadROM(data);

        chip8.V[0xA] = 0x22;
        (chip8 as any).step();
        
        expect(chip8.V[0xA]).eq(0x22 + 0xBC);
        expect(chip8.V[0xF]).eq(0);
    })

    it('Code 0x8XY0: Should set VX to the value of VY.', () => {

        const data = new Uint8Array([0x8A, 0xB0]);
        chip8.loadROM(data);

        chip8.V[0xB] = 0xFF;
        (chip8 as any).step();
    
        expect(chip8.V[0xA]).eq(0xFF);
    })

    it('Code 0x8XY1: Should set VX to VX or VY. (bitwise OR operation)', () => {

        const data = new Uint8Array([0x8A, 0xB1]);
        chip8.loadROM(data);

        chip8.V[0xA] = 0x01;
        chip8.V[0xB] = 0x02;
        (chip8 as any).step();
    
        expect(chip8.V[0xA]).eq(0x01 | 0x02);
    })

    it('Code 0x8XY2: Should set VX to VX and VY. (bitwise AND operation)', () => {

        const data = new Uint8Array([0x8A, 0xB2]);
        chip8.loadROM(data);

        chip8.V[0xA] = 0x01;
        chip8.V[0xB] = 0x02;
        (chip8 as any).step();
    
        expect(chip8.V[0xA]).eq(0x01 & 0x02);
    })

    it('Code 0x8XY3: Should set VX to VX xor VY.', () => {

        const data = new Uint8Array([0x8A, 0xB3]);
        chip8.loadROM(data);

        chip8.V[0xA] = 0x01;
        chip8.V[0xB] = 0x02;
        (chip8 as any).step();
    
        expect(chip8.V[0xA]).eq(0x01 ^ 0x02);
    })

    it.todo('Code 0x8XY4: Should Adds VY to VX. VF is set to 1 when there\'s a carry, and to 0 when there is not.')
    it.todo('Code 0x8XY5: Should VY is subtracted from VX. VF is set to 0 when there\'s a borrow, and 1 when there is not.')
    it.todo('Code 0x8XY6: Should Stores the least significant bit of VX in VF and then shifts VX to the right by 1')
    it.todo('Code 0x8XY7: Should Sets VX to VY minus VX. VF is set to 0 when there\'s a borrow, and 1 when there is not.')
    it.todo('Code 0x8XYE: Should Stores the most significant bit of VX in VF and then shifts VX to the left by 1.')
    
    it('Code 0x9XY0: Should skip the next instruction if VX does not equal VY.', () => {

        const data = new Uint8Array([0x9A, 0xB0]);
        chip8.loadROM(data);

        chip8.V[0xA] = 0xA;
        chip8.V[0xB] = 0xB;

        const pcBeforeCycle = chip8.pc;
        (chip8 as any).step();

        expect(chip8.pc).eq(pcBeforeCycle + 4);
    })
    
    it('Code 0xANNN: Should set I to the address NNN.', () => {

        const data = new Uint8Array([0xAF, 0xED]);
        chip8.loadROM(data);
        (chip8 as any).step();
        expect(chip8.i).eq(0xFED);
    })

    it('Code 0xBNNN: Should jump to the address NNN plus V0.', () => {

        const data = new Uint8Array([0xBA, 0xBC]);
        chip8.loadROM(data);
        chip8.V[0] = 0x0001;

        (chip8 as any).step();

        expect(chip8.pc).eq(0xABC + 0x0001);
    })
    
    it.todo('Code 0xCXNN: Should Sets VX to the result of a bitwise and operation on a random number (Typically: 0 to 255) and NN.')

    it('Code 0xDXYN: Should redraw',  () => {

        const data = new Uint8Array([0xD0, 0x00]);
        chip8.loadROM(data);

        expect(chip8.redraw).eq(false);

        (chip8 as any).step();

        expect(chip8.redraw).eq(true);
    })

    it('Code 0xEX9E: Should skip the next instruction if the key stored in VX is pressed', () => {

        const data = new Uint8Array([0xEA, 0x9E]);
        chip8.loadROM(data);
        
        chip8.keys = new Uint8Array(Array(16).fill(0));
        chip8.keys[chip8.V[0xA]] = 1;

        const pcBeforeCycle = chip8.pc;
        (chip8 as any).step()

        expect(chip8.pc).eq(pcBeforeCycle + 4);
    })

    it('Code 0xEXA1: Should skip the next instruction if the key stored in VX is not pressed', () => {

        const data = new Uint8Array([0xEA, 0xA1]);
        chip8.loadROM(data);
        
        chip8.keys = new Uint8Array(Array(16).fill(1));
        chip8.keys[chip8.V[0xA]] = 0;

        const pcBeforeCycle = chip8.pc;
        (chip8 as any).step();

        expect(chip8.pc).eq(pcBeforeCycle + 4);
    })

    it('Code 0xFX07: Should set VX to the value of the delay timer.', () => {
        
        const data = new Uint8Array([0xFC, 0x07]);
        chip8.loadROM(data);
        chip8.delayTimer = 0x1;
        (chip8 as any).step();

        expect(chip8.V[0xC]).eq(0x1)
    })

    it('Code 0xFX0A: Should wait a keypress and then stored in VX', () => {

        const data = new Uint8Array([0xFA, 0x0A]);
        chip8.loadROM(data);

        const pcBeforeCycle = chip8.pc;
        (chip8 as any).step();

        expect(chip8.pc).eq(pcBeforeCycle);

        chip8.keys[0xF] = 1;
        (chip8 as any).step();

        expect(chip8.pc).eq(pcBeforeCycle + 2);

        expect(chip8.V[0xA]).eq(0xF);
    })
    
    it('Code 0xFX15: Should set the delay timer to VX.', () => {

        const data = new Uint8Array([0xFA, 0x15]);
        chip8.loadROM(data);
        chip8.V[0xA] = 0xF;
        (chip8 as any).cycle()

        expect(chip8.delayTimer).eq(0xF - 1)
    })

    it('Code 0xFX18: Should set the sound timer to VX.', () => {

        const data = new Uint8Array([0xF5, 0x18]);
        chip8.loadROM(data);
        chip8.V[0x5] = 0xF;
        (chip8 as any).cycle()

        expect(chip8.soundTimer).eq(0xF - 1)
    })
    
    it('Code 0xFX1E: Should add VX to I. VF is not affected.', () => {

        const data = new Uint8Array([0xFF, 0x1E]);
        chip8.loadROM(data);
        chip8.i = 0x55;
        chip8.V[0xF] = 0xAB;
        (chip8 as any).cycle()

        expect(chip8.i).eq(0x55+ 0xAB);
        expect(chip8.V[0xF]).eq(0xAB);
    })

    it.todo('Code 0xFX29: Should Sets I to the location of the sprite for the character in VX. Characters 0-F (in hexadecimal) are represented by a 4x5 font')
    it.todo('Code 0xFX33: Should Stores the binary-coded decimal representation of VX, with the hundreds digit in memory at location in I, the tens digit at location I+1, and the ones digit at location I+2.')
    it.todo('Code 0xFX55: Should Stores from V0 to VX (including VX) in memory, starting at address I. The offset from I is increased by 1 for each value written, but I itself is left unmodified.')
    it.todo('Code 0xFX65: Should Fills from V0 to VX (including VX) with values from memory, starting at address I. The offset from I is increased by 1 for each value read, but I itself is left unmodified.')

})
