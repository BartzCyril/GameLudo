import {CSSProperties} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {playerColors} from "@/game/functions";
import {countPieces, displayColor, playerName, TURN_ORDER} from "@/game/ui/players";
import {BotIcon, PersonIcon} from "@/components/Icons";

// Empty 4 × 2 area next to each stable: [row, column] of its top-left cell, and which corner the badge sticks to.
const ZONES: Record<PlayerColor, { r: number, c: number, top: boolean, right: boolean }> = {
    [PlayerColor.YELLOW]: {r: 2, c: 0, top: true, right: false},
    [PlayerColor.GREEN]: {r: 2, c: 7, top: true, right: true},
    [PlayerColor.BLUE]: {r: 7, c: 0, top: false, right: false},
    [PlayerColor.RED]: {r: 7, c: 7, top: false, right: true},
};

function shortStatus(color: PlayerColor) {
    const {onTrack, lastLine, arrived} = countPieces(playerColors[color].pieces);
    const parts: string[] = [];
    if (onTrack + lastLine)
        parts.push(`${onTrack + lastLine} en jeu`);
    if (arrived)
        parts.push(`${arrived} ${arrived > 1 ? "arrivés" : "arrivé"}`);
    return parts.join(" · ") || "Aucun en jeu";
}

type CornerBadgesProps = {
    human: PlayerColor,
    turn: PlayerColor | null
}

// The players, each one beside its own stable on the board. Read from playerColors at every render of GameBoard.
export function CornerBadges({human, turn}: CornerBadgesProps) {
    return (
        <ul className="corner-badges" aria-label="Joueurs">
            {TURN_ORDER.map(color => {
                const zone = ZONES[color];
                const tint = displayColor[color];
                const active = color === turn;
                const {out} = countPieces(playerColors[color].pieces);
                const name = playerName(color, human);
                const status = shortStatus(color);
                return (
                    <li key={color} aria-current={active ? "true" : undefined}
                        className={`corner-badge corner-badge--${tint} ${zone.top ? "corner-badge--top" : "corner-badge--bottom"} ${zone.right ? "corner-badge--right" : ""} ${active ? "is-active" : ""}`}
                        style={{"--r": zone.r, "--c": zone.c} as CSSProperties}>
                        <div className="corner-badge__card">
                            <span className={`avatar avatar--sm avatar--${tint}`} aria-hidden="true">{color === human ? <PersonIcon size={18}/> : <BotIcon size={18}/>}</span>
                            <span className="corner-badge__text">
                                <span className="corner-badge__name">
                                    {name}
                                    {active && <span className="corner-badge__pill">{color === human ? "À vous" : "Joue"}</span>}
                                </span>
                                <span className="corner-badge__status">
                                    <span className="player__dots" aria-hidden="true">
                                        {[0, 1, 2, 3].map(index => <span key={index} className={`dot dot--${tint} ${index < out ? "is-out" : ""}`}></span>)}
                                    </span>
                                    <span className="corner-badge__label">{status}</span>
                                </span>
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
