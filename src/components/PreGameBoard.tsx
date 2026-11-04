import {getGameBoard} from "@/game/gameboard/gameboard";
import {Cell} from "@/components/Cell";

// Board before the game: every pawn is in its stable and none can move.
export function PreGameBoard() {
    return (
        <section className="board-card" aria-label="Plateau de jeu">
            <div className="board">
                {getGameBoard().map((color, index) => <Cell color={color} id={`${index}`} key={index}/>)}
            </div>
        </section>
    )
}
