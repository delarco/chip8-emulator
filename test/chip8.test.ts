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
})
