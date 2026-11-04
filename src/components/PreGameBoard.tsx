import {GameBoard, CellState} from "@/type/GameBoard";
import {getGameBoard} from "@/game/gameboard/gameboard";
import {PlayerColor} from "@/type/PlayerColor";
import Image from "next/image";
import {useToasts} from "@/components/ToastContext";
import {useEffect} from "react";

type CellProps = {
    color: CellState | PlayerColor;
    id: string;
    isPlay?: boolean;
    colorPlayer?: PlayerColor
    handleColor?: (color: PlayerColor) => void;
};

type PreGameBoard = {
    isPlay?: boolean;
    colorPlayer?: PlayerColor,
    handleStart?: () => void,
    handleColor?: (color: PlayerColor) => void;
    isPlayerSelector?: boolean
}

function Cell({color, id, isPlay, colorPlayer, handleColor}: CellProps) {
    if (
        id === '0' || id === '1' || id === '11' || id === '12' ||
        id === '108' || id === '109' || id === '119' || id === '120' ||
        id === '9' || id === '10' || id === '20' || id === '21' ||
        id === '99' || id === '100' || id === '110' || id === '111'
    ) {
        if (colorPlayer !== undefined) {
            return <div className={`${color} pieceGame`} id={`cell-${id}`}>
                {color === colorPlayer ? <Image width={0}
  height={0} src={`./img/person-${color}.svg`} alt="your player"/> :
                    <Image width={0}
                    height={0} src={`./img/robot-${color}.svg`} alt="robot player"/>}
            </div>;
        } else {
            return <div className={`${color} pieceGame ${handleColor ? 'pointer' : ''}`} id={`cell-${id}`} onClick={() => handleColor ? handleColor(color as PlayerColor) : ""}></div>
        }
    } else if (
        id === '16' || id === '27' || id === '38' || id === '49' ||
        id === '64' || id === '63' || id === '62' || id === '61' ||
        id === '104' || id === '93' || id === '82' || id === '71' ||
        id === '56' || id === '57' || id === '58' || id === '59'
    )
        return <div className={`${color} pieceGame ${handleColor ? 'pointer' : ''}`} id={`cell-${id}`} onClick={() => handleColor ? handleColor(color as PlayerColor) : ""}></div>;
    else if (
        id === "6" || id === "44" || id === "76" || id === "114"
    )
        return <div className={`border-${color} cell-start ${handleColor ? 'pointer' : ''}`} id={`cell-${id}`} onClick={() => handleColor ? handleColor(color as PlayerColor) : ""}></div>;
    else if (
        !isPlay && id === '60'
    )
        return <div
            className="btn-play">
            <Image width={100}
  height={100} src="./img/play.svg" alt="play"/>
        </div>
    else if (color === "transparent")
        return <div className={`${color}`} id={`cell-${id}`}></div>;
    else
        return <div className={`pieceGame`} id={`cell-${id}`}></div>;
}

export function PreGameBoard({isPlay, colorPlayer, handleStart, handleColor, isPlayerSelector}: PreGameBoard) {
    const GameBoard: GameBoard = getGameBoard()
    const {pushToast} = useToasts();

    useEffect(() => {
        if (isPlayerSelector || !isPlay)
            return
        const toast = { title: "Choisissez votre couleur", content: "Cliquez sur une case de couleur pour choisir votre couleur !", duration: 1.8 }
        pushToast(toast)
        const intervalId = setInterval(() => pushToast(toast), 8000)
        return () => clearInterval(intervalId)
    }, [isPlay, isPlayerSelector, pushToast]);

    if (!isPlay) {
        return (
            <button className="gameBoard preGameBoard" onClick={handleStart}>
                <div className="gameBoard-grid">
                    {GameBoard.map((color, index) => <Cell color={color} id={`${index}`} key={`${index}`} isPlay={isPlay}
                                                           colorPlayer={colorPlayer}/>)}
                </div>
            </button>
        )
    }
    return (
        <div className="gameBoard preGameBoard">
            <div className="gameBoard-grid">
                {GameBoard.map((color, index) => <Cell color={color} id={`${index}`} key={`${index}`} isPlay={isPlay}
                                                       colorPlayer={colorPlayer} handleColor={handleColor}/>)}
            </div>
        </div>
    )
}
