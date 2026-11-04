import {Piece, PlayerColors} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import {Index} from "@/type/GameBoard";
import {ErrorMessage} from "@/type/ErrorMessage";
import {checkIfPlayerClickedOnIncorrectPiece} from "@/game/rules/correctPiece";
import {isConflictBetweenSameColor, isConflitBetweenDifferentColor} from "@/game/rules/conflict";
import {win} from "@/game/rules/win";
import {home} from "@/game/rules/home";

export let playerColors: PlayerColors = {
    yellow: {
        pathPiece: [44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 56, 57, 58, 59],
        pieces: initialPiece([0, 1, 11, 12]),
        isPlay: false
    },
    red: {
        pathPiece: [76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 64, 63, 62, 61],
        pieces: initialPiece([108, 109, 119, 120]),
        isPlay: false
    },
    green: {
        pathPiece: [6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 16, 27, 38, 49],
        pieces: initialPiece([9, 10, 20, 21]),
        isPlay: false
    },
    blue: {
        pathPiece: [114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 104, 93, 82, 71],
        pieces: initialPiece([99, 100, 110, 111]),
        isPlay: false

    }
}

export function resetPlayerColors() {
    for (const playerColor of Object.values(playerColors)) {
        playerColor.pieces.forEach(piece => {
            piece.out = false
            piece.indexPath = -1
        })
        playerColor.isPlay = false
    }
}

export function switchTurn(turn: PlayerColor): PlayerColor {
    switch (turn) {
        case "yellow":
            return PlayerColor.GREEN
        case "red":
            return PlayerColor.BLUE
        case "blue":
            return PlayerColor.YELLOW
        default:
            return PlayerColor.RED
    }
}

function initialPiece(pathPiece: Index[]): Piece[] {
    let pieces: Piece[] = []
    for (let i = 0; i < 4; i++) {
        pieces.push({
            indexPrison: pathPiece[i],
            out: false,
            indexPath: -1
        })
    }
    return pieces
}

export function isPieceOut(turn: PlayerColor): boolean {
    const pieces = playerColors[turn].pieces
    let count: number = 0
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].out)
            count++
    }
    return count >= 1
}

export function getPieceOut(turn: PlayerColor): Piece[] {
    const pieces = playerColors[turn].pieces
    const array: Piece[] = []
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].out)
            array.push(pieces[i])
    }
    return array
}

export function switchPlayer(turn: PlayerColor, diceValue: number) {
    const pieceOut = isPieceOut(turn)
    if (!pieceOut && diceValue !== 6)
        return true
    if (diceValue === 6)
        return false
    if (pieceOut) {
        const piecesOut = getPieceOut(turn)
        let count = 0
        for (const piece of piecesOut) {
            if (!playerColors[turn].pathPiece[piece.indexPath + diceValue]) {
                count++
            }
            else if (isConflictBetweenSameColor(turn, playerColors, playerColors[turn].pathPiece[piece.indexPath + diceValue])) {
                count++
            }
            else {
                let pieceIndex: number = 0
                for (let i = 0; i < playerColors[turn].pieces.length; i++) {
                    if (piece.indexPrison === playerColors[turn].pieces[i].indexPrison)
                        break
                    pieceIndex++
                }
                if (!home(playerColors, turn, pieceIndex, diceValue)) {
                    count++
                }
            }
        }
        return count === piecesOut.length
    }
}

export function canRetryRollDice(turn: PlayerColor, diceValue: number) {
    const piecesOut = getPieceOut(turn)
    const playerColor = playerColors[turn]
    let k = 0
    for (let i=0 ; i < piecesOut.length; i++) {
        if (piecesOut[i].indexPath === -1 || piecesOut[i].indexPath === 0) {
            return false
        }
        if (isConflictBetweenSameColor(turn, playerColors, playerColor.pathPiece[piecesOut[i].indexPath + diceValue]) ||  ((piecesOut[i].indexPath + diceValue) > 42)) {
            k++
        }
    }
    return k === piecesOut.length
}

// Side-effect free mirror of moveForwardPiece: isConflitBetweenDifferentColor captures, so it is not called here.
export function canMovePiece(diceResult: number, pieceIndex: Index, turn: PlayerColor): boolean {
    const playerColor = playerColors[turn]
    const piece = playerColor.pieces[pieceIndex]
    const nextCell = playerColor.pathPiece[piece.out ? piece.indexPath + diceResult : 0]
    if ((!piece.out && diceResult !== 6) || !nextCell)
        return false
    return !checkIfPlayerClickedOnIncorrectPiece(playerColors, pieceIndex, diceResult, piece.out, turn)
        && !isConflictBetweenSameColor(turn, playerColors, nextCell)
}

export function moveForwardPiece(diceResult: number, pieceIndex: Index, turn: PlayerColor, handleSwitchTurn: () => void, handleError: (message: ErrorMessage | null) => void, error: ErrorMessage | null, handleColorWin: (color: PlayerColor) => void) {
    const playerColor = playerColors[turn]
    if (!playerColor.pieces[pieceIndex].out) {
        if (diceResult === 6) {
            if (checkIfPlayerClickedOnIncorrectPiece(playerColors, pieceIndex, diceResult, false, turn, error, handleError))
                return -1
            else if (!isConflitBetweenDifferentColor(playerColors, playerColor.pathPiece[0], turn, handleError)) {
                playerColor.pieces[pieceIndex].out = true
                playerColor.pieces[pieceIndex].indexPath = 0
                handleError(null)
            } else {
                return -1
            }
        } else {
            handleError(ErrorMessage.ROLL_SIX_TO_RELEASE)
            return -1
        }
    } else {
        const nextIndexPath = playerColor.pieces[pieceIndex].indexPath + diceResult;
        if (checkIfPlayerClickedOnIncorrectPiece(playerColors, pieceIndex, diceResult, true, turn, error, handleError))
            return -1
        else if (playerColor.pathPiece[nextIndexPath] && !isConflitBetweenDifferentColor(playerColors, playerColor.pathPiece[nextIndexPath], turn, handleError)) {
            playerColor.pieces[pieceIndex].indexPath = nextIndexPath
            handleError(null)
            if (win(playerColors, turn))
                handleColorWin(turn)
        } else {
            return -1
        }
    }
    playerColors[turn].isPlay = diceResult !== 6;
    if (diceResult !== 6) {
        handleSwitchTurn()
    }
}