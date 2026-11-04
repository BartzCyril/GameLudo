import {PlayerColor} from '@/type/PlayerColor';
import {colorLabel, displayColor, TURN_ORDER} from "@/game/ui/players";
import {PersonIcon} from "@/components/Icons";

type ColorSelectorProps = {
    handleColor: (color: PlayerColor) => void;
};

export function ColorSelector({handleColor}: ColorSelectorProps) {
    return (
        <div className="color-choice">
            {TURN_ORDER.map((color) => (
                <button key={color} type="button" className={`avatar--${displayColor[color]}`} onClick={() => handleColor(color)}>
                    <PersonIcon/>{colorLabel[color].name}
                </button>
            ))}
        </div>
    );
}
