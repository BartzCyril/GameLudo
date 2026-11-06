import {GameRules, Piece, PlayerColors} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import {Index} from "@/type/GameBoard";
import {checkIfPlayerClickedOnIncorrectPiece} from "@/game/rules/correctPiece";
import {isConflictBetweenSameColor, isConflitBetweenDifferentColor} from "@/game/rules/conflict";
import {win} from "@/game/rules/win";
import {homeTarget} from "@/game/rules/home";
import {TURN_ORDER} from "@/game/ui/players";

const PRISONS: Record<PlayerColor, Index[]> = {
    [PlayerColor.YELLOW]: [0, 1, 11, 12],
    [PlayerColor.RED]: [108, 109, 119, 120],
    [PlayerColor.GREEN]: [9, 10, 20, 21],
    [PlayerColor.BLUE]: [99, 100, 110, 111],
}

export let playerColors: PlayerColors = {
    yellow: {
        pathPiece: [44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 56, 57, 58, 59],
        pieces: initialPiece(PRISONS.yellow, 4)
    },
    red: {
        pathPiece: [76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 64, 63, 62, 61],
        pieces: initialPiece(PRISONS.red, 4)
    },
    green: {
        pathPiece: [6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 16, 27, 38, 49],
        pieces: initialPiece(PRISONS.green, 4)
    },
    blue: {
        pathPiece: [114, 103, 92, 81, 70, 69, 68, 67, 66, 55, 44, 45, 46, 47, 48, 37, 26, 15, 4, 5, 6, 17, 28, 39, 50, 51, 52, 53, 54, 65, 76, 75, 74, 73, 72, 83, 94, 105, 116, 115, 104, 93, 82, 71],
        pieces: initialPiece(PRISONS.blue, 4)
    }
}

// Puts every pawn back in its stable. A free seat has no pawn at all.
export function setupPlayers(seats: PlayerColor[], pawns: number) {
    for (const color of TURN_ORDER)
        playerColors[color].pieces = seats.includes(color) ? initialPiece(PRISONS[color], pawns) : []
}

function initialPiece(pathPiece: Index[], pawns: number): Piece[] {
    let pieces: Piece[] = []
    for (let i = 0; i < pawns; i++) {
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

function getPieceOut(turn: PlayerColor): Piece[] {
    const pieces = playerColors[turn].pieces
    const array: Piece[] = []
    for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].out)
            array.push(pieces[i])
    }
    return array
}

// True when the turn passes for lack of a move. A six always keeps the turn.
export function switchPlayer(turn: PlayerColor, diceValue: number, rules: GameRules) {
    if (diceValue === 6)
        return false
    const {pieces, pathPiece} = playerColors[turn]
    return getPieceOut(turn).every(piece => {
        const target = homeTarget(pieces, piece.indexPath, diceValue, rules.exact)
        return target === -1 || isConflictBetweenSameColor(turn, playerColors, pathPiece[target])
    })
}

export const isLastTry = (count: number, rules: GameRules) => count >= rules.maxTries

export function canRetryRollDice(turn: PlayerColor, diceValue: number, rules: GameRules) {
    const piecesOut = getPieceOut(turn)
    const playerColor = playerColors[turn]
    let k = 0
    for (let i=0 ; i < piecesOut.length; i++) {
        if (piecesOut[i].indexPath === -1 || piecesOut[i].indexPath === 0) {
            return false
        }
        // The homeTarget test: a pawn that cannot jump a pawn of its lane would otherwise leave the player stuck on this six.
        if (isConflictBetweenSameColor(turn, playerColors, playerColor.pathPiece[piecesOut[i].indexPath + diceValue]) ||  ((piecesOut[i].indexPath + diceValue) > 42)
            || homeTarget(playerColor.pieces, piecesOut[i].indexPath, diceValue, rules.exact) === -1) {
            k++
        }
    }
    return k === piecesOut.length
}

// Side-effect free mirror of moveForwardPiece: isConflitBetweenDifferentColor captures, so it is not called here.
export function canMovePiece(diceResult: number, pieceIndex: Index, turn: PlayerColor, rules: GameRules): boolean {
    const playerColor = playerColors[turn]
    const piece = playerColor.pieces[pieceIndex]
    const nextCell = playerColor.pathPiece[piece.out ? homeTarget(playerColor.pieces, piece.indexPath, diceResult, rules.exact) : 0]
    if ((!piece.out && diceResult !== 6) || !nextCell)
        return false
    return !checkIfPlayerClickedOnIncorrectPiece(playerColors, pieceIndex, diceResult, piece.out, turn, rules)
        && !isConflictBetweenSameColor(turn, playerColors, nextCell)
}

export function moveForwardPiece(diceResult: number, pieceIndex: Index, turn: PlayerColor, handleSwitchTurn: () => void, handleColorWin: (color: PlayerColor) => void, rules: GameRules) {
    const playerColor = playerColors[turn]
    if (!playerColor.pieces[pieceIndex].out) {
        if (diceResult === 6) {
            if (checkIfPlayerClickedOnIncorrectPiece(playerColors, pieceIndex, diceResult, false, turn, rules))
                return -1
            else if (!isConflitBetweenDifferentColor(playerColors, playerColor.pathPiece[0], turn)) {
                playerColor.pieces[pieceIndex].out = true
                playerColor.pieces[pieceIndex].indexPath = 0
            } else {
                return -1
            }
        } else {
            return -1
        }
    } else {
        const nextIndexPath = homeTarget(playerColor.pieces, playerColor.pieces[pieceIndex].indexPath, diceResult, rules.exact);
        if (checkIfPlayerClickedOnIncorrectPiece(playerColors, pieceIndex, diceResult, true, turn, rules))
            return -1
        else if (playerColor.pathPiece[nextIndexPath] && !isConflitBetweenDifferentColor(playerColors, playerColor.pathPiece[nextIndexPath], turn)) {
            playerColor.pieces[pieceIndex].indexPath = nextIndexPath
            if (win(playerColors, turn))
                handleColorWin(turn)
        } else {
            return -1
        }
    }
    if (diceResult !== 6) {
        handleSwitchTurn()
    }
}