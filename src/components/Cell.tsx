import {CSSProperties} from 'react';
import {CellState} from '@/type/GameBoard';
import {describeCell, rowCol} from "@/game/gameboard/cells";

type CellProps = {
    color: CellState;
    index: number;
};

export function Cell({color, index}: CellProps) {
    const cell = describeCell(color, index);
    const [row, col] = rowCol(index);
    // Distance to the center: the board appears ring by ring.
    const style = {"--d": Math.abs(row - 5) + Math.abs(col - 5)} as CSSProperties;

    switch (cell.type) {
        case "empty":
            return <div className="cell cell--empty" aria-hidden="true"></div>;
        case "center":
            return <div className="cell cell--center" style={style}><span className="cell__center"></span></div>;
        case "track":
            return <div className="cell cell--track" style={style}></div>;
        case "start":
            return <div className={`cell cell--start cell--${cell.tint}`} style={style}></div>;
        case "tile":
            return <div className={`cell cell--${cell.tint}`} style={style}></div>;
        case "prison":
            return <div className={`cell cell--slot cell--${cell.tint}`} style={style}></div>;
    }
}
