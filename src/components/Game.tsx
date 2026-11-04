'use client'

import {useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {Button} from "@/components/Button";
import Image from "next/image";
import {PreGameBoard} from "@/components/PreGameBoard";
import {PlayerSelector} from "@/components/PlayerSelector";
import {GameBoard} from "@/components/GameBoard";
import {resetPlayerColors} from "@/game/functions";

const style = {
    div: {
        display: 'flex',
        justifyContent: 'center',
        width: '30%',
        margin: '25px 0'
    },
    button: {
        backgroundColor: '#5151e6',
        padding: '10px',
        color: 'white',
        fontWeight: 'bold',
        borderRadius: '10px',
        width: '142px'
    }
}

export function Game() {
    const [startThePreGame, setStartThePreGame] = useState<boolean>(false)
    const [color, setColor] = useState<PlayerColor | null>(null)
    const [colorWin, setColorWin] = useState<PlayerColor | null>(null)
    const [startTheGame, setStartTheGame] = useState<boolean>(false)
    const [colorStart, setColorStart] = useState<PlayerColor | null>(null)
    const handleColor = (color: PlayerColor) => {
        setColor(color)
    }
    const handleStartTheGame = () => {
        setStartTheGame(true)
    }

    const handleColorStart = (color: PlayerColor) => {
        setColorStart(color)
    }

    const handleStartThePreGame = () => {
        resetPlayerColors()
        if (startThePreGame) {
            setStartThePreGame(false)
            setColor(null)
            setStartTheGame(false)
            setColorStart(null)
            setColorWin(null)
        } else {
            setStartThePreGame(true)
        }
    }

    const handleColorWin = (color: PlayerColor) => {
        setColorWin(color)
    }

    if (!startThePreGame) {
        return (
            <div className="startThePreGame">
                <PreGameBoard isPlay={false} handleStart={handleStartThePreGame}/>
                <Button handleStart={handleStartThePreGame} buttonText={"Jouer"} style={style}/>
            </div>
        )
    } else if (startThePreGame && !color) {
        return (
            <div className="startThePreGame">
                <PreGameBoard isPlay={true} handleColor={handleColor}/>
            </div>
        )
    } else if (color && !startTheGame) {
        return (
            <div className="startTheGame">
                <PreGameBoard isPlay={true} colorPlayer={color} isPlayerSelector={true}/>
                <PlayerSelector handleColorStart={handleColorStart}
                                handleStartTheGame={handleStartTheGame}/>
            </div>
        )
    } else if (colorWin !== null) {
       return (
           <div className="win">
            <div>
                <p>Bravo !</p>
                <Image width={50} height={50} src={colorWin === color ? `./img/person-${colorWin}.svg` : `./img/robot-${colorWin}.svg`} alt="player win"/>
                <p>a gagné la partie</p>
            </div>
            <Button handleStart={handleStartThePreGame} buttonText={"Recommencer une partie"} style={style}/>
        </div>
       )
    } else {
        return (
            <GameBoard colorStart={colorStart as PlayerColor} colorPlayer={color as PlayerColor} handleColorWin={handleColorWin}/>
        )
    }
}