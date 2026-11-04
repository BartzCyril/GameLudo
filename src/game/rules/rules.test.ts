import {canMovePiece, isPieceOut, moveForwardPiece, playerColors, resetPlayerColors, switchPlayer, switchTurn} from "@/game/functions";
import {moveForwardPieceBot} from "@/game/bot/functions";
import {pieceAt} from "@/game/rules/pieceAt";
import {PlayerColor} from "@/type/PlayerColor";

const {YELLOW, GREEN} = PlayerColor;

function seeded(seed: number) {
    return () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return 1 + Math.floor(seed / 4294967296 * 6);
    };
}

function occupiedCells() {
    return Object.values(playerColors).flatMap(({pathPiece, pieces}) => pieces.map(piece => piece.out ? pathPiece[piece.indexPath] : piece.indexPrison));
}

describe("pieceAt", () => {
    beforeEach(resetPlayerColors);

    it("finds a piece in its stable and on the track, and nothing elsewhere", () => {
        expect(pieceAt(playerColors, 11)).toEqual({color: YELLOW, index: 2});
        playerColors.green.pieces[1].out = true;
        playerColors.green.pieces[1].indexPath = 3;
        expect(pieceAt(playerColors, playerColors.green.pathPiece[3])).toEqual({color: GREEN, index: 1});
        expect(pieceAt(playerColors, 10)).toBeNull();
        expect(pieceAt(playerColors, 60)).toBeNull();
    });
});

describe("a whole game", () => {
    it.each([1, 2, 3, 4, 5])("never stacks two pieces and ends with a winner (seed %i)", (seed) => {
        resetPlayerColors();
        const roll = seeded(seed);
        const human = GREEN;
        let turn = YELLOW;
        let winner: PlayerColor | null = null;

        for (let step = 0; step < 200000 && !winner; step++) {
            const value = roll();
            let switched = false;
            const switchIt = () => { switched = true };
            const onWin = (color: PlayerColor) => { winner = color };
            if (turn === human) {
                const piece = [0, 1, 2, 3].find(index => canMovePiece(value, index, turn));
                if (piece === undefined)
                    switched = true;
                else
                    expect(moveForwardPiece(value, piece, turn, switchIt, () => {}, null, onWin)).not.toBe(-1);
            } else {
                moveForwardPieceBot(value, turn, switchIt, onWin);
                switched ||= !!switchPlayer(turn, value);
            }
            const cells = occupiedCells();
            expect(new Set(cells).size).toBe(cells.length);
            if (switched)
                turn = switchTurn(turn);
        }

        expect(winner).not.toBeNull();
        expect(isPieceOut(winner as unknown as PlayerColor)).toBe(true);
    });
});
