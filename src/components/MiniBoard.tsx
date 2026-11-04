import {getGameBoard} from "@/game/gameboard/gameboard";
import {describeCell} from "@/game/gameboard/cells";

const baseClass = {
    empty: "mini-cell mini-cell--empty",
    center: "mini-cell mini-cell--center",
    track: "mini-cell",
}

export function MiniBoard() {
    return (
        <div className="mini-board" aria-hidden="true">
            <div className="mini-board__grid">
                {getGameBoard().map((state, index) => {
                    const cell = describeCell(state, index);
                    if (cell.type === "empty" || cell.type === "center" || cell.type === "track")
                        return <span key={index} className={baseClass[cell.type]}></span>;
                    return (
                        <span key={index} className={`mini-cell cell--${cell.tint} ${cell.type === "start" ? "cell--start" : ""}`}>
                            {cell.type === "prison" && <span className={`mini-pawn pawn--${cell.tint}`}></span>}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
