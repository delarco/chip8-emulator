export interface ROM {

    title: string;
    author: string | null;
    year: number | null;
    description: string;
    filename: string;
    data: Uint8Array;
}
