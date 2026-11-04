import {ComponentProps} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {playerColors} from "@/game/functions";
import {displayColor, playerName} from "@/game/ui/players";
import {Dice} from "@/components/Dice";
import {BotIcon, PersonIcon} from "@/components/Icons";
import {HistoryEntry, MoveHistory} from "@/components/MoveHistory";
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

function getMessage({colorPlayer, turn, diceValue, skipped, busy, dice}: GamePanelProps): string {
    if (turn !== colorPlayer)
        return skipped ? "Aucun pion ne peut avancer." : "Patientez pendant son coup…";
    if (busy)
        return "Votre pion avance…";
    if (diceValue === 6)
        return playerColors[turn].pieces.every(piece => piece.out)
            ? "Un six ! Avancez de 6 cases."
            : "Un six ! Sortez un nouveau pion ou avancez de 6 cases.";
    if (diceValue !== -1)
        return `Choisissez un pion entouré pour avancer de ${diceValue} ${diceValue > 1 ? "cases" : "case"}.`;
    if (dice.preGame) {
        const left = 4 - dice.count;
        return `Lancez le dé : encore ${left} ${left > 1 ? "essais" : "essai"} pour faire un 6.`;
    }
    return "À vous de lancer le dé.";
}

export function GamePanel(props: GamePanelProps) {
    const {colorPlayer, turn, turnNumber, moves, busy, dice} = props;
    const isHumanTurn = turn === colorPlayer;

    return (
        <aside className="game-panel" aria-label="Tour de jeu">
            <TurnCard avatarClass={`avatar--${displayColor[turn]}`} icon={isHumanTurn ? <PersonIcon size={24}/> : <BotIcon size={24}/>}
                      name={isHumanTurn ? "À vous de jouer" : `${playerName(turn, colorPlayer)} joue…`} chip={`Tour ${turnNumber}`}>
                {/* key: a new Dice per turn, its timers and the bot's auto-roll start over with each player. */}
                <Dice key={turn} {...dice} disabled={!isHumanTurn || busy || !dice.canRoll} message={getMessage(props)}/>
            </TurnCard>
            <MoveHistory title="Derniers coups" entries={moves.slice(0, 3)}/>
            <RestartGame onConfirm={props.onRestart}/>
        </aside>
    );
}
