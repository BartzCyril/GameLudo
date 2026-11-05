import {Piece, PlayerColors} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import {HOME_START, playerName} from "@/game/ui/players";
import type {Translator} from "@/i18n/translate";

export type PiecesSnapshot = Record<string, Pick<Piece, "out" | "indexPath">[]>;

export function snapshotPieces(players: PlayerColors): PiecesSnapshot {
    return Object.fromEntries(Object.entries(players).map(([color, player]) =>
        [color, player.pieces.map(({out, indexPath}) => ({out, indexPath}))]));
}

export type MoveRead = {
    index: number,
    from: number,
    to: number,
    victim: { color: PlayerColor, index: number } | null
}

// The rules mutate the pieces in place, so a move is read back by comparing two snapshots.
export function readMove(before: PiecesSnapshot, after: PiecesSnapshot, color: PlayerColor): MoveRead | null {
    const index = after[color].findIndex((piece, position) => piece.indexPath !== before[color][position].indexPath);
    if (index === -1)
        return null;
    const wasTaken = (other: string) => (piece: PiecesSnapshot[string][number], position: number) => before[other][position].out && !piece.out;
    const victim = Object.keys(after).find(other => other !== color && after[other].some(wasTaken(other))) as PlayerColor | undefined;
    return {
        index,
        from: before[color][index].indexPath,
        to: after[color][index].indexPath,
        victim: victim ? {color: victim, index: after[victim].findIndex(wasTaken(victim))} : null,
    };
}

export const MOVE_KEYS = ["roll", "rollNoMove", "exit", "enterHome", "advance"] as const;

// A move is kept as data and only worded on display: a game resumed in another language reads in that language.
export type MoveText = { key: typeof MOVE_KEYS[number], vars: { value: number, victim?: PlayerColor } };
export type HistoryEntry = MoveText & { id: number, color: PlayerColor };

export function describeMove(before: PiecesSnapshot, after: PiecesSnapshot, color: PlayerColor, value: number): MoveText {
    const move = readMove(before, after, color);
    if (!move)
        return {key: "rollNoMove", vars: {value}};

    const {from, to} = move;
    const key = from === -1 ? "exit" : from < HOME_START && to >= HOME_START ? "enterHome" : "advance";
    return {key, vars: move.victim ? {value, victim: move.victim.color} : {value}};
}

export function moveText({t, tp}: Translator, {key, color, vars: {value, victim}}: Omit<HistoryEntry, "id">, human: PlayerColor | null): string {
    const variant = color === human ? "human" : "bot";
    const name = playerName(t, color, human);
    const text = key === "advance" ? tp(`history.advance.${variant}`, value, {name}) : t(`history.${key}.${variant}`, {name, value});
    if (!victim)
        return text;
    if (victim === human)
        return t("history.captureYou", {text});
    return t(`history.captureOther.${variant}`, {text, victim: playerName(t, victim, human)});
}
