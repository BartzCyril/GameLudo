import {Piece, PlayerColors} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import {HOME_START, playerName} from "@/game/ui/players";

export type PiecesSnapshot = Record<string, Pick<Piece, "out" | "indexPath">[]>;

export function snapshotPieces(players: PlayerColors): PiecesSnapshot {
    return Object.fromEntries(Object.entries(players).map(([color, player]) =>
        [color, player.pieces.map(({out, indexPath}) => ({out, indexPath}))]));
}

// The rules mutate the pieces in place, so a move is read back by comparing two snapshots.
export function describeMove(before: PiecesSnapshot, after: PiecesSnapshot, color: PlayerColor, value: number, human: PlayerColor | null): string {
    const isHuman = color === human;
    const name = playerName(color, human);
    const moved = after[color].findIndex((piece, index) => piece.indexPath !== before[color][index].indexPath);
    if (moved === -1)
        return `${name} ${isHuman ? "faites" : "fait"} ${value}, aucun pion à déplacer`;

    const from = before[color][moved].indexPath;
    const to = after[color][moved].indexPath;
    let text: string;
    if (from === -1)
        text = isHuman ? `Vous faites ${value} et sortez un pion` : `${name} fait ${value} et sort un pion`;
    else if (from < HOME_START && to >= HOME_START)
        text = isHuman ? "Vous entrez à l'écurie" : `${name} entre à l'écurie`;
    else
        text = `${name} ${isHuman ? "avancez" : "avance"} de ${value} ${value > 1 ? "cases" : "case"}`;

    const victim = Object.keys(after).find(other => other !== color &&
        after[other].some((piece, index) => before[other][index].out && !piece.out)) as PlayerColor | undefined;
    if (!victim)
        return text;
    if (victim === human)
        return `${text} et prend un de vos pions`;
    return `${text} et ${isHuman ? "prenez" : "prend"} un pion à ${playerName(victim, human)}`;
}
