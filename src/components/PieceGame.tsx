import {CellState} from "@/type/GameBoard";
import {forwardRef, Ref} from 'react';
import {PlayerColor} from "@/type/PlayerColor";
import {colorLabel, displayColor} from "@/game/ui/players";

type PieceProps = {
    color: CellState | PlayerColor;
    id: string;
    colorPlayer?: PlayerColor
};

function PieceGame({color, id, colorPlayer}: PieceProps, ref: Ref<HTMLElement | null> | undefined) {
    let index: number = 0;
    if (id === "0" || id === "108" || id === "9" || id === "99")
        index = 0
    else if (id === "1" || id === "109" || id === "10" || id === "100")
        index = 1
    else if (id === "11" || id === "119" || id === "20" || id === "110")
        index = 2
    else
        index = 3

    const playerColor = color as PlayerColor
    const className = `pawn pawn--${displayColor[playerColor]}`
    const adjective = colorLabel[playerColor].adjective

    // No child node inside a pawn: the rules read the pawn itself from event.target and cell.childNodes[0].
    if (color === colorPlayer) {
        return <button type="button" className={`${className} pawn--human`} id={`piece-${color}-${index}`} ref={ref as Ref<HTMLButtonElement>}
                       aria-label={`Déplacer ce pion ${adjective}`} aria-disabled="true"></button>
    }

    return <span className={className} id={`piece-${color}-${index}`} ref={ref as Ref<HTMLSpanElement>} role="img" aria-label={`Pion ${adjective}`}></span>
}

export default forwardRef(PieceGame)
