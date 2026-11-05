import {PlayIcon} from "@/components/Icons";

type PlayButtonProps = {
    label: string,          // "Jouer", "Reprendre la partie", "Recommencer une partie"
    caption?: string,       // shown under the button
    onPlay: () => void
}

// The round button in the middle of the board, as on the first version of the site.
export function PlayButton({label, caption, onPlay}: PlayButtonProps) {
    return (
        <div className="board-center">
            <button type="button" className="play-btn" aria-label={label} title={label} onClick={onPlay}>
                <PlayIcon/>
            </button>
            {caption && <p className="board-center__caption">{caption}</p>}
        </div>
    );
}
