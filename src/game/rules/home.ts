import {PlayerColors} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import {Index} from "@/type/GameBoard";
import {pieceAt} from "@/game/rules/pieceAt";

function getPieceIndexIfPlayerGoingToHome(playerColors: PlayerColors, turn: PlayerColor, pieceIndex: Index, diceResult: number): number {
    const playerColor = playerColors[turn]
    const nextIndexPath = playerColor.pieces[pieceIndex].indexPath + diceResult
    if (playerColor.pathPiece[nextIndexPath]) {
        for (let i = playerColor.pathPiece.length - 4; i < playerColor.pathPiece.length; i++) {
            if (playerColor.pathPiece[nextIndexPath] === playerColor.pathPiece[i])
                return nextIndexPath
        }
    }
    return -1
}

function countPiecesInHouse(playerColors: PlayerColors, turn: PlayerColor): Index[] {
    const playerColor = playerColors[turn];
    let childs: Index[] = [];
    for (let i = playerColor.pathPiece.length - 4; i < playerColor.pathPiece.length; i++) {
        const child = pieceAt(playerColors, playerColor.pathPiece[i]);
        if (child) {
            childs.push(child.index);
        }
    }
    return childs;
}

function getPositionPrison(playerColors: PlayerColors, turn: PlayerColor, indexPath: Index): number {
    const playerColor = playerColors[turn]
    let k = 0
    for (let i = playerColor.pathPiece.length - 4; i < playerColor.pathPiece.length; i++) {
        if (playerColor.pathPiece[indexPath] === playerColor.pathPiece[i])
            return k
        k++
    }
    return k
}

function isPieceInHome(playerColors: PlayerColors, turn: PlayerColor, pieceIndex: Index) {
    const playerColor = playerColors[turn]
    for (let i = playerColor.pathPiece.length - 4; i < playerColor.pathPiece.length; i++) {
        if (playerColor.pathPiece[playerColor.pieces[pieceIndex].indexPath] === playerColor.pathPiece[i])
            return true
    }
    return false
}

export function home(playerColors: PlayerColors, turn: PlayerColor, pieceIndex: Index, diceResult: number): boolean {
    const playerColor = playerColors[turn]
    if (isPieceInHome(playerColors, turn, pieceIndex)) {
        if (playerColor.pathPiece[playerColor.pieces[pieceIndex].indexPath + diceResult]) {
            const piecesInHouse = countPiecesInHouse(playerColors, turn)
            if (piecesInHouse.length >= 1) {
                if (piecesInHouse.length === 1)
                    return true
                else {
                    const positionPlayer = playerColors[turn].pieces[pieceIndex].indexPath
                    const playerPositionPrison = getPositionPrison(playerColors, turn, positionPlayer)
                    const nextPositionPlayer = playerColors[turn].pieces[pieceIndex].indexPath + diceResult
                    const playerNextPositionPrison = getPositionPrison(playerColors, turn, nextPositionPlayer)
                    for (const childIndex of piecesInHouse) {
                        const childIndexPath = playerColors[turn].pieces[childIndex].indexPath
                        const childPositionPrison = getPositionPrison(playerColors, turn, childIndexPath)
                        if (childPositionPrison === playerNextPositionPrison)
                            return false
                        if (childPositionPrison !== playerPositionPrison && playerPositionPrison < childPositionPrison) {
                            if (playerNextPositionPrison >= childPositionPrison) {
                                return false
                            }
                        }
                    }
                    return true
                }
            }
        }
        return false
    }
    const nextPieceIndex = getPieceIndexIfPlayerGoingToHome(playerColors, turn, pieceIndex, diceResult)
    if (nextPieceIndex !== -1) {
        const piecesInHouse = countPiecesInHouse(playerColors, turn)
        if (piecesInHouse.length >= 1) {
            const nextPiecePositionPrison = getPositionPrison(playerColors, turn, nextPieceIndex)
            for (const childIndex of piecesInHouse) {
                const childIndexPath = playerColors[turn].pieces[childIndex].indexPath
                const childPositionPrison = getPositionPrison(playerColors, turn, childIndexPath)
                if ((playerColors[turn].pieces[pieceIndex].indexPath + diceResult) === childIndexPath) {
                    return false
                }
                if (nextPiecePositionPrison >= childPositionPrison) {
                    return false
                }
            }
        }
        return true
    }
    return true
}