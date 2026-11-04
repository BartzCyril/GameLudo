'use client'

import type {GameBoard} from "@/type/GameBoard";
import {Cell} from "@/components/Cell";
import {useCallback, useEffect, useRef, useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {ErrorMessage} from "@/type/ErrorMessage";
import {
    canRetryRollDice,
    isPieceOut,
    moveForwardPiece,
    playerColors,
    pushListDomPieces,
    switchPlayer,
    switchTurn
} from "@/game/functions";
import {moveForwardPieceBot} from "@/game/bot/functions";
import {getGameBoard} from "@/game/gameboard/gameboard";
import {Turn} from "@/components/Turn";
import {useToasts} from "@/components/ToastContext";

type GameBoardProps = {
    colorPlayer: PlayerColor,
    colorStart: PlayerColor,
    handleColorWin : (color: PlayerColor) => void
}


export function GameBoard({colorPlayer, colorStart, handleColorWin}: GameBoardProps) {
    const GameBoard: GameBoard = getGameBoard()
    const [diceValue, setDiceValue] = useState(-1);
    const [turn, setTurn] = useState<PlayerColor>(colorStart)
    const [error, setError] = useState<ErrorMessage | null>(null)
    const gameBoardRef = useRef<HTMLDivElement>(null)
    const [preGame, setPreGame] = useState(true)
    const [count, setCount] = useState(1)
    const [canRollDice, setCanRollDice] = useState(true)
    const [forwardBot, setForwardBot] = useState(0)
    const {pushToast} = useToasts();
    const botRollDice = turn !== colorPlayer

    const displayToast = useCallback((title: string, message : string, duration : number, type : "success" | "danger" | "default") => {
        pushToast({title: title, content : message, duration : 1.8, type : type})
        return setInterval(() => {
            pushToast({title: title, content : message, duration : 1.8, type : type})
        }, duration * 1000)
    }, [pushToast])
    const handleDiceRoll = (value: number) => {
        setForwardBot(c => c + 1)
        setDiceValue(value)
        if (preGame) {
            if (value === 6) {
                setPreGame(false)
                if (turn === colorPlayer)
                    setCanRollDice(false)
                if (turn !== colorPlayer) {
                    if (gameBoardRef.current) {
                        moveForwardPieceBot(gameBoardRef.current as HTMLElement, value, turn, handleSwitchTurn, handleColorWin)
                        setDiceValue(-1)
                    }
                    return
                }
            }
            else {
                setDiceValue(-1)
                setCount(c => c + 1)
                if (count === 3) {
                    setCount(1)
                    handleSwitchTurn()
                    setDiceValue(-1)
                    return
                }
            }
        } else {
            if (turn !== colorPlayer) {
                if (gameBoardRef.current) {
                    moveForwardPieceBot(gameBoardRef.current as HTMLElement, value, turn, handleSwitchTurn, handleColorWin)
                    setDiceValue(-1)
                }
            }
            if (!isPieceOut(turn) && value === 6 && turn === colorPlayer)
                setCanRollDice(false)
            if (gameBoardRef.current && switchPlayer(gameBoardRef.current as HTMLElement, turn, value)) {
                handleSwitchTurn()
                setDiceValue(-1)
            } else {
                if (turn === colorPlayer) {
                    if (value === 6 && canRetryRollDice(gameBoardRef.current as unknown as HTMLElement, turn, value) && isPieceOut(turn))
                        setCanRollDice(true)
                    else
                        setCanRollDice(false)
                }
            }
        }
    }

    const handleSwitchTurn = useCallback(() => {
        setTurn(switchTurn(turn as PlayerColor));
    }, [turn])

    const handleError = (message: ErrorMessage | null) => {
        setError(message)
    }

    useEffect(() => {
        if (error !== null)
            pushToast({title: "Attention", content : error as string, duration : 3, type : "danger"})
    }, [error, pushToast])

    useEffect(() => {
        let idDisplayToast: ReturnType<typeof setInterval> | null = null
        if (preGame) {
            if (diceValue === 6) {
                idDisplayToast = displayToast("Information", `Vous pouvez sortir un pion de la prison, vous avez obtenu un 6`, 10, "default")
            }
            else if (turn === colorPlayer) {
                idDisplayToast = displayToast("Information", "Vous pouvez lancer le dé 3 fois jusqu'à l'obtention d'un 6 !", 8, "default")
            }
        }
        else if (turn === colorPlayer) {
            if (diceValue !== -1) {
                idDisplayToast = displayToast("Information", `Vous pouvez avancer un de vos pions, vous avez obtenu un ${diceValue}`, 10, "default")
            } else {
                idDisplayToast = displayToast("Super", "C'est à vous de jouer, cliquez sur le dé pour pourvoir avancer !", 10, "success")
            }
        }
        return () => {
            if (idDisplayToast)
                clearInterval(idDisplayToast)
        }
    }, [turn, colorPlayer, preGame, displayToast, diceValue])

    useEffect(() => {

        const gameBoard = gameBoardRef.current as HTMLElement | null;

        const handleClick: EventListenerObject = {
            handleEvent(event: MouseEvent) {
                const piece = event.target as HTMLElement;
                const indexPlayerColor = parseInt(piece.id.split("-")[2])
                const colorPlayerColor = piece.id.split("-")[1]
                if (colorPlayerColor === turn && diceValue !== -1) {
                    if (moveForwardPiece(gameBoard as HTMLElement, diceValue, indexPlayerColor, turn as PlayerColor, handleSwitchTurn, handleError, error, handleColorWin) !== -1) {
                        setCanRollDice(true)
                        setDiceValue(-1)
                    }
                }
            }
        };

        if (turn === colorPlayer) {
            playerColors[turn].listDomPieces.forEach((piece) => {
                if (piece) {
                    piece.addEventListener('click', handleClick);
                    piece.classList.add("piece")
                }

            })
        }

        return () => {
            if (turn === colorPlayer) {
                playerColors[turn].listDomPieces.forEach((piece) => {
                    if (piece) {
                        piece.removeEventListener('click', handleClick);
                        piece.classList.remove("piece")
                    }
                })
            }
        };
    }, [diceValue, turn, forwardBot]);

    return (
        <>
            <div className="game">
                <div className="gameBoard" ref={gameBoardRef}>
                    <div className="gameBoard-grid">
                        {GameBoard.map((color, index) => <Cell color={color} id={`${index}`} key={`${index}`}
                                                               pushListDomPieces={pushListDomPieces} colorPlayer={colorPlayer}/>)}
                    </div>
                </div>
                <Turn colorStart={colorStart} colorPlayer={colorPlayer} onDiceRoll={handleDiceRoll} canRoll={canRollDice} handleError={handleError} botRollDice={botRollDice} playerColor={turn} mainColor={colorPlayer} preGame={preGame} count={count}/>
            </div>
        </>
    )
}