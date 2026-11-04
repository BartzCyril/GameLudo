import {PlayerColor} from "@/type/PlayerColor";
import {Index} from "@/type/GameBoard";
import {PlayerColors} from "@/interface/GameBoard";
import {ErrorMessage} from "@/type/ErrorMessage";
import {pieceAt} from "@/game/rules/pieceAt";

export function isConflictBetweenSameColor(turn: PlayerColor, playerColors: PlayerColors, indexPath: Index, handleError?: (message: ErrorMessage | null) => void) {
    if (handleError) {
        handleError(null)
    }
    if (pieceAt(playerColors, indexPath)?.color === turn) {
        if (handleError) {
            handleError(ErrorMessage.MOVE_PIECE_FIRST)
        }
        return true
    }
    return false
}

export function isConflitBetweenDifferentColor(playerColors: PlayerColors, indexPath: Index, turn: PlayerColor, handleError?: (message: ErrorMessage | null) => void) {
    const occupant = pieceAt(playerColors, indexPath)
    if (occupant) {
        if (!isConflictBetweenSameColor(turn, playerColors, indexPath, handleError)) {
            const piecePlayerColor = playerColors[occupant.color].pieces[occupant.index]
            piecePlayerColor.out = false
            piecePlayerColor.indexPath = -1
            return false
        }
        return true
    }
    return false
}
