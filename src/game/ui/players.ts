import {Piece} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";

export const TURN_ORDER = [PlayerColor.YELLOW, PlayerColor.GREEN, PlayerColor.RED, PlayerColor.BLUE];

// Index of the first cell of the final lane in every pathPiece.
export const HOME_START = 40;
const LAST_HOME_CELL = 43;

// The game logic keeps red/blue; only the display says pink/cyan.
export const displayColor = {
    [PlayerColor.YELLOW]: "yellow",
    [PlayerColor.GREEN]: "green",
    [PlayerColor.RED]: "pink",
    [PlayerColor.BLUE]: "cyan",
} as const;

export const colorLabel = {
    [PlayerColor.YELLOW]: {name: "Jaune", adjective: "jaune", plural: "jaunes"},
    [PlayerColor.GREEN]: {name: "Vert", adjective: "vert", plural: "verts"},
    [PlayerColor.RED]: {name: "Rose", adjective: "rose", plural: "roses"},
    [PlayerColor.BLUE]: {name: "Cyan", adjective: "cyan", plural: "cyans"},
};

export function playerName(color: PlayerColor, human: PlayerColor | null): string {
    return color === human ? "Vous" : `Bot ${colorLabel[color].name}`;
}

export function joinNames(names: string[]): string {
    return names.join(", ").replace(/, ([^,]*)$/, " et $1");
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

export function piecesStatus(pieces: Piece[]): string {
    const {onTrack, lastLine, arrived} = countPieces(pieces);
    const parts: string[] = [];
    if (onTrack)
        parts.push(`${onTrack} ${onTrack > 1 ? "pions" : "pion"} en jeu`);
    if (lastLine)
        parts.push(`${lastLine} dans la dernière ligne`);
    if (arrived)
        parts.push(`${arrived} ${arrived > 1 ? "arrivés" : "arrivé"}`);
    return parts.join(" · ") || "Aucun pion en jeu";
}
