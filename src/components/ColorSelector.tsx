import {PlayerColor} from '@/type/PlayerColor';
import {displayColor, TURN_ORDER} from "@/game/ui/players";
import {useI18n} from "@/i18n/I18nProvider";
import {PersonIcon} from "@/components/Icons";

type ColorSelectorProps = {
    handleColor: (color: PlayerColor) => void;
};

export function ColorSelector({handleColor}: ColorSelectorProps) {
    const {t} = useI18n();
    return (
        <div className="color-choice">
            {TURN_ORDER.map((color) => (
                <button key={color} type="button" className={`avatar--${displayColor[color]}`} onClick={() => handleColor(color)}>
                    <PersonIcon/>{t(`colors.${color}.name`)}
                </button>
            ))}
        </div>
    );
}
