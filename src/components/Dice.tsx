'use client'

import {useCallback, useEffect, useRef} from "react";
import {ErrorMessage} from "@/type/ErrorMessage";
import {PlayerColor} from "@/type/PlayerColor";

type DiceProps = {
    onDiceRoll: (value: number) => void
    canRoll?: boolean,
    handleError?: (message: ErrorMessage | null) => void,
    botRollDice: boolean,
    playerColor?: PlayerColor,
    mainColor?: PlayerColor,
    disabled: boolean,
    count : number,
    preGame : boolean
}

export function Dice({onDiceRoll, canRoll, handleError, botRollDice, mainColor, playerColor, disabled, preGame, count}: DiceProps) {
    const buttonRef = useRef(null);
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
        const dice = buttonRef.current as HTMLElement | null
        if (dice) {
            isRolling.current = true
            const dots = dice.querySelectorAll<HTMLElement>('.dot')
            // Ajout de l'animation de lancer de dé
            dice.classList.add('roll-animation')
            // Réinitialisation des points
            dots.forEach(dot => {
                dot.style.display = 'none';
            });
            rollTimer.current = setTimeout(() => {
                // Génération d'un nombre aléatoire entre 1 et 6
                const randomNumber = Math.floor(Math.random() * 6) + 1;
                // Affichage du nombre de points correspondant
                for (let i = 0; i < randomNumber; i++) {
                    dots[i].style.display = 'block';
                }
                // Suppression de l'animation et réactivation du bouton
                dice.classList.remove('roll-animation');
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
            }, 1000);
        }
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
        <button className="dice" ref={buttonRef} onClick={handleDiceClick} disabled={disabled}>
            <div className="dot" id="dot-1"></div>
            <div className="dot" id="dot-2"></div>
            <div className="dot" id="dot-3"></div>
            <div className="dot" id="dot-4"></div>
            <div className="dot" id="dot-5"></div>
            <div className="dot" id="dot-6"></div>
        </button>
    )
}