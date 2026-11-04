import {PlayerColor} from "@/type/PlayerColor";
import {displayColor} from "@/game/ui/players";

export type HistoryEntry = { id: number, color: PlayerColor, text: string }

export function MoveHistory({title, entries}: { title: string, entries: HistoryEntry[] }) {
    return (
        <section className="card history">
            <h2 className="panel-title">{title}</h2>
            <ol>
                {entries.map(({id, color, text}, index) => (
                    <li key={id} className={index === 0 ? "is-new" : undefined}>
                        <span className={`dot dot--${displayColor[color]}`} aria-hidden="true"></span>
                        <span>{text}</span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
