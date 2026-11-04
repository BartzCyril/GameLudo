'use client'

import {useCallback, useEffect, useRef} from "react";
import {ErrorMessage} from "@/type/ErrorMessage";
import {PlayerColor} from "@/type/PlayerColor";
import {switchPlayer} from "@/game/functions";

type DiceProps = {
    onDiceRoll: (value: number) => void
    canRoll?: boolean,
    handleError?: (message: ErrorMessage | null) => void,
    botRollDice: boolean,
    playerColor?: PlayerColor,
    mainColor?: PlayerColor,
    disabled: boolean,
    gameBoard: HTMLElement,
    count : number,
    preGame : boolean
}

export function Dice({onDiceRoll, canRoll, handleError, botRollDice, mainColor, playerColor, disabled, gameBoard, preGame, count}: DiceProps) {
    const buttonRef = useRef(null);
    const isRolling = useRef(false);
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
            setTimeout(() => {
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
                if (mainColor === playerColor) {
                    finishRoll()
                }
                else if (preGame) {
                    if (count === 3) {
                        setTimeout(finishRoll, 1300)
                    } else
                        finishRoll()
                }
                else if (switchPlayer(gameBoard, playerColor as PlayerColor, randomNumber) || randomNumber !== 6) {
                    setTimeout(finishRoll, 1300)
                } else {
                    finishRoll()
                }
            }, 1000);
        }
    }, [canRoll, handleError, onDiceRoll])
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