import {PlayerColor} from "@/type/PlayerColor";
import {Index} from "@/type/GameBoard";
import {PlayerColors} from "@/interface/GameBoard";
import {pieceAt} from "@/game/rules/pieceAt";

export function isConflictBetweenSameColor(turn: PlayerColor, playerColors: PlayerColors, indexPath: Index) {
    if (pieceAt(playerColors, indexPath)?.color === turn) {
        return true
    }
    return false
}

export function isConflitBetweenDifferentColor(playerColors: PlayerColors, indexPath: Index, turn: PlayerColor) {
    const occupant = pieceAt(playerColors, indexPath)
    if (occupant) {
        if (!isConflictBetweenSameColor(turn, playerColors, indexPath)) {
            const piecePlayerColor = playerColors[occupant.color].pieces[occupant.index]
            piecePlayerColor.out = false
            piecePlayerColor.indexPath = -1
            return false
        }
        return true
    }
    return false
}
