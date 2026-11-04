'use client'

import {useCallback, useEffect, useRef, useState} from "react";
import {ErrorMessage} from "@/type/ErrorMessage";
import {PlayerColor} from "@/type/PlayerColor";
import {Button} from "@/components/Button";
import {Die} from "@/components/Die";
import {DiceIcon} from "@/components/Icons";
import {rollDie} from "@/game/draw";

// Same length as --duration-roll.
const ROLL_DURATION = 450

type DiceProps = {
    onDiceRoll: (value: number) => void
    canRoll?: boolean,
    handleError?: (message: ErrorMessage | null) => void,
    botRollDice: boolean,
    playerColor?: PlayerColor,
    mainColor?: PlayerColor,
    disabled: boolean,
    count : number,
    preGame : boolean,
    lastRoll: number | null,
    message: string
}

export function Dice({onDiceRoll, canRoll, handleError, botRollDice, mainColor, playerColor, disabled, preGame, count, lastRoll, message}: DiceProps) {
    const [face, setFace] = useState(lastRoll);
    const [rolling, setRolling] = useState(false);
    const isRolling = useRef(false);
    const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleDiceClick = useCallback(() => {
        if (mainColor === playerColor && !canRoll) {
            if (handleError) {
                handleError(ErrorMessage.CANNOT_REROLL)
                return
            }
        }
        if (isRolling.current)
            return
        isRolling.current = true
        setRolling(true)
        rollTimer.current = setTimeout(() => {
            const randomNumber = rollDie();
            setFace(randomNumber)
            setRolling(false)
            const finishRoll = () => {
                isRolling.current = false
                onDiceRoll(randomNumber)
            }
            // Pause on a bot's roll when its turn is about to end, so the player can read the dice.
            const isDelayed = mainColor !== playerColor && (preGame ? count === 3 : randomNumber !== 6)
            if (isDelayed)
                rollTimer.current = setTimeout(finishRoll, 1300)
            else
                finishRoll()
        }, ROLL_DURATION);
    }, [canRoll, handleError, onDiceRoll])
    useEffect(() => () => {
        if (rollTimer.current)
            clearTimeout(rollTimer.current)
    }, [])
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (botRollDice) {
                handleDiceClick()
            }
        }, 1000)
        return () => {
            if (timeout)
                clearTimeout(timeout)
        }
    }, [botRollDice, handleDiceClick, onDiceRoll])

    return (
        <>
            <Die value={face} message={rolling ? "" : message} rolling={rolling}/>
            <Button variant="roll" onClick={handleDiceClick} disabled={disabled}><DiceIcon/>Lancer le dé</Button>
        </>
    )
}
