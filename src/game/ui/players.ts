import {Piece} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import type {Translator} from "@/i18n/translate";

export const TURN_ORDER = [PlayerColor.YELLOW, PlayerColor.GREEN, PlayerColor.RED, PlayerColor.BLUE];

// Index of the first cell of the final lane in every pathPiece.
export const HOME_START = 40;
export const LAST_HOME_CELL = 43;

// The game logic keeps red/blue; only the display says pink/cyan.
export const displayColor = {
    [PlayerColor.YELLOW]: "yellow",
    [PlayerColor.GREEN]: "green",
    [PlayerColor.RED]: "pink",
    [PlayerColor.BLUE]: "cyan",
} as const;

export function playerName(t: Translator["t"], color: PlayerColor, human: PlayerColor | null): string {
    return color === human ? t("players.you") : t(`colors.${color}.bot`);
}

export function joinNames(t: Translator["t"], names: string[]): string {
    return names.length < 2 ? names.join("") : names.slice(0, -1).join(t("players.listJoin.separator")) + t("players.listJoin.last") + names.at(-1);
}

export function countPieces(pieces: Piece[]) {
    const inHome = pieces.filter(piece => piece.indexPath >= HOME_START).map(piece => piece.indexPath).sort((a, b) => b - a);
    // A piece has arrived once nothing is left to fill between it and the end of the lane.
    let arrived = 0;
    while (inHome[arrived] === LAST_HOME_CELL - arrived)
        arrived++;
    const out = pieces.filter(piece => piece.out).length;
    return {out, onTrack: out - inHome.length, lastLine: inHome.length - arrived, arrived};
}
