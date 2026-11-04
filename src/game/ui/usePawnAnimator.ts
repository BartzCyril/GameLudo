import {useCallback, useRef} from "react";
import {playerColors} from "@/game/functions";
import {rowCol} from "@/game/gameboard/cells";
import {MoveRead} from "@/game/history";
import {motion, useWait} from "@/game/ui/motion";
import {displayColor} from "@/game/ui/players";
import {PlayerColor} from "@/type/PlayerColor";

function place(element: HTMLElement, cell: number) {
    const [row, col] = rowCol(cell);
    element.style.setProperty("--r", String(row));
    element.style.setProperty("--c", String(col));
}

// Restarts a CSS animation even when the class is already there.
function replay(element: HTMLElement, className: string) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
}

// Replays on screen a move the rules have already applied, so nothing here can change the game.
export function usePawnAnimator() {
    const layerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLElement>(null);
    const wait = useWait();

    const animateMove = useCallback(async (color: PlayerColor, move: MoveRead) => {
        const layer = layerRef.current;
        const card = cardRef.current;
        if (!layer || !card)
            return;
        const time = motion();
        const slotOf = (pawnColor: PlayerColor, index: number) => layer.querySelector(`#pawn-${pawnColor}-${index}`) as HTMLElement;

        const land = async (slot: HTMLElement) => {
            replay(slot, "is-landing");
            await wait(time.land);
            slot.classList.remove("is-landing");
        };

        const hopAlong = async (slot: HTMLElement, cells: number[]) => {
            for (const cell of cells) {
                replay(slot, "is-hopping");
                place(slot, cell);
                await wait(time.step);
            }
            slot.classList.remove("is-hopping");
            await land(slot);
        };

        const flyTo = async (slot: HTMLElement, cell: number) => {
            replay(slot, "is-flying");
            place(slot, cell);
            await wait(time.fly);
            slot.classList.remove("is-flying");
            await land(slot);
        };

        const shockwave = (cell: number, fxColor: PlayerColor) => {
            const fx = document.createElement("div");
            fx.className = "board-fx";
            fx.style.setProperty("--fx-color", `var(--${displayColor[fxColor]}-pawn)`);
            place(fx, cell);
            fx.innerHTML = "<span></span><span></span>";
            layer.appendChild(fx);
            wait(time.fx).then(() => fx.remove());
        };

        const bump = () => {
            replay(card, "is-bumping");
            wait(time.bump).then(() => card.classList.remove("is-bumping"));
        };

        const {pathPiece} = playerColors[color];
        const slot = slotOf(color, move.index);
        const leavesStable = move.from === -1;
        if (leavesStable)
            await flyTo(slot, pathPiece[0]);
        else
            await hopAlong(slot, pathPiece.slice(move.from + 1, move.to + 1));

        if (move.victim) {
            const {color: victimColor, index} = move.victim;
            shockwave(pathPiece[move.to], victimColor);
            bump();
            await flyTo(slotOf(victimColor, index), playerColors[victimColor].pieces[index].indexPrison);
        } else if (leavesStable) {
            shockwave(pathPiece[0], color);
        }
    }, [wait]);

    return {layerRef, cardRef, animateMove};
}
