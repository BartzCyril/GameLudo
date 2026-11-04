import {PlayerColor} from "@/type/PlayerColor";
import {Index} from "@/type/GameBoard";
import {isConflictBetweenSameColor} from "@/game/rules/conflict";
import {PlayerColors} from "@/interface/GameBoard";
import {home} from "@/game/rules/home";
import {pieceAt} from "@/game/rules/pieceAt";

function numberPieceOut(playerColors: PlayerColors, turn: string): number {
    const pieces = playerColors[turn].pieces
    let count: number = 0
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].out)
            count++
    }
    return count
}

export function startingCellContainChild(playerColors: PlayerColors, turn: PlayerColor) {
    return pieceAt(playerColors, playerColors[turn].pathPiece[0])?.color === turn
}

function checkIfClickedChildMatchesStartingCell(playerColors: PlayerColors, turn: PlayerColor, pieceIndex: Index): boolean {
    return pieceAt(playerColors, playerColors[turn].pathPiece[0])?.index === pieceIndex
}

function checkIfPlayerClickedOnPieceBlockingStartingCell(playerColors: PlayerColors, indexPath: Index, pieceIndex: Index, turn: PlayerColor, diceResult: number) {
    const child = pieceAt(playerColors, indexPath)
    if (child) {
        const isBlockNextCell = pieceAt(playerColors, playerColors[turn].pathPiece[diceResult*2])?.color === turn
        if (!isBlockNextCell) {
            return pieceIndex === child.index
        }
    }
    return true
}

export function checkIfPlayerClickedOnIncorrectPiece(playerColors: PlayerColors, pieceIndex: Index, diceResult: number, isPieceOut: boolean, turn: PlayerColor): boolean {
    const numberPieceOutColor = numberPieceOut(playerColors,turn)
    if (numberPieceOutColor >= 1 && numberPieceOutColor <= 4) {
        if (!home(playerColors, turn, pieceIndex, diceResult) && playerColors[turn].pathPiece[playerColors[turn].pieces[pieceIndex].indexPath + diceResult]) {
            return true
        }
    }
    if (numberPieceOutColor >= 1 && numberPieceOutColor < 4) {
        if (!isPieceOut)
            return false
        else {
            if (numberPieceOutColor >= 1 && diceResult === 6 && !startingCellContainChild(playerColors, turn)) {
                return true
            }
        }
        const playerColor = playerColors[turn]
        const nextIndexPath = playerColor.pathPiece[diceResult];
        if (checkIfClickedChildMatchesStartingCell(playerColors, turn, pieceIndex))
            return false
        if (startingCellContainChild(playerColors, turn) && isPieceOut && numberPieceOutColor > 1) {
            if (isConflictBetweenSameColor(turn, playerColors, nextIndexPath)) {
                if (!checkIfPlayerClickedOnPieceBlockingStartingCell(playerColors, nextIndexPath, pieceIndex, turn, diceResult)) {
                    return true
                }
                return false
            }
            return true
        }
    }
    return false
}
