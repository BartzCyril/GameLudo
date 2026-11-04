import {CellEmpty, CellState} from "@/type/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import {displayColor} from "@/game/ui/players";

export const PRISON_CELLS = [0, 1, 11, 12, 108, 109, 119, 120, 9, 10, 20, 21, 99, 100, 110, 111];
const START_CELLS = [6, 44, 76, 114];
const CENTER_CELL = 60;

export function describeCell(state: CellState, index: number) {
    if (index === CENTER_CELL)
        return {type: "center"} as const;
    if (state === CellEmpty.TRANSPARENT)
        return {type: "empty"} as const;
    if (state === CellEmpty.BLACK)
        return {type: "track"} as const;
    const tint = displayColor[state as string as PlayerColor];
    if (PRISON_CELLS.includes(index))
        return {type: "prison", tint} as const;
    return {type: START_CELLS.includes(index) ? "start" : "tile", tint} as const;
}
