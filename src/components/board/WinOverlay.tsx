import {PlayerColor} from "@/type/PlayerColor";
import {BotIcon, PersonIcon, PlayIcon} from "@/components/Icons";
import {displayColor, playerName} from "@/game/ui/players";
import {useI18n} from "@/i18n/I18nProvider";

type WinOverlayProps = {
    winner: PlayerColor,
    human: PlayerColor,
    onRestart: () => void
}

// The end of the game, in the middle of the board.
export function WinOverlay({winner, human, onRestart}: WinOverlayProps) {
    const {t} = useI18n();
    const tint = displayColor[winner];
    return (
        <div className="board-center">
            <div className={`win-pop win-pop--${tint}`} role="status">
                <span className={`avatar avatar--md avatar--${tint}`} aria-hidden="true">{winner === human ? <PersonIcon size={24}/> : <BotIcon size={24}/>}</span>
                <span className="win-pop__label">{t("game.win.label")}</span>
                <span className="win-pop__name">{winner === human ? t("game.win.you") : t("game.win.bot", {name: playerName(t, winner, human)})}</span>
                <button type="button" className="play-btn play-btn--sm" aria-label={t("game.win.restart")} title={t("game.win.restart")} onClick={onRestart}>
                    <PlayIcon size={28}/>
                </button>
            </div>
        </div>
    );
}
