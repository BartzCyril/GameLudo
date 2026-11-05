import {CSSProperties, Ref} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {Die3D, Die3DHandle} from "@/components/Die3D";
import {displayColor} from "@/game/ui/players";
import {useI18n} from "@/i18n/I18nProvider";

// Free 2 × 2 area beside each stable, where the die lands on that player's turn: [row, column] of its top-left cell.
export const DIE_ZONES: Record<PlayerColor, { r: number, c: number }> = {
    [PlayerColor.YELLOW]: {r: 0, c: 2},
    [PlayerColor.GREEN]: {r: 0, c: 7},
    [PlayerColor.BLUE]: {r: 9, c: 2},
    [PlayerColor.RED]: {r: 9, c: 7},
};

type BoardDieProps = {
    dieRef: Ref<Die3DHandle>,
    color: PlayerColor,     // whose corner the die sits in
    value: number | null,
    clickable: boolean,     // the human may roll now
    onRoll: () => void
}

// One die for the whole game: it slides from corner to corner. The human rolls it by clicking it.
export function BoardDie({dieRef, color, value, clickable, onRoll}: BoardDieProps) {
    const {t} = useI18n();
    const zone = DIE_ZONES[color];
    return (
        <div className={`board-die board-die--${displayColor[color]}${clickable ? " is-clickable" : ""}`} style={{"--r": zone.r, "--c": zone.c} as CSSProperties}>
            <button type="button" className="board-die__button" disabled={!clickable} onClick={onRoll}
                    aria-label={t("game.rollButton")} title={clickable ? t("game.rollButton") : undefined}>
                <Die3D ref={dieRef} value={value} idle={clickable}/>
            </button>
        </div>
    );
}
