'use client'

import {CSSProperties, ReactNode, Ref, useEffect, useRef, useState} from "react";
import {Cell} from "@/components/Cell";
import {playerColors} from "@/game/functions";
import {getGameBoard} from "@/game/gameboard/gameboard";
import {rowCol} from "@/game/gameboard/cells";
import {motion, useWait} from "@/game/ui/motion";
import {displayColor, TURN_ORDER} from "@/game/ui/players";
import {useI18n} from "@/i18n/I18nProvider";
import {PlayerColor} from "@/type/PlayerColor";

type PawnProps = {
    color: PlayerColor,
    index: number,
    order: number,
    atHome: boolean,
    movable: boolean,
    onClick?: (index: number) => void
}

function Pawn({color, index, order, atHome, movable, onClick}: PawnProps) {
    const {t} = useI18n();
    const slotRef = useRef<HTMLDivElement>(null);
    // Read once at mount, which is what puts a resumed game back in place; after that the animator moves the pawn.
    const [[row, col]] = useState(() => {
        const {pathPiece, pieces} = playerColors[color];
        const piece = pieces[index];
        return rowCol(piece.out && !atHome ? pathPiece[piece.indexPath] : piece.indexPrison);
    });

    useEffect(() => {
        slotRef.current?.classList.toggle("is-movable", movable);
    }, [movable]);

    // className and style never change here: usePawnAnimator owns the state classes and --r / --c, a React update would wipe them.
    return (
        <div ref={slotRef} id={`pawn-${color}-${index}`} className="pawn-slot" style={{"--r": row, "--c": col, "--i": order} as CSSProperties}>
            <span className="pawn-shadow" aria-hidden="true"></span>
            <button type="button" className={`pawn pawn--${displayColor[color]}`} disabled={!movable}
                    aria-label={t(`colors.${color}.${movable ? "movePawn" : "pawn"}`)}
                    onClick={() => onClick?.(index)}></button>
        </div>
    );
}

// The 2 × 2 stable of each corner: [row, column] of its top-left cell.
const STABLES: Record<PlayerColor, { r: number, c: number }> = {
    [PlayerColor.YELLOW]: {r: 0, c: 0},
    [PlayerColor.GREEN]: {r: 0, c: 9},
    [PlayerColor.BLUE]: {r: 9, c: 0},
    [PlayerColor.RED]: {r: 9, c: 9},
};

type BoardProps = {
    intro?: boolean,
    human?: PlayerColor,
    seats?: PlayerColor[],  // those in play: the other corners are free
    movable?: number[],
    onPawnClick?: (index: number) => void,
    cardRef?: Ref<HTMLElement>,
    layerRef?: Ref<HTMLDivElement>,
    overlay?: ReactNode,  // drawn above the cells and below the pawns (corner badges)
    front?: ReactNode,    // drawn above the pawns (die, play button, colour picker, end of game)
    bar?: ReactNode       // strip above the board card, outside it: turn, message and restart icon
}

export function Board({intro = false, human, seats = TURN_ORDER, movable = [], onPawnClick, cardRef, layerRef, overlay, front, bar}: BoardProps) {
    const {t} = useI18n();
    const [isIntro, setIsIntro] = useState(intro);
    const wait = useWait();

    useEffect(() => {
        if (intro)
            wait(motion().intro).then(() => setIsIntro(false));
    }, [intro, wait]);

    return (
        <>
            {bar}
            <section className="board-card" aria-label={t("board.label")} ref={cardRef}>
                <div className={`board-wrap${isIntro ? " is-intro" : ""}`}>
                    <div className="board">
                        {getGameBoard().map((color, index) => <Cell color={color} index={index} key={index}/>)}
                    </div>
                    {TURN_ORDER.filter(color => !seats.includes(color)).map(color => (
                        <span key={color} className="free-corner" style={{"--r": STABLES[color].r, "--c": STABLES[color].c} as CSSProperties}>{t("board.freeCorner")}</span>
                    ))}
                    {overlay}
                    <div className="pawns" ref={layerRef}>
                        {TURN_ORDER.flatMap((color, colorOrder) => playerColors[color].pieces.map((_, index) => (
                            <Pawn key={`${color}-${index}`} color={color} index={index} order={colorOrder * 4 + index} atHome={intro}
                                  movable={color === human && movable.includes(index)} onClick={onPawnClick}/>
                        )))}
                    </div>
                    {front}
                </div>
            </section>
        </>
    );
}
