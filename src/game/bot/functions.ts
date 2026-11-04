import {PlayerColor} from "@/type/PlayerColor";
import {isPieceOut, playerColors} from "@/game/functions";
import {isConflitBetweenDifferentColor} from "@/game/rules/conflict";
import {PlayerColors} from "@/interface/GameBoard";
import {Index} from "@/type/GameBoard";
import {checkIfPlayerClickedOnIncorrectPiece, startingCellContainChild} from "@/game/rules/correctPiece";
import {pieceAt} from "@/game/rules/pieceAt";
import {win} from "@/game/rules/win";

function piecesWhere(turn: PlayerColor, out: boolean): Index[] {
    return playerColors[turn].pieces.flatMap((piece, index) => piece.out === out ? [index] : [])
}

function forwardPiece(playerColor: PlayerColors[PlayerColor], pieceOut: Index[], diceResult: number, handleSwitchTurn: () => void, turn: PlayerColor, handleColorWin: (color: PlayerColor) => void) {
    for (const index of pieceOut) {
        const playerColorPiece = playerColor.pieces[index]
        const nextPosition = playerColor.pathPiece[playerColorPiece.indexPath + diceResult]
        if (!checkIfPlayerClickedOnIncorrectPiece(playerColors, index, diceResult, true, turn)) {
            if (nextPosition && !isConflitBetweenDifferentColor(playerColors, nextPosition, turn)) {
                playerColorPiece.indexPath = playerColorPiece.indexPath + diceResult
                if (win(playerColors, turn))
                    handleColorWin(turn)
                if (diceResult === 6)
                    return
                handleSwitchTurn()
                return
            }
        }
    }
}

function eatPiece(playerColor: PlayerColors[PlayerColor], pieceOut: Index[], diceResult: number, turn: PlayerColor) {
    for (const index of pieceOut) {
        const playerColorPiece = playerColor.pieces[index]
        const nextPosition = playerColor.pathPiece[playerColorPiece.indexPath + diceResult]
        if (nextPosition) {
            const child = pieceAt(playerColors, nextPosition)
            if (child && child.color !== turn) {
                const childPlayer = playerColors[child.color].pieces[child.index]
                childPlayer.out = false
                childPlayer.indexPath = -1
                playerColorPiece.indexPath = playerColorPiece.indexPath + diceResult
                return true
            }
        }
    }
    return false
}

function outPiece(playerColor: PlayerColors[PlayerColor], index: Index) {
    playerColor.pieces[index].out = true
    playerColor.pieces[index].indexPath = 0
}

export function moveForwardPieceBot(diceResult: number, turn: PlayerColor, handleSwitchTurn: () => void, handleColorWin: (color: PlayerColor) => void) {
    const playerColor = playerColors[turn]
    if (!isPieceOut(turn)) {
        if (diceResult === 6)
            if (!isConflitBetweenDifferentColor(playerColors, playerColor.pathPiece[0], turn)) {
                outPiece(playerColor, 0)
                return
            }
        else
            return
    } else {
        const pieceOut = piecesWhere(turn, true)
        if (pieceOut.length < 4) {
            if (diceResult !== 6) {
                if (startingCellContainChild(playerColors, turn)) {
                    forwardPiece(playerColor, pieceOut, diceResult, handleSwitchTurn, turn, handleColorWin)
                }
                else {
                    if (eatPiece(playerColor, pieceOut, diceResult, turn)) {
                        handleSwitchTurn()
                        return
                    }
                    forwardPiece(playerColor, pieceOut, diceResult, handleSwitchTurn, turn, handleColorWin)
                }
                return
            } else {
                if (!startingCellContainChild(playerColors, turn) && !isConflitBetweenDifferentColor(playerColors, playerColor.pathPiece[0], turn)) {
                    outPiece(playerColor, piecesWhere(turn, false)[0])
                } else {
                    if (eatPiece(playerColor, pieceOut, diceResult, turn)) {
                        return
                    }
                    forwardPiece(playerColor, pieceOut, diceResult, handleSwitchTurn, turn, handleColorWin)
                }
                return
            }
        } else {
            if (eatPiece(playerColor, pieceOut, diceResult, turn)) {
                if (diceResult === 6)
                    return
                handleSwitchTurn()
                return
            }
            forwardPiece(playerColor, pieceOut, diceResult, handleSwitchTurn, turn, handleColorWin)
        }
    }
}
