'use client'


import {CSSProperties, useEffect, useRef, useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {useToasts} from "@/components/ToastContext";

type PlayerSelectorProps = {
    handleStartTheGame : () => void,
    handleColorStart : (color: PlayerColor) => void
}

const colors = [
    {'--i': 1, '--clr': '#BCF4F5'},
    {'--i': 2, '--clr': '#FFB7C3'},
    {'--i': 3, '--clr': '#B4EBCA'},
    {'--i': 4, '--clr': '#F7F08B'},
    {'--i': 5, '--clr': '#BCF4F5'},
    {'--i': 6, '--clr': '#FFB7C3'},
    {'--i': 7, '--clr': '#B4EBCA'},
    {'--i': 8, '--clr': '#F7F08B'}
];

function getColor(color: string): PlayerColor {
    switch (color) {
        case "#BCF4F5" :
            return PlayerColor.BLUE
        case "#FFB7C3" :
            return PlayerColor.RED
        case "#B4EBCA" :
            return PlayerColor.GREEN
        default :
            return PlayerColor.YELLOW
    }
}

function getPlayerWinner(value: number) {
    const ratio = (1 / colors.length) / 2
    const elementsWheel = document.querySelectorAll('.wheel div')
    const arrayColor: PlayerColor[] = []
    for (let i = 0; i < elementsWheel.length; i++) {
        const halfIntervalValue = parseFloat(elementsWheel[i].id)
        const decimal = (value / 360) - Math.floor(value / 360)
        if (decimal >= (halfIntervalValue - ratio) && decimal <= (halfIntervalValue + (ratio * 2))) {
            const colorElement = getComputedStyle(elementsWheel[i]).getPropertyValue("--clr")
            arrayColor.push(getColor(colorElement))
        }
    }
    return arrayColor[arrayColor.length - 1]
}

export function PlayerSelector({handleColorStart, handleStartTheGame}: PlayerSelectorProps) {

    const [isWheelClick, setIsWheelClick] = useState(false)
    const {pushToast} = useToasts();
    const wheelRef = useRef<HTMLDivElement>(null)
    const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (isWheelClick)
            return
        const toast = { title: "Joueur qui commence la partie", content: "Pour déterminer le joueur qui commence la partie, cliquez sur la roue !", duration: 5 }
        pushToast(toast)
        const idInterval = setInterval(() => pushToast(toast), 8000)
        return () => clearInterval(idInterval)
    }, [isWheelClick, pushToast])

    useEffect(() => () => {
        if (startTimer.current)
            clearTimeout(startTimer.current)
    }, [])

    const handleSpin = () => {
        if (startTimer.current || !wheelRef.current)
            return
        setIsWheelClick(true)
        const value = Math.ceil(Math.random() * 3600)
        wheelRef.current.style.transform = `rotate(${value}deg)`
        const playerWin = getPlayerWinner(value)
        startTimer.current = setTimeout(() => {
            handleColorStart(playerWin)
            handleStartTheGame()
        }, 8000)
    }


    return (
        <div className="playerSelector">
            <div className="container">
                <div className="spin" onClick={handleSpin}>Roue</div>
                <div className="wheel" ref={wheelRef}>
                    {colors.map((color, index) => (
                        <div
                            key={index}
                            className="color"
                            style={color as CSSProperties}
                            id={(((1 / colors.length) * ((colors.length - 1) - index)) + ((1 / colors.length)) / 2).toString()}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    )
}

