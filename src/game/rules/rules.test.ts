import {canMovePiece, canRetryRollDice, isLastTry, isPieceOut, moveForwardPiece, playerColors, setupPlayers, switchPlayer} from "@/game/functions";
import {moveForwardPieceBot} from "@/game/bot/functions";
import {homeTarget} from "@/game/rules/home";
import {pieceAt} from "@/game/rules/pieceAt";
import {win} from "@/game/rules/win";
import {activeSeats, nextSeat} from "@/game/settings";
import {GameRules} from "@/interface/GameBoard";
import {TURN_ORDER} from "@/game/ui/players";
import {PlayerColor} from "@/type/PlayerColor";

const {YELLOW, GREEN, RED, BLUE} = PlayerColor;
const CLASSIC: GameRules = {exact: true, maxTries: 3};
const LENIENT: GameRules = {...CLASSIC, exact: false};

function place(color: PlayerColor, ...indexes: number[]) {
    indexes.forEach((indexPath, index) => {
        playerColors[color].pieces[index].out = indexPath >= 0;
        playerColors[color].pieces[index].indexPath = indexPath;
    });
}

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
    beforeEach(() => setupPlayers(TURN_ORDER, 4));

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
        setupPlayers(TURN_ORDER, 4);
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
                const piece = [0, 1, 2, 3].find(index => canMovePiece(value, index, turn, CLASSIC));
                if (piece === undefined)
                    switched = true;
                else
                    expect(moveForwardPiece(value, piece, turn, switchIt, onWin, CLASSIC)).not.toBe(-1);
            } else {
                moveForwardPieceBot(value, turn, switchIt, onWin, CLASSIC);
                switched ||= switchPlayer(turn, value, CLASSIC);
            }
            const cells = occupiedCells();
            expect(new Set(cells).size).toBe(cells.length);
            if (switched)
                turn = nextSeat(turn, TURN_ORDER);
        }

        expect(winner).not.toBeNull();
        expect(isPieceOut(winner as unknown as PlayerColor)).toBe(true);
    });
});

describe("win", () => {
    it.each([
        [1, [43], true],
        [1, [42], false],
        [2, [43, 42], true],
        [2, [43, 41], false],
        [4, [43, 42, 41, 40], true],
        [4, [43, 42, 41, 39], false],
    ])("with %i pawn(s) at %j: %s", (pawns, cells, won) => {
        setupPlayers(TURN_ORDER, pawns);
        place(YELLOW, ...cells);
        expect(win(playerColors, YELLOW)).toBe(won);
    });
});

describe("homeTarget", () => {
    const pawns = (...cells: number[]) => cells.map(indexPath => ({indexPrison: 0, out: true, indexPath}));

    it("lets a pawn stop short of its roll without an exact entry", () => {
        expect(homeTarget(pawns(38), 38, 6, false)).toBe(43);
        expect(homeTarget(pawns(41, 43), 41, 5, false)).toBe(42);
        expect(homeTarget(pawns(39), 39, 6, false)).toBe(43);
        expect(homeTarget(pawns(38, 41), 38, 3, false)).toBe(40);
    });

    it("never jumps over a pawn of the lane", () => {
        expect(homeTarget(pawns(38, 41), 38, 4, false)).toBe(40);
    });

    it("refuses when no cell of the lane can be reached", () => {
        expect(homeTarget(pawns(42, 43), 42, 3, false)).toBe(-1);
        expect(homeTarget(pawns(43), 43, 3, false)).toBe(-1);
        expect(homeTarget(pawns(38, 40), 38, 3, false)).toBe(-1);
    });

    it("leaves the common track alone", () => {
        expect(homeTarget(pawns(20), 20, 6, false)).toBe(26);
    });

    it("keeps the exact rules with the six faces on", () => {
        expect(homeTarget(pawns(38), 38, 6, true)).toBe(-1);
        expect(homeTarget(pawns(38), 38, 5, true)).toBe(43);
        expect(homeTarget(pawns(41, 43), 41, 2, true)).toBe(-1);
        expect(homeTarget(pawns(41, 43), 41, 1, true)).toBe(42);
        expect(homeTarget(pawns(38, 41), 38, 4, true)).toBe(-1);
    });
});

describe("lenient entry in the game", () => {
    beforeEach(() => setupPlayers(TURN_ORDER, 2));

    it("gives the human and the bot the same move", () => {
        place(YELLOW, 41, 43);
        expect(canMovePiece(5, 0, YELLOW, LENIENT)).toBe(true);
        expect(switchPlayer(YELLOW, 5, LENIENT)).toBe(false);
        moveForwardPiece(5, 0, YELLOW, () => {}, () => {}, LENIENT);
        expect(playerColors.yellow.pieces[0].indexPath).toBe(42);

        place(GREEN, 41, 43);
        moveForwardPieceBot(5, GREEN, () => {}, () => {}, LENIENT);
        expect(playerColors.green.pieces[0].indexPath).toBe(42);
    });

    it("passes the turn when the pawn is at the end of the lane", () => {
        place(YELLOW, 42, 43);
        expect(canMovePiece(3, 0, YELLOW, LENIENT)).toBe(false);
        expect(switchPlayer(YELLOW, 3, LENIENT)).toBe(true);
    });

    it("changes nothing with the six faces on", () => {
        place(YELLOW, 38, 43);
        expect(canMovePiece(6, 0, YELLOW, CLASSIC)).toBe(false);
        expect(canMovePiece(4, 0, YELLOW, CLASSIC)).toBe(true);
        expect(moveForwardPiece(6, 0, YELLOW, () => {}, () => {}, CLASSIC)).toBe(-1);
    });

    it("wins with the last pawn pushed in", () => {
        setupPlayers(TURN_ORDER, 1);
        place(YELLOW, 40);
        const winner = jest.fn();
        moveForwardPiece(5, 0, YELLOW, () => {}, winner, LENIENT);
        expect(winner).toHaveBeenCalledWith(YELLOW);
    });
});

