import {PlayerColor} from "@/type/PlayerColor";
import {DrawState} from "@/game/draw";
import {playerColors} from "@/game/functions";
import type {HistoryEntry} from "@/components/MoveHistory";

/*
 * Sauvegarde de la partie dans le localStorage.
 *
 * On ne sauvegarde que des DONNÉES (jamais le DOM) :
 *  - la phase, la couleur du joueur et le tirage ;
 *  - pendant la partie : l'état de GameBoard + la position de chaque pion (out / indexPath).
 * Au chargement, les pions sont remis dans `playerColors` : le plateau les lit à son montage.
 */

export const SAVE_KEY = "ludo:partie";
export const SAVE_VERSION = 1;

const COLORS = Object.values(PlayerColor) as PlayerColor[];
const LAST_PATH_INDEX = 43; // pathPiece compte 44 cases (0 → 43)

export type SavedPiece = { out: boolean, indexPath: number };

export type BoardSave = {
    turn: PlayerColor,
    diceValue: number,          // -1 = pas de dé en attente ; sinon le joueur doit jouer ce résultat
    preGame: boolean,           // phase « 3 essais pour faire un 6 »
    count: number,              // essai en cours pendant preGame (1 à 3)
    canRollDice: boolean,
    lastRoll: number | null,
    skipped: boolean,
    moves: HistoryEntry[],
    turnNumber: number,
    pieces: Record<PlayerColor, SavedPiece[]>,
    isPlay: Record<PlayerColor, boolean>,
};

export type SavedGame =
    | { version: typeof SAVE_VERSION, savedAt: string, phase: "draw", color: PlayerColor, draw: DrawState }
    | { version: typeof SAVE_VERSION, savedAt: string, phase: "playing", color: PlayerColor, draw: DrawState, board: BoardSave };

export type SaveStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/* localStorage peut être absent (rendu serveur) ou lever une erreur (navigation privée, stockage bloqué). */
export function browserStorage(): SaveStorage | null {
    try {
        return typeof window === "undefined" ? null : window.localStorage;
    } catch {
        return null;
    }
}

export function saveGame(game: SavedGame, storage: SaveStorage | null = browserStorage()): boolean {
    if (!storage)
        return false;
    try {
        storage.setItem(SAVE_KEY, JSON.stringify(game));
        return true;
    } catch {
        return false; // quota dépassé, stockage bloqué… le jeu continue sans sauvegarde
    }
}

export function clearGame(storage: SaveStorage | null = browserStorage()) {
    try {
        storage?.removeItem(SAVE_KEY);
    } catch {
        /* rien à faire */
    }
}

/* Lit et valide la sauvegarde. Une sauvegarde invalide ou d'une autre version est supprimée. */
export function loadGame(storage: SaveStorage | null = browserStorage()): SavedGame | null {
    if (!storage)
        return null;
    let raw: string | null;
    try {
        raw = storage.getItem(SAVE_KEY);
    } catch {
        return null;
    }
    if (!raw)
        return null;
    try {
        const data: unknown = JSON.parse(raw);
        if (isSavedGame(data))
            return data;
    } catch {
        /* JSON illisible */
    }
    clearGame(storage);
    return null;
}

/* Photographie l'état de GameBoard + la position des pions (lue dans playerColors). */
export function snapshotBoard(state: Omit<BoardSave, "pieces" | "isPlay">): BoardSave {
    const pieces = {} as BoardSave["pieces"];
    const isPlay = {} as BoardSave["isPlay"];
    for (const color of COLORS) {
        pieces[color] = playerColors[color].pieces.map(({out, indexPath}) => ({out, indexPath}));
        isPlay[color] = playerColors[color].isPlay;
    }
    return {...state, moves: state.moves.slice(0, 4), pieces, isPlay};
}

/* Remet les pions sauvegardés dans playerColors (données uniquement, sans toucher au DOM). */
export function applyPieces(board: BoardSave) {
    for (const color of COLORS) {
        playerColors[color].pieces.forEach((piece, index) => {
            piece.out = board.pieces[color][index].out;
            piece.indexPath = board.pieces[color][index].indexPath;
        });
        playerColors[color].isPlay = board.isPlay[color];
    }
}

/* Prochain identifiant d'historique après une reprise (les clés React doivent rester uniques). */
export function nextHistoryId(moves: HistoryEntry[]): number {
    return moves.reduce((max, move) => Math.max(max, move.id), -1) + 1;
}

// ---------------------------------------------------------------- validation

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isColor = (value: unknown): value is PlayerColor => COLORS.includes(value as PlayerColor);
const isInt = (value: unknown, min: number, max: number) => Number.isInteger(value) && (value as number) >= min && (value as number) <= max;

const isRolls = (value: unknown) => isObject(value) && Object.entries(value).every(([color, roll]) => isColor(color) && isInt(roll, 1, 6));

// The panel renders these fields directly, a malformed one would crash it.
function isDrawEvent(value: unknown) {
    if (!isObject(value))
        return false;
    switch (value.type) {
        case "roll":
            return isColor(value.color) && isInt(value.value, 1, 6);
        case "tie":
            return Array.isArray(value.tied) && value.tied.length > 0 && value.tied.every(isColor) && isInt(value.max, 1, 6);
        case "win":
            return isColor(value.winner) && isInt(value.max, 1, 6);
        default:
            return false;
    }
}

function isDraw(value: unknown): value is DrawState {
    return isObject(value) && isInt(value.round, 1, 1000) && Array.isArray(value.contenders) && value.contenders.length > 0 && value.contenders.every(isColor)
        && isRolls(value.rolls) && isRolls(value.out) && (value.winner === null || isColor(value.winner))
        && Array.isArray(value.events) && value.events.every(isDrawEvent);
}

function isPieces(value: unknown): value is BoardSave["pieces"] {
    return isObject(value) && COLORS.every(color => {
        const list = value[color];
        return Array.isArray(list) && list.length === 4 && list.every(piece => isObject(piece) && typeof piece.out === "boolean"
            && isInt(piece.indexPath, -1, LAST_PATH_INDEX) && piece.out === ((piece.indexPath as number) >= 0));
    });
}

function isBoard(value: unknown): value is BoardSave {
    return isObject(value) && isColor(value.turn) && isInt(value.diceValue, -1, 6) && value.diceValue !== 0
        && typeof value.preGame === "boolean" && isInt(value.count, 1, 3) && typeof value.canRollDice === "boolean"
        && (value.lastRoll === null || isInt(value.lastRoll, 1, 6)) && typeof value.skipped === "boolean"
        && Array.isArray(value.moves) && value.moves.every(move => isObject(move) && Number.isInteger(move.id) && isColor(move.color) && typeof move.text === "string")
        && isInt(value.turnNumber, 1, 100000) && isPieces(value.pieces)
        && isObject(value.isPlay) && COLORS.every(color => typeof (value.isPlay as Record<string, unknown>)[color] === "boolean");
}

function isSavedGame(value: unknown): value is SavedGame {
    if (!isObject(value) || value.version !== SAVE_VERSION || typeof value.savedAt !== "string" || Number.isNaN(Date.parse(value.savedAt)) || !isColor(value.color) || !isDraw(value.draw))
        return false;
    if (value.phase === "draw")
        return true;
    return value.phase === "playing" && isColor(value.draw.winner) && isBoard(value.board);
}
