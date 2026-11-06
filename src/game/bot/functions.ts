import {PlayerColor} from "@/type/PlayerColor";
import {isPieceOut, playerColors} from "@/game/functions";
import {isConflitBetweenDifferentColor} from "@/game/rules/conflict";
import {GameRules, PlayerColors} from "@/interface/GameBoard";
import {Index} from "@/type/GameBoard";
import {checkIfPlayerClickedOnIncorrectPiece, startingCellContainChild} from "@/game/rules/correctPiece";
import {homeTarget} from "@/game/rules/home";
import {pieceAt} from "@/game/rules/pieceAt";
import {win} from "@/game/rules/win";

function piecesWhere(turn: PlayerColor, out: boolean): Index[] {
    return playerColors[turn].pieces.flatMap((piece, index) => piece.out === out ? [index] : [])
}

function forwardPiece(playerColor: PlayerColors[PlayerColor], pieceOut: Index[], diceResult: number, endMove: () => void, turn: PlayerColor, handleColorWin: (color: PlayerColor) => void, rules: GameRules) {
    for (const index of pieceOut) {
        const playerColorPiece = playerColor.pieces[index]
        const target = homeTarget(playerColor.pieces, playerColorPiece.indexPath, diceResult, rules.exact)
        const nextPosition = playerColor.pathPiece[target]
        if (!checkIfPlayerClickedOnIncorrectPiece(playerColors, index, diceResult, true, turn, rules)) {
            if (nextPosition && !isConflitBetweenDifferentColor(playerColors, nextPosition, turn)) {
                playerColorPiece.indexPath = target
                if (win(playerColors, turn))
                    handleColorWin(turn)
                endMove()
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

export function moveForwardPieceBot(diceResult: number, turn: PlayerColor, handleSwitchTurn: () => void, handleColorWin: (color: PlayerColor) => void, rules: GameRules) {
    const playerColor = playerColors[turn]
    const endMove = () => {
        if (diceResult !== 6)
            handleSwitchTurn()
    }
    if (!isPieceOut(turn)) {
        if (diceResult === 6 && !isConflitBetweenDifferentColor(playerColors, playerColor.pathPiece[0], turn)) {
            outPiece(playerColor, 0)
            endMove()
        }
        return
    }
    const pieceOut = piecesWhere(turn, true)
    if (pieceOut.length < playerColor.pieces.length) {
        if (diceResult === 6 && !startingCellContainChild(playerColors, turn) && !isConflitBetweenDifferentColor(playerColors, playerColor.pathPiece[0], turn)) {
            outPiece(playerColor, piecesWhere(turn, false)[0])
            endMove()
            return
        }
        // A pawn on the starting cell moves first, unless the roll is a six.
        if (diceResult !== 6 && startingCellContainChild(playerColors, turn)) {
            forwardPiece(playerColor, pieceOut, diceResult, endMove, turn, handleColorWin, rules)
            return
        }
    }
    if (eatPiece(playerColor, pieceOut, diceResult, turn)) {
        endMove()
        return
    }
    forwardPiece(playerColor, pieceOut, diceResult, endMove, turn, handleColorWin, rules)
}
