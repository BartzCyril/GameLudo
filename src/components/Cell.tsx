import {useEffect, useRef} from 'react';
import {CellState} from '@/type/GameBoard';
import PieceGame from '@/components/PieceGame';
import {PlayerColor} from "@/type/PlayerColor";
import {describeCell} from "@/game/gameboard/cells";

type CellProps = {
    color: CellState;
    id: string;
    pushListDomPieces?: (color: string, piece: HTMLElement) => void;
    colorPlayer?: PlayerColor
};

export function Cell({color, id, pushListDomPieces, colorPlayer}: CellProps) {
    const pieceGameRef = useRef<HTMLElement>(null);
    const cell = describeCell(color, parseInt(id));

    useEffect(() => {
        if (pieceGameRef.current && pushListDomPieces)
            pushListDomPieces(color as string, pieceGameRef.current);
    }, [color, pushListDomPieces]);

    switch (cell.type) {
        case "empty":
            return <div className="cell cell--empty" id={`cell-${id}`} aria-hidden="true"></div>;
        case "center":
            return <div className="cell cell--center" id={`cell-${id}`}></div>;
        case "track":
            return <div className="cell cell--track" id={`cell-${id}`}></div>;
        case "start":
            return <div className={`cell cell--start cell--${cell.tint}`} id={`cell-${id}`}></div>;
        case "tile":
            return <div className={`cell cell--${cell.tint}`} id={`cell-${id}`}></div>;
        case "prison":
            return (
                <div className={`cell cell--slot cell--${cell.tint}`} id={`cell-${id}`}>
                    <PieceGame color={color} id={id} ref={pieceGameRef} colorPlayer={colorPlayer}/>
                </div>
            );
    }
}
