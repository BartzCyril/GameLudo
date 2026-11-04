const FACES: Record<number, number[]> = {1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]};

type DieProps = {
    value: number | null,
    message: string,
    rolling: boolean,
    rollKey?: number
}

// rollKey restarts the animation on rolls that resolve instantly; it stays off the aria-live zone.
export function Die({value, message, rolling, rollKey}: DieProps) {
    const pips = value ? FACES[value] : [];
    return (
        <div className="die-row">
            <div key={rollKey} className={`die${rolling ? " is-rolling" : ""}`} role="img" aria-label={value ? `Dé : ${value}` : "Dé pas encore lancé"}>
                {Array.from({length: 9}, (_, index) => (
                    <span key={index} className={`die__pip${pips.includes(index) ? " is-on" : ""}`}></span>
                ))}
            </div>
            <div className="die-info" aria-live="polite">
                <span className="die-info__value">{value ?? "–"}</span>
                <span className="die-info__msg">{message}</span>
            </div>
        </div>
    );
}
