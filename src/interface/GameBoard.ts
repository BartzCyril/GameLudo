import {Index} from "@/type/GameBoard";

export interface Piece {
    indexPrison: number,
    out: boolean,
    indexPath: number
}

export interface PlayerColors {
    [key: string] : {
        pathPiece: Index[],
        pieces: Piece[]
    },
}