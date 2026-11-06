import {applyPieces, BoardSave, clearGame, loadGame, nextHistoryId, SAVE_KEY, SAVE_VERSION, SavedGame, saveGame, SaveStorage, snapshotBoard} from "@/game/save";
import {newDraw} from "@/game/draw";
import {playerColors, setupPlayers} from "@/game/functions";
import {activeSeats, DEFAULT_SETTINGS, PRESETS, Settings} from "@/game/settings";
import {TURN_ORDER} from "@/game/ui/players";
import {PlayerColor} from "@/type/PlayerColor";

const {YELLOW, GREEN, RED, BLUE} = PlayerColor;

function memoryStorage(): SaveStorage & { data: Map<string, string> } {
    const data = new Map<string, string>();
    return {
        data,
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => void data.set(key, value),
        removeItem: (key) => void data.delete(key),
    };
}

function boardState(): Omit<BoardSave, "pieces"> {
    return {
        turn: RED, diceValue: 4, preGame: false, count: 1, canRollDice: false, lastRoll: 4, skipped: false,
        moves: [{id: 7, color: RED, key: "roll", vars: {value: 4}}, {id: 6, color: GREEN, key: "advance", vars: {value: 2, victim: RED}}],
        turnNumber: 12,
    };
}

function playingSave(): SavedGame {
    setupPlayers(TURN_ORDER, 4);
    playerColors.red.pieces[0].out = true;
    playerColors.red.pieces[0].indexPath = 18;
    playerColors.green.pieces[2].out = true;
    playerColors.green.pieces[2].indexPath = 41;
    return {version: SAVE_VERSION, savedAt: "2026-11-04T18:00:00.000Z", phase: "playing", color: RED, settings: DEFAULT_SETTINGS, seats: activeSeats(4, RED),
        draw: {...newDraw(TURN_ORDER), winner: GREEN}, board: snapshotBoard(boardState())};
}

const quick: Settings = {...DEFAULT_SETTINGS, ...PRESETS.quick};

// A game with 3 players and 2 pawns: the human is yellow, so green's corner is free.
function quickSave(): Extract<SavedGame, {phase: "playing"}> {
    const seats = activeSeats(3, YELLOW);
    setupPlayers(seats, 2);
    playerColors.red.pieces[1].out = true;
    playerColors.red.pieces[1].indexPath = 12;
    return {version: SAVE_VERSION, savedAt: "2026-11-04T18:00:00.000Z", phase: "playing", color: YELLOW, settings: quick, seats,
        draw: {...newDraw(seats), winner: RED}, board: snapshotBoard({...boardState(), moves: []})};
}

beforeEach(() => setupPlayers(TURN_ORDER, 4));

describe("saveGame / loadGame", () => {
    it("restores a game in progress exactly", () => {
        const storage = memoryStorage();
        const game = playingSave();
        expect(saveGame(game, storage)).toBe(true);
        expect(loadGame(storage)).toEqual(game);
    });

    it("restores a draw in progress", () => {
        const storage = memoryStorage();
        const game: SavedGame = {version: SAVE_VERSION, savedAt: "2026-11-04T18:00:00.000Z", phase: "draw", color: BLUE, settings: DEFAULT_SETTINGS, seats: activeSeats(4, BLUE),
            draw: {round: 2, contenders: [RED, BLUE], rolls: {}, out: {yellow: 2, green: 5}, winner: null, events: []}};
        saveGame(game, storage);
        expect(loadGame(storage)).toEqual(game);
    });

    it("restores a game of 3 players and 2 pawns, with its own settings", () => {
        const storage = memoryStorage();
        const game = quickSave();
        saveGame(game, storage);
        expect(loadGame(storage)).toEqual(game);

        setupPlayers(game.seats, game.settings.pawns);
        applyPieces(game.board);
        expect(playerColors.red.pieces[1]).toMatchObject({out: true, indexPath: 12});
        expect(playerColors.green.pieces).toEqual([]);
    });

    it("returns null when there is no save", () => {
        expect(loadGame(memoryStorage())).toBeNull();
    });

    it.each([
        ["unreadable JSON", "{oops"],
        ["another version", JSON.stringify({...playingSave(), version: 2})],
        ["no settings", JSON.stringify({...playingSave(), settings: undefined})],
        ["seats that do not match the settings", JSON.stringify({...playingSave(), seats: [RED, YELLOW]})],
        ["a draw contender out of the game", JSON.stringify({...quickSave(), draw: {...newDraw(TURN_ORDER), winner: RED}})],
        ["a list of pawns of the wrong length", JSON.stringify((() => { const g = quickSave(); g.board.pieces.red.push({out: false, indexPath: -1}); return g; })())],
        ["a pawn on a free seat", JSON.stringify((() => { const g = quickSave(); g.board.pieces.green.push({out: false, indexPath: -1}); return g; })())],
        ["a turn on a free seat", JSON.stringify((() => { const g = quickSave(); g.board.turn = GREEN; return g; })())],
        ["a move saved as a sentence", JSON.stringify((() => { const g = playingSave() as Extract<SavedGame, {phase: "playing"}>; return {...g, board: {...g.board, moves: [{id: 1, color: RED, text: "Vous faites 4"}]}}; })())],
        ["an unknown move key", JSON.stringify((() => { const g = playingSave() as Extract<SavedGame, {phase: "playing"}>; return {...g, board: {...g.board, moves: [{id: 1, color: RED, key: "fly", vars: {value: 4}}]}}; })())],
        ["a piece outside the path", JSON.stringify((() => { const g = playingSave() as Extract<SavedGame, {phase: "playing"}>; g.board.pieces.red[1] = {out: true, indexPath: 80}; return g; })())],
        ["an inconsistent piece", JSON.stringify((() => { const g = playingSave() as Extract<SavedGame, {phase: "playing"}>; g.board.pieces.red[1] = {out: false, indexPath: 5}; return g; })())],
        ["an unknown color", JSON.stringify({...playingSave(), color: "purple"})],
        ["a game without a starting player", JSON.stringify({...playingSave(), draw: newDraw(TURN_ORDER)})],
        ["an unreadable date", JSON.stringify({...playingSave(), savedAt: "not a date"})],
        ["a malformed draw event", JSON.stringify({...playingSave(), phase: "draw", draw: {...newDraw(TURN_ORDER), events: [{type: "tie"}]}})],
        ["a malformed draw roll", JSON.stringify({...playingSave(), phase: "draw", draw: {...newDraw(TURN_ORDER), rolls: {yellow: {}}}})],
        ["a draw nobody can play", JSON.stringify({...playingSave(), phase: "draw", draw: {...newDraw(TURN_ORDER), contenders: []}})],
    ])("ignores and deletes a save with %s", (_, raw) => {
        const storage = memoryStorage();
        storage.setItem(SAVE_KEY, raw);
        expect(loadGame(storage)).toBeNull();
        expect(storage.data.has(SAVE_KEY)).toBe(false);
    });

    it("never throws when the storage is blocked", () => {
        const blocked: SaveStorage = {
            getItem: () => { throw new Error("SecurityError"); },
            setItem: () => { throw new Error("QuotaExceededError"); },
            removeItem: () => { throw new Error("SecurityError"); },
        };
        expect(saveGame(playingSave(), blocked)).toBe(false);
        expect(loadGame(blocked)).toBeNull();
        expect(() => clearGame(blocked)).not.toThrow();
        expect(saveGame(playingSave(), null)).toBe(false);
        expect(loadGame(null)).toBeNull();
    });

    it("clears the save", () => {
        const storage = memoryStorage();
        saveGame(playingSave(), storage);
        clearGame(storage);
        expect(loadGame(storage)).toBeNull();
    });
});

describe("snapshotBoard / applyPieces", () => {
    it("puts every piece back where it was", () => {
        const game = playingSave() as Extract<SavedGame, {phase: "playing"}>;
        setupPlayers(TURN_ORDER, 4);
        applyPieces(game.board);
        expect(playerColors.red.pieces[0]).toMatchObject({out: true, indexPath: 18});
        expect(playerColors.green.pieces[2]).toMatchObject({out: true, indexPath: 41});
        expect(playerColors.yellow.pieces.every(piece => !piece.out && piece.indexPath === -1)).toBe(true);
    });

    it("keeps only the 4 latest moves", () => {
        const many = Array.from({length: 9}, (_, id) => ({id, color: YELLOW, key: "roll" as const, vars: {value: 1}}));
        expect(snapshotBoard({...boardState(), moves: many}).moves).toHaveLength(4);
    });

    it("continues history ids after a resume", () => {
        expect(nextHistoryId(boardState().moves)).toBe(8);
        expect(nextHistoryId([])).toBe(0);
    });
});
