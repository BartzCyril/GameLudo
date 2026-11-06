import {CSSProperties} from "react";
import {activeSeats, PlayerCount} from "@/game/settings";
import {displayColor} from "@/game/ui/players";
import {PlayerColor} from "@/type/PlayerColor";

// The previews read like the board: top left, top right, bottom left, bottom right.
const GRID = [PlayerColor.YELLOW, PlayerColor.GREEN, PlayerColor.BLUE, PlayerColor.RED];
const YOU = PlayerColor.RED;

export const YOUR_SKIN = displayColor[YOU];

export const pawnStyle = (skin: string) => ({"--fill": `var(--${skin}-pawn)`, "--ring": `var(--${skin}-ring)`, "--tile": `var(--${skin}-tile)`} as CSSProperties);

// The corners of a preview, you bottom right. null = free.
export function previewCorners(players: PlayerCount) {
    const seats = activeSeats(players, YOU);
    return GRID.map(corner => seats.includes(corner) ? {skin: displayColor[corner], you: corner === YOU} : null);
}
