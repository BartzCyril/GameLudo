import {ComponentProps} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {playerColors} from "@/game/functions";
import {countPieces, displayColor, piecesStatus, playerName, TURN_ORDER} from "@/game/ui/players";
import {Dice} from "@/components/Dice";
import {BotIcon, PersonIcon} from "@/components/Icons";
import {HistoryEntry, MoveHistory} from "@/components/MoveHistory";
import {PlayerList} from "@/components/PlayerList";
import {TurnCard} from "@/components/TurnCard";

type GamePanelProps = {
    colorPlayer: PlayerColor,
    colorStart: PlayerColor,
    turn: PlayerColor,
    turnNumber: number,
    diceValue: number,
    skipped: boolean,
    moves: HistoryEntry[],
    dice: Omit<ComponentProps<typeof Dice>, "message" | "disabled">
}

function getMessage({colorPlayer, turn, diceValue, skipped, dice}: GamePanelProps): string {
    if (turn !== colorPlayer)
        return `${skipped ? "Aucun pion ne peut avancer. " : ""}${playerName(turn, colorPlayer)} joue…`;
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
    const {colorPlayer, colorStart, turn, turnNumber, moves, dice} = props;
    const isHumanTurn = turn === colorPlayer;
    const startIndex = TURN_ORDER.indexOf(colorStart);
    const order = TURN_ORDER.map((_, index) => TURN_ORDER[(startIndex + index) % TURN_ORDER.length]);

    const rows = order.map(color => {
        const pieces = playerColors[color].pieces;
        const {out} = countPieces(pieces);
        const status = piecesStatus(pieces);
        return {
            color,
            active: color === turn,
            status: color === turn ? `Joue maintenant · ${status}` : status,
            aside: (
                <span className="player__dots" role="img" aria-label={`${out} ${out > 1 ? "pions" : "pion"} sur 4 en jeu`}>
                    {pieces.map((_, index) => <span key={index} className={`dot dot--${displayColor[color]} ${index < out ? "is-out" : ""}`}></span>)}
                </span>
            ),
        };
    });

    return (
        <aside className="game-panel" aria-label="Tour de jeu">
            <TurnCard avatarClass={`avatar--${displayColor[turn]}`} icon={isHumanTurn ? <PersonIcon size={24}/> : <BotIcon size={24}/>}
                      label="C'est à" name={isHumanTurn ? "Vous de jouer" : `${playerName(turn, colorPlayer)} joue…`} chip={`Tour ${turnNumber}`}>
                {/* key: a new Dice per turn, its timers and the bot's auto-roll start over with each player. */}
                <Dice key={turn} {...dice} disabled={!isHumanTurn} message={getMessage(props)}/>
            </TurnCard>
            <PlayerList title="Joueurs" human={colorPlayer} rows={rows}/>
            <MoveHistory title="Derniers coups" entries={moves}/>
        </aside>
    );
}