describe("a six", () => {
    beforeEach(() => setupPlayers(TURN_ORDER, 4));

    it("keeps the turn, for the human and the bot", () => {
        const human = jest.fn();
        moveForwardPiece(6, 0, YELLOW, human, () => {}, CLASSIC);
        expect(playerColors.yellow.pieces[0].out).toBe(true);
        expect(human).not.toHaveBeenCalled();

        const bot = jest.fn();
        moveForwardPieceBot(6, GREEN, bot, () => {}, CLASSIC);
        expect(playerColors.green.pieces[0].out).toBe(true);
        expect(bot).not.toHaveBeenCalled();
    });

    it("is needed to bring a pawn out", () => {
        expect(canMovePiece(5, 0, YELLOW, CLASSIC)).toBe(false);
        expect(switchPlayer(YELLOW, 5, CLASSIC)).toBe(true);
    });

    it("gives a new roll when no pawn can use it", () => {
        place(YELLOW, 40, 41, 42, 43);
        expect(switchPlayer(YELLOW, 6, CLASSIC)).toBe(false);
        expect(canRetryRollDice(YELLOW, 6, CLASSIC)).toBe(true);
    });
});

describe("threeTries", () => {
    it("gives 3 rolls when on, a single one when off", () => {
        expect([1, 2, 3].map(count => isLastTry(count, CLASSIC))).toEqual([false, false, true]);
        expect(isLastTry(1, {...CLASSIC, maxTries: 1})).toBe(true);
    });
});

it("offers a new roll on a six whose only pawn cannot jump the one in its lane", () => {
    setupPlayers(TURN_ORDER, 2);
    place(YELLOW, 36, 41);
    expect([0, 1].some(index => canMovePiece(6, index, YELLOW, CLASSIC))).toBe(false);
    expect(canRetryRollDice(YELLOW, 6, CLASSIC)).toBe(true);
});

describe("a free seat", () => {
    it("has no pawn, and nothing breaks on its empty list", () => {
        setupPlayers(activeSeats(3, YELLOW), 2);
        expect(playerColors.green.pieces).toEqual([]);
        expect(playerColors.red.pieces).toHaveLength(2);
        expect(pieceAt(playerColors, 9)).toBeNull();
        expect(isPieceOut(GREEN)).toBe(false);
    });
});

// The turn logic of GameBoard, without the screen: nobody may ever be left with nothing to do.
describe.each([
    ["2 players, 1 pawn, 4-5-6", 2, 1, [4, 5, 6]],
    ["3 players, 2 pawns, 3-4-5-6", 3, 2, [3, 4, 5, 6]],
    ["2 players, 2 pawns, all faces", 2, 2, [1, 2, 3, 4, 5, 6]],
    ["3 players, 3 pawns, 5-6", 3, 3, [5, 6]],
    ["4 players, 4 pawns, 2-6", 4, 4, [2, 6]],
    ["2 players, 4 pawns, all faces", 2, 4, [1, 2, 3, 4, 5, 6]],
] as const)("a whole game with %s", (_, players, pawns, dice) => {
    it.each([1, 2, 3, 4, 5, 6, 7, 8])("ends with a winner and never stacks or blocks (seed %i)", seed => {
        const human = RED;
        const seats = activeSeats(players, human);
        const rules: GameRules = {exact: dice.length === 6, maxTries: 3};
        setupPlayers(seats, pawns);
        const roll = seeded(seed);
        let turn = seats[0];
        let winner: PlayerColor | null = null;

        for (let step = 0; step < 400000 && !winner; step++) {
            const value = dice[(roll() - 1) % dice.length];
            let switched = false;
            const switchIt = () => { switched = true };
            const onWin = (color: PlayerColor) => { winner = color };
            if (turn === human) {
                const piece = playerColors[turn].pieces.map((_, index) => index).find(index => canMovePiece(value, index, turn, rules));
                if (piece === undefined) {
                    const passes = switchPlayer(turn, value, rules);
                    expect(passes || (value === 6 && canRetryRollDice(turn, value, rules))).toBe(true);
                    switched = passes;
                } else {
                    expect(moveForwardPiece(value, piece, turn, switchIt, onWin, rules)).not.toBe(-1);
                }
            } else {
                moveForwardPieceBot(value, turn, switchIt, onWin, rules);
                switched ||= switchPlayer(turn, value, rules);
            }
            const cells = occupiedCells();
            expect(new Set(cells).size).toBe(cells.length);
            if (switched)
                turn = nextSeat(turn, seats);
        }

        expect(winner).not.toBeNull();
        expect(seats).toContain(winner);
        expect(TURN_ORDER.filter(color => !seats.includes(color)).flatMap(color => playerColors[color].pieces)).toEqual([]);
    });
});
