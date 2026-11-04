'use client'

import type {GameBoard} from "@/type/GameBoard";
import {Cell} from "@/components/Cell";
import {useCallback, useEffect, useRef, useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {ErrorMessage} from "@/type/ErrorMessage";
import {
    canMovePiece,
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
import {GamePanel} from "@/components/GamePanel";
import {HistoryEntry} from "@/components/MoveHistory";
import {describeMove, PiecesSnapshot, snapshotPieces} from "@/game/history";
import {playerName} from "@/game/ui/players";
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
    const [lastRoll, setLastRoll] = useState<number | null>(null)
    const [skipped, setSkipped] = useState(false)
    const [moves, setMoves] = useState<HistoryEntry[]>([])
    const nextMoveId = useRef(0)
    const [turnNumber, setTurnNumber] = useState(1)
    const [countedTurn, setCountedTurn] = useState(turn)

    // handleSwitchTurn can run twice for one move, so the counter follows the actual change of player.
    if (turn !== countedTurn) {
        setCountedTurn(turn)
        setTurnNumber(n => n + 1)
    }

    const pushMove = useCallback((color: PlayerColor, text: string) => {
        const id = nextMoveId.current++
        setMoves(list => [{id, color, text}, ...list].slice(0, 4))
    }, [])

    const logMove = useCallback((before: PiecesSnapshot, color: PlayerColor, value: number) => {
        pushMove(color, describeMove(before, snapshotPieces(playerColors), color, value, colorPlayer))
    }, [pushMove, colorPlayer])

    const displayToast = useCallback((title: string, message : string, duration : number, type : "success" | "danger" | "default") => {
        pushToast({title: title, content : message, duration : 1.8, type : type})
        return setInterval(() => {
            pushToast({title: title, content : message, duration : 1.8, type : type})
        }, duration * 1000)
    }, [pushToast])
    const handleDiceRoll = (value: number) => {
        setForwardBot(c => c + 1)
        setDiceValue(value)
        setLastRoll(value)
        setSkipped(false)
        const before = snapshotPieces(playerColors)
        if (preGame) {
            if (value === 6) {
                setPreGame(false)
                if (turn === colorPlayer)
                    setCanRollDice(false)
                if (turn !== colorPlayer) {
                    if (gameBoardRef.current) {
                        moveForwardPieceBot(gameBoardRef.current as HTMLElement, value, turn, handleSwitchTurn, handleColorWin)
                        logMove(before, turn, value)
                        setDiceValue(-1)
                    }
                    return
                }
            }
            else {
                pushMove(turn, `${playerName(turn, colorPlayer)} ${turn === colorPlayer ? "faites" : "fait"} ${value}`)
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
                    logMove(before, turn, value)
                    setDiceValue(-1)
                }
            }
            if (!isPieceOut(turn) && value === 6 && turn === colorPlayer)
                setCanRollDice(false)
            if (gameBoardRef.current && switchPlayer(gameBoardRef.current as HTMLElement, turn, value)) {
                if (turn === colorPlayer) {
                    logMove(before, turn, value)
                    setSkipped(true)
                }
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
                idDisplayToast = displayToast("Super", "C'est à vous de jouer, cliquez sur « Lancer le dé » pour avancer !", 10, "success")
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
                    const before = snapshotPieces(playerColors)
                    if (moveForwardPiece(gameBoard as HTMLElement, diceValue, indexPlayerColor, turn as PlayerColor, handleSwitchTurn, handleError, error, handleColorWin) !== -1) {
                        logMove(before, turn, diceValue)
                        setCanRollDice(true)
                        setDiceValue(-1)
                    }
                }
            }
        };

        if (turn === colorPlayer) {
            playerColors[turn].listDomPieces.forEach((piece) => {
                if (piece) {
                    const index = parseInt(piece.id.split("-")[2])
                    const movable = diceValue !== -1 && canMovePiece(gameBoard as HTMLElement, diceValue, index, turn)
                    piece.addEventListener('click', handleClick);
                    piece.classList.toggle("pawn--movable", movable)
                    piece.setAttribute("aria-disabled", String(!movable))
                }

            })
        }

        return () => {
            if (turn === colorPlayer) {
                playerColors[turn].listDomPieces.forEach((piece) => {
                    if (piece) {
                        piece.removeEventListener('click', handleClick);
                        piece.classList.remove("pawn--movable")
                        piece.setAttribute("aria-disabled", "true")
                    }
                })
            }
        };
    }, [diceValue, turn, forwardBot]);

    return (
        <div className="game-layout">
            <section className="board-card" aria-label="Plateau de jeu">
                <div className="board" ref={gameBoardRef}>
                    {GameBoard.map((color, index) => <Cell color={color} id={`${index}`} key={`${index}`}
                                                           pushListDomPieces={pushListDomPieces} colorPlayer={colorPlayer}/>)}
                </div>
            </section>
            <GamePanel colorPlayer={colorPlayer} colorStart={colorStart} turn={turn} turnNumber={turnNumber} diceValue={diceValue} skipped={skipped} moves={moves}
                       dice={{onDiceRoll: handleDiceRoll, canRoll: canRollDice, handleError, botRollDice, playerColor: turn, mainColor: colorPlayer, preGame, count, lastRoll}}/>
        </div>
    )
}
