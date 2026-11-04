import React, {useRef, useEffect} from 'react';
import {CellState} from '@/type/GameBoard';
import PieceGame from '@/components/PieceGame';
import {PlayerColor} from "@/type/PlayerColor";

type CellProps = {
    color: CellState;
    id: string;
    pushListDomPieces: (color: string, piece: HTMLElement) => void;
    colorPlayer : PlayerColor
};

export function Cell({color, id, pushListDomPieces, colorPlayer}: CellProps) {
    const pieceGameRef = useRef(null);
    useEffect(() => {
        if (
            id === '0' || id === '1' || id === '11' || id === '12' ||
            id === '108' || id === '109' || id === '119' || id === '120' ||
            id === '9' || id === '10' || id === '20' || id === '21' ||
            id === '99' || id === '100' || id === '110' || id === '111'
        ) {
            if (pieceGameRef.current)
                pushListDomPieces(color as string, pieceGameRef.current as HTMLElement);
        }
    }, [id, color, pushListDomPieces]);

    let renderedComponent: React.JSX.Element;

    if (color === 'transparent') {
        renderedComponent = <div className={`${color}`} id={`cell-${id}`}></div>;
    } else if (
        id === '0' || id === '1' || id === '11' || id === '12' ||
        id === '108' || id === '109' || id === '119' || id === '120' ||
        id === '9' || id === '10' || id === '20' || id === '21' ||
        id === '99' || id === '100' || id === '110' || id === '111'
    ) {
        renderedComponent = (
            <div className={`${color} pieceGame`} id={`cell-${id}`}>
                <PieceGame color={color} id={id} ref={pieceGameRef} colorPlayer={colorPlayer}/>
            </div>
        );
    } else {
        renderedComponent = (
            <div className={`${color} pieceGame`} id={`cell-${id}`}></div>
        );
    }

    return renderedComponent;
}
