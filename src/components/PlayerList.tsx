import {ReactNode} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {displayColor, playerName} from "@/game/ui/players";
import {BotIcon, PersonIcon} from "@/components/Icons";
import {useI18n} from "@/i18n/I18nProvider";

export type PlayerRow = {
    color: PlayerColor,
    status: string,
    active: boolean,
    stateClass?: string,
    aside: ReactNode
}

type PlayerListProps = {
    title: string,
    human: PlayerColor | null,
    rows: PlayerRow[]
}

export function PlayerList({title, human, rows}: PlayerListProps) {
    const {t} = useI18n();
    return (
        <section className="card players">
            <h2 className="panel-title">{title}</h2>
            <ul>
                {rows.map(({color, status, active, stateClass = "", aside}) => {
                    const tint = displayColor[color];
                    return (
                        <li key={color} className={`player player--${tint} ${active ? "is-active" : ""} ${stateClass}`} aria-current={active ? "true" : undefined}>
                            <span className={`avatar avatar--sm avatar--${tint}`}>{color === human ? <PersonIcon/> : <BotIcon/>}</span>
                            <span className="player__text">
                                <span className="player__name">{playerName(t, color, human)}</span>
                                <span className="player__status">{status}</span>
                            </span>
                            {aside}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
