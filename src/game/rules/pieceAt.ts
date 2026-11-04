import {PlayerColors} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import {Index} from "@/type/GameBoard";

// Which piece stands on a cell, stable cells included.
export function pieceAt(playerColors: PlayerColors, cell: Index) {
    for (const [color, {pathPiece, pieces}] of Object.entries(playerColors)) {
        const index = pieces.findIndex(piece => (piece.out ? pathPiece[piece.indexPath] : piece.indexPrison) === cell)
        if (index !== -1)
            return {color: color as PlayerColor, index}
    }
    return null
}
