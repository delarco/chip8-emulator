import { beforeEach, describe, expect, it } from 'vitest'
import { Chip8 } from '../src/chip8/chip8';
import { fontSet } from '../src/chip8/font-set';

describe('Chip8', () => {
  
    let chip8: Chip8;

    beforeEach(() => {

        chip8 = new Chip8();
        chip8.initialize();
    })

    it('Should have only the font set loaded after initialize', () => {

        let fontSetSum = fontSet
            .reduce((prev: number, cur: number) => prev + cur);

        let memorySum = chip8.memory
            .reduce((prev: number, cur: number) => prev + cur);
            
        let romMemorySum = chip8.memory
            .slice(0x200)
            .reduce((prev: number, cur: number) => prev + cur);

        expect(memorySum).eq(fontSetSum);

        expect(romMemorySum).eq(0);
    })

    it('Should copy ROM data into memory starting at 0x200', () => {

        const data = new Uint8Array([1, 2, 3, 4, 5]);

        chip8.loadROM(data);

        let sum = chip8.memory
            .slice(0x200)
            .reduce((prev: number, cur: number) => prev + cur);

        expect(sum).eq(15);
    })

    it('Should fetch the correct opcode', () => {

        const data = new Uint8Array([0x00, 0xE0]);
        chip8.loadROM(data);

        const opcode = (chip8 as any).fetch();
        expect(opcode).eq(0x00E0);
    })

    it('Should fetch correct X symbol (0x0X00)', () => {

        const data = new Uint8Array([0xAB, 0xCD]);
        chip8.loadROM(data);

        const opcode: number = (chip8 as any).fetch();
        const x: number = (chip8 as any).fetchX(opcode);

        expect(x).eq(0xB);
    })

    it('Should fetch correct Y symbol (0x00Y0)', () => {

        const data = new Uint8Array([0xAB, 0xCD]);
        chip8.loadROM(data);

        const opcode: number = (chip8 as any).fetch();
        const y: number = (chip8 as any).fetchY(opcode);

        expect(y).eq(0xC);
    })

    it('Should fetch correct N symbol (0x000N)', () => {

        const data = new Uint8Array([0xAB, 0xCD]);
        chip8.loadROM(data);

        const opcode: number = (chip8 as any).fetch();
        const y: number = (chip8 as any).fetchN(opcode);

        expect(y).eq(0xD);
    })

    it('Should fetch correct NN symbol (0x00NN)', () => {

        const data = new Uint8Array([0xAB, 0xCD]);
        chip8.loadROM(data);

        const opcode: number = (chip8 as any).fetch();
        const y: number = (chip8 as any).fetchNN(opcode);

        expect(y).eq(0xCD);
    })

    it('Should fetch correct NNN symbol (0x0NNN)', () => {

        const data = new Uint8Array([0xAB, 0xCD]);
        chip8.loadROM(data);

        const opcode: number = (chip8 as any).fetch();
        const y: number = (chip8 as any).fetchNNN(opcode);

        expect(y).eq(0x0BCD);
    })

    it('Should update timers after cycle', () => {

        // fill 10 CLS instructions
        let array = [0x00, 0xE0];
        for(let i = 0; i < 10; i++) array = array.concat(array);
        const data = new Uint8Array(array);

        chip8.loadROM(data);

        (chip8 as any).STEPS_PER_CYCLE = 1;
        chip8.delayTimer = 10;
        chip8.soundTimer = 5;

        for(let i = 1; i <= 10; i++) {
            (chip8 as any).cycle();
            expect(chip8.delayTimer).eq(10 - i);
            expect(chip8.soundTimer).eq(i < 5 ? 5 - i : 0);
        }
    })

    it('Should fetch correct X symbol (0x0X00)', () => {

        const data = new Uint8Array([0xAB, 0xCD]);
        chip8.loadROM(data);

        const opcode: number = (chip8 as any).fetch();
        const x: number = (chip8 as any).fetchX(opcode);

        expect(x).eq(0xB);
    })

    it('Should fetch correct Y symbol (0x00Y0)', () => {

        const data = new Uint8Array([0xAB, 0xCD]);
        chip8.loadROM(data);

        const opcode: number = (chip8 as any).fetch();
        const y: number = (chip8 as any).fetchY(opcode);

        expect(y).eq(0xC);
    })

    it('Should fetch correct N symbol (0x000N)', () => {

        const data = new Uint8Array([0xAB, 0xCD]);
        chip8.loadROM(data);

        const opcode: number = (chip8 as any).fetch();
        const y: number = (chip8 as any).fetchN(opcode);

        expect(y).eq(0xD);
    })

    it('Should fetch correct NN symbol (0x00NN)', () => {

        const data = new Uint8Array([0xAB, 0xCD]);
        chip8.loadROM(data);

        const opcode: number = (chip8 as any).fetch();
        const y: number = (chip8 as any).fetchNN(opcode);

        expect(y).eq(0xCD);
    })

    it('Should fetch correct NNN symbol (0x0NNN)', () => {

        const data = new Uint8Array([0xAB, 0xCD]);
        chip8.loadROM(data);

        const opcode: number = (chip8 as any).fetch();
        const y: number = (chip8 as any).fetchNNN(opcode);

        expect(y).eq(0x0BCD);
    })
})
