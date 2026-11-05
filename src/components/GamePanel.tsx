import {ComponentProps} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {playerColors} from "@/game/functions";
import {displayColor, playerName} from "@/game/ui/players";
import {moveText, HistoryEntry} from "@/game/history";
import {useI18n} from "@/i18n/I18nProvider";
import type {Translator} from "@/i18n/translate";
import {Dice} from "@/components/Dice";
import {BotIcon, PersonIcon} from "@/components/Icons";
import {MoveHistory} from "@/components/MoveHistory";
import {RestartGame} from "@/components/RestartGame";
import {TurnCard} from "@/components/TurnCard";

type GamePanelProps = {
    colorPlayer: PlayerColor,
    turn: PlayerColor,
    turnNumber: number,
    diceValue: number,
    skipped: boolean,
    moves: HistoryEntry[],
    busy: boolean,
    dice: Omit<ComponentProps<typeof Dice>, "message" | "disabled"> & { canRoll: boolean, preGame: boolean, count: number },
    onRestart: () => void
}

function getMessage({t, tp}: Translator, {colorPlayer, turn, diceValue, skipped, busy, dice}: GamePanelProps): string {
    if (turn !== colorPlayer)
        return skipped ? t("game.messages.botSkipped") : t("game.messages.botWaiting");
    if (busy)
        return t("game.messages.moving");
    if (diceValue === 6)
        return playerColors[turn].pieces.every(piece => piece.out)
            ? t("game.messages.sixAllOut")
            : t("game.messages.sixRelease");
    if (diceValue !== -1)
        return tp("game.messages.choosePawn", diceValue);
    if (dice.preGame)
        return tp("game.messages.preGameTries", 4 - dice.count);
    return t("game.messages.yourRoll");
}

export function GamePanel(props: GamePanelProps) {
    const {colorPlayer, turn, turnNumber, moves, busy, dice} = props;
    const i18n = useI18n();
    const {t} = i18n;
    const isHumanTurn = turn === colorPlayer;

    return (
        <aside className="game-panel" aria-label={t("game.regionLabel")}>
            <TurnCard avatarClass={`avatar--${displayColor[turn]}`} icon={isHumanTurn ? <PersonIcon size={24}/> : <BotIcon size={24}/>}
                      name={isHumanTurn ? t("game.humanTitle") : t("game.botTitle", {name: playerName(t, turn, colorPlayer)})} chip={t("game.chip", {n: turnNumber})}>
                {/* key: a new Dice per turn, its timers and the bot's auto-roll start over with each player. */}
                <Dice key={turn} {...dice} disabled={!isHumanTurn || busy || !dice.canRoll} message={getMessage(i18n, props)}/>
            </TurnCard>
            <MoveHistory title={t("game.historyTitle")} entries={moves.slice(0, 3).map(move => ({id: move.id, color: move.color, text: moveText(i18n, move, colorPlayer)}))}/>
            <RestartGame onConfirm={props.onRestart}/>
        </aside>
    );
}
