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

// What the engine needs from the settings of the game in progress.
export interface GameRules {
    exact: boolean,     // false: a big enough roll enters the final lane (see homeTarget)
    maxTries: number    // rolls per turn while nobody has a pawn out
}
