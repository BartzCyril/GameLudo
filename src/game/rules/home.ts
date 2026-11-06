import {Piece, PlayerColors} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import {Index} from "@/type/GameBoard";
import {HOME_START, LAST_HOME_CELL} from "@/game/ui/players";

// Where a roll takes a pawn, or -1. The human, the bot and "no move possible" all ask here.
// A pawn never lands on or jumps over one of its own in the final lane. With `exact` such a roll is refused;
// without it the pawn stops at the deepest free cell, as long as that cell is in the lane.
export function homeTarget(pieces: Piece[], indexPath: number, value: number, exact: boolean): number {
    const target = indexPath + value
    const ahead = pieces.map(piece => piece.indexPath).filter(index => index >= HOME_START && index > indexPath)
    const stop = Math.min(LAST_HOME_CELL + 1, ...ahead)
    if (target < stop)
        return target
    const deepest = stop - 1
    return !exact && deepest >= HOME_START && deepest > indexPath ? deepest : -1
}

export function home(playerColors: PlayerColors, turn: PlayerColor, pieceIndex: Index, diceResult: number, exact: boolean): boolean {
    const {pieces} = playerColors[turn]
    return homeTarget(pieces, pieces[pieceIndex].indexPath, diceResult, exact) !== -1
}
