import {PlayerColors} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import {pieceAt} from "@/game/rules/pieceAt";

export function win(playerColors: PlayerColors, turn: PlayerColor): boolean {
    const playerColor = playerColors[turn]
    for (let i=playerColor.pathPiece.length - 4; i < playerColor.pathPiece.length; i++) {
        if (!pieceAt(playerColors, playerColor.pathPiece[i]))
            return false
    }
    return true
}
