'use client'

import {useCallback, useEffect, useRef} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {Button} from "@/components/Button";
import {Die3D, Die3DHandle} from "@/components/Die3D";
import {DiceIcon} from "@/components/Icons";
import {rollDie} from "@/game/draw";
import {motion, useWait} from "@/game/ui/motion";

type DiceProps = {
    onDiceRoll: (value: number) => void
    botRollDice: boolean,
    playerColor?: PlayerColor,
    mainColor?: PlayerColor,
    disabled: boolean,
    lastRoll: number | null,
    message: string
}

export function Dice({onDiceRoll, botRollDice, mainColor, playerColor, disabled, lastRoll, message}: DiceProps) {
    const die = useRef<Die3DHandle>(null);
    const isRolling = useRef(false);
    const wait = useWait();
    const handleDiceClick = useCallback(async () => {
        if (isRolling.current)
            return
        isRolling.current = true
        const value = rollDie();
        await die.current?.roll(value)
        // Pause on a bot's roll so the player can read the dice before the pawn moves.
        if (mainColor !== playerColor)
            await wait(motion().pop)
        isRolling.current = false
        onDiceRoll(value)
    }, [mainColor, onDiceRoll, playerColor, wait])
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (botRollDice) {
                handleDiceClick()
            }
        }, 1000)
        return () => clearTimeout(timeout)
    }, [botRollDice, handleDiceClick, onDiceRoll])

    return (
        <>
            <Die3D ref={die} value={lastRoll} message={message} idle={!disabled}/>
            <Button variant="roll" onClick={handleDiceClick} disabled={disabled}><DiceIcon/>Lancer le dé</Button>
        </>
    )
}
