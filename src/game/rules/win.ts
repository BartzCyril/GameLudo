import {PlayerColors} from "@/interface/GameBoard";
import {PlayerColor} from "@/type/PlayerColor";
import {countPieces} from "@/game/ui/players";

export function win(playerColors: PlayerColors, turn: PlayerColor): boolean {
    const {pieces} = playerColors[turn]
    return countPieces(pieces).arrived === pieces.length
}
