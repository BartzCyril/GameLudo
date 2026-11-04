import {Piece, PlayerColors} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import {HOME_START, playerName} from "@/game/ui/players";

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

export function describeMove(before: PiecesSnapshot, after: PiecesSnapshot, color: PlayerColor, value: number, human: PlayerColor | null): string {
    const isHuman = color === human;
    const name = playerName(color, human);
    const move = readMove(before, after, color);
    if (!move)
        return `${name} ${isHuman ? "faites" : "fait"} ${value}, aucun pion à déplacer`;

    const {from, to} = move;
    const victim = move.victim?.color;
    let text: string;
    if (from === -1)
        text = isHuman ? `Vous faites ${value} et sortez un pion` : `${name} fait ${value} et sort un pion`;
    else if (from < HOME_START && to >= HOME_START)
        text = isHuman ? "Vous entrez à l'écurie" : `${name} entre à l'écurie`;
    else
        text = `${name} ${isHuman ? "avancez" : "avance"} de ${value} ${value > 1 ? "cases" : "case"}`;

    if (!victim)
        return text;
    if (victim === human)
        return `${text} et prend un de vos pions`;
    return `${text} et ${isHuman ? "prenez" : "prend"} un pion à ${playerName(victim, human)}`;
}
