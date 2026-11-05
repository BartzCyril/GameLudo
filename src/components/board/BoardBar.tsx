import {ReactNode} from "react";

type BoardBarProps = {
    chip?: string,          // "Tour 12"
    message: string,        // what to do now, read aloud by screen readers
    detail?: string,        // the last move, in smaller print
    tint?: string,          // colour of the player concerned (yellow, green, pink, cyan)
    action?: ReactNode      // the restart icon, top right
}

// The strip at the top of the board: the only text of the game, and the restart icon.
export function BoardBar({chip, message, detail, tint, action}: BoardBarProps) {
    return (
        <div className={`board-bar${tint ? ` board-bar--${tint}` : ""}`}>
            {/* key: a new chip each time the text changes, so its animation plays again. */}
            {chip && <span key={chip} className="chip-turn is-popping">{chip}</span>}
            <div className="board-bar__text" aria-live="polite">
                <p className="board-bar__message">{message}</p>
                {detail && <p className="board-bar__detail">{detail}</p>}
            </div>
            {action && <div className="board-bar__action">{action}</div>}
        </div>
    );
}
