import {CSSProperties} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {PersonIcon} from "@/components/Icons";
import {displayColor, TURN_ORDER} from "@/game/ui/players";
import {useI18n} from "@/i18n/I18nProvider";

// Each player's 4 × 4 corner: [row, column] of its top-left cell.
const CORNERS: Record<PlayerColor, { r: number, c: number }> = {
    [PlayerColor.YELLOW]: {r: 0, c: 0},
    [PlayerColor.GREEN]: {r: 0, c: 7},
    [PlayerColor.BLUE]: {r: 7, c: 0},
    [PlayerColor.RED]: {r: 7, c: 7},
};

// The four corners light up: clicking one picks that colour.
export function ColorPicker({onPick}: { onPick: (color: PlayerColor) => void }) {
    const {t} = useI18n();
    return (
        <div className="color-picker" role="group" aria-label={t("prepare.chooseColor")}>
            {TURN_ORDER.map((color, index) => {
                const {r, c} = CORNERS[color];
                return (
                    <button key={color} type="button" className={`corner-pick corner-pick--${displayColor[color]}`}
                            style={{"--r": r, "--c": c, "--i": index} as CSSProperties} onClick={() => onPick(color)}>
                        <span className="corner-pick__label">
                            <PersonIcon size={18}/>
                            {t(`colors.${color}.name`)}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
