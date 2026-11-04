'use client'

import {CSSProperties, Ref, useEffect, useRef, useState} from "react";
import {Cell} from "@/components/Cell";
import {playerColors} from "@/game/functions";
import {getGameBoard} from "@/game/gameboard/gameboard";
import {rowCol} from "@/game/gameboard/cells";
import {motion, useWait} from "@/game/ui/motion";
import {colorLabel, displayColor, TURN_ORDER} from "@/game/ui/players";
import {PlayerColor} from "@/type/PlayerColor";

type PawnProps = {
    color: PlayerColor,
    index: number,
    order: number,
    movable: boolean,
    onClick?: (index: number) => void
}

function Pawn({color, index, order, movable, onClick}: PawnProps) {
    const slotRef = useRef<HTMLDivElement>(null);
    const [row, col] = rowCol(playerColors[color].pieces[index].indexPrison);

    useEffect(() => {
        slotRef.current?.classList.toggle("is-movable", movable);
    }, [movable]);

    // className and style never change here: usePawnAnimator owns the state classes and --r / --c, a React update would wipe them.
    return (
        <div ref={slotRef} id={`pawn-${color}-${index}`} className="pawn-slot" style={{"--r": row, "--c": col, "--i": order} as CSSProperties}>
            <span className="pawn-shadow" aria-hidden="true"></span>
            <button type="button" className={`pawn pawn--${displayColor[color]}`} disabled={!movable}
                    aria-label={`${movable ? "Déplacer ce pion" : "Pion"} ${colorLabel[color].adjective}`}
                    onClick={() => onClick?.(index)}></button>
        </div>
    );
}

type BoardProps = {
    intro?: boolean,
    human?: PlayerColor,
    movable?: number[],
    onPawnClick?: (index: number) => void,
    cardRef?: Ref<HTMLElement>,
    layerRef?: Ref<HTMLDivElement>
}

export function Board({intro = false, human, movable = [], onPawnClick, cardRef, layerRef}: BoardProps) {
    const [isIntro, setIsIntro] = useState(intro);
    const wait = useWait();

    useEffect(() => {
        if (intro)
            wait(motion().intro).then(() => setIsIntro(false));
    }, [intro, wait]);

    return (
        <section className="board-card" aria-label="Plateau de jeu" ref={cardRef}>
            <div className={`board-wrap${isIntro ? " is-intro" : ""}`}>
                <div className="board">
                    {getGameBoard().map((color, index) => <Cell color={color} index={index} key={index}/>)}
                </div>
                <div className="pawns" ref={layerRef}>
                    {TURN_ORDER.flatMap((color, colorOrder) => [0, 1, 2, 3].map(index => (
                        <Pawn key={`${color}-${index}`} color={color} index={index} order={colorOrder * 4 + index}
                              movable={color === human && movable.includes(index)} onClick={onPawnClick}/>
                    )))}
                </div>
            </div>
        </section>
    );
}
