'use client'

import {Board} from "@/components/Board";
import {useCallback, useEffect, useRef, useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {ErrorMessage} from "@/type/ErrorMessage";
import {
    canMovePiece,
    canRetryRollDice,
    isPieceOut,
    moveForwardPiece,
    playerColors,
    switchPlayer,
    switchTurn
} from "@/game/functions";
import {moveForwardPieceBot} from "@/game/bot/functions";
import {GamePanel} from "@/components/GamePanel";
import {HistoryEntry} from "@/components/MoveHistory";
import {describeMove, PiecesSnapshot, readMove, snapshotPieces} from "@/game/history";
import {playerName} from "@/game/ui/players";
import {usePawnAnimator} from "@/game/ui/usePawnAnimator";
import {useToasts} from "@/components/ToastContext";
import {BoardSave, nextHistoryId, snapshotBoard} from "@/game/save";

type Move = (onSwitch: () => void, onWin: (color: PlayerColor) => void) => unknown

type GameBoardProps = {
    colorPlayer: PlayerColor,
    colorStart: PlayerColor,
    handleColorWin : (color: PlayerColor) => void,
    initial?: BoardSave | null,
    onChange: (board: BoardSave) => void,
    onRestart: () => void
}


export function GameBoard({colorPlayer, colorStart, handleColorWin, initial, onChange, onRestart}: GameBoardProps) {
    const [diceValue, setDiceValue] = useState(initial?.diceValue ?? -1);
    const [turn, setTurn] = useState<PlayerColor>(initial?.turn ?? colorStart)
    const [error, setError] = useState<ErrorMessage | null>(null)
    const [preGame, setPreGame] = useState(initial?.preGame ?? true)
    const [count, setCount] = useState(initial?.count ?? 1)
    const [canRollDice, setCanRollDice] = useState(initial?.canRollDice ?? true)
    // Rerenders after every roll: a bot that could not move rolls again from that render.
    const [, setForwardBot] = useState(0)
    const {pushToast} = useToasts();
    const [busy, setBusy] = useState(false)
    const {layerRef, cardRef, animateMove} = usePawnAnimator()
    const botRollDice = turn !== colorPlayer && !busy
    const [lastRoll, setLastRoll] = useState<number | null>(initial?.lastRoll ?? null)
    const [skipped, setSkipped] = useState(initial?.skipped ?? false)
    const [moves, setMoves] = useState<HistoryEntry[]>(initial?.moves ?? [])
    const nextMoveId = useRef(initial ? nextHistoryId(initial.moves) : 0)
    const [turnNumber, setTurnNumber] = useState(initial?.turnNumber ?? 1)
    const [countedTurn, setCountedTurn] = useState(turn)

    // handleSwitchTurn can run twice for one move, so the counter follows the actual change of player.
    if (turn !== countedTurn) {
        setCountedTurn(turn)
        setTurnNumber(n => n + 1)
    }

    // Save at every step. During an animation the pieces are ahead of this state, playMove has saved the end of the move instead.
    // A ref, not busy: an effect still pending from the previous render must not overwrite that save.
    const animating = useRef(false)
    useEffect(() => {
        if (!animating.current)
            onChange(snapshotBoard({turn, diceValue, preGame, count, canRollDice, lastRoll, skipped, moves, turnNumber}))
    }, [busy, onChange, turn, diceValue, preGame, count, canRollDice, lastRoll, skipped, moves, turnNumber]);

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
    // The rules settle the move at once; the turn only changes hands when the animation is over.
    const playMove = async (value: number, move: Move) => {
        const before = snapshotPieces(playerColors)
        const outcome = {switched: false, winner: null as PlayerColor | null}
        const result = move(() => outcome.switched = true, color => outcome.winner = color)
        if (result === -1)
            return
        const after = snapshotPieces(playerColors)
        const read = readMove(before, after, turn)
        const text = describeMove(before, after, turn, value, colorPlayer)
        if (read) {
            animating.current = true
            // A reload in mid-animation resumes after the move. A winning move stays unsaved: the game ends once it has played.
            if (!outcome.winner) {
                const nextTurn = outcome.switched ? switchTurn(turn) : turn
                onChange(snapshotBoard({
                    turn: nextTurn, diceValue: -1, preGame: false, count, canRollDice: true, lastRoll: value, skipped: false,
                    moves: [{id: nextMoveId.current, color: turn, text}, ...moves],
                    turnNumber: nextTurn === turn ? turnNumber : turnNumber + 1
                }))
            }
            setBusy(true)
            await animateMove(turn, read)
            animating.current = false
            setBusy(false)
        }
        pushMove(turn, text)
        setCanRollDice(true)
        setDiceValue(-1)
        if (outcome.winner)
            handleColorWin(outcome.winner)
        if (outcome.switched)
            handleSwitchTurn()
    }

    const handleDiceRoll = (value: number) => {
        setForwardBot(c => c + 1)
        setDiceValue(value)
        setLastRoll(value)
        setSkipped(false)
        if (preGame) {
            if (value === 6) {
                setPreGame(false)
                if (turn === colorPlayer)
                    setCanRollDice(false)
                else
                    playMove(value, (onSwitch, onWin) => moveForwardPieceBot(value, turn, onSwitch, onWin))
            }
            else {
                pushMove(turn, `${playerName(turn, colorPlayer)} ${turn === colorPlayer ? "faites" : "fait"} ${value}`)
                setDiceValue(-1)
                setCount(c => c + 1)
                if (count === 3) {
                    setCount(1)
                    handleSwitchTurn()
                }
            }
        } else if (turn !== colorPlayer) {
            playMove(value, (onSwitch, onWin) => {
                moveForwardPieceBot(value, turn, onSwitch, onWin)
                if (switchPlayer(turn, value))
                    onSwitch()
            })
        } else {
            if (!isPieceOut(turn) && value === 6)
                setCanRollDice(false)
            if (switchPlayer(turn, value)) {
                logMove(snapshotPieces(playerColors), turn, value)
                setSkipped(true)
                handleSwitchTurn()
                setDiceValue(-1)
            } else {
                setCanRollDice(value === 6 && canRetryRollDice(turn, value) && isPieceOut(turn))
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

    const handlePawnClick = (index: number) =>
        playMove(diceValue, (onSwitch, onWin) => moveForwardPiece(diceValue, index, turn, onSwitch, handleError, error, onWin))

    const movable = turn === colorPlayer && diceValue !== -1 && !busy
        ? [0, 1, 2, 3].filter(index => canMovePiece(diceValue, index, turn))
        : []

    return (
        <div className="game-layout">
            <Board human={colorPlayer} movable={movable} onPawnClick={handlePawnClick} cardRef={cardRef} layerRef={layerRef}/>
            <GamePanel colorPlayer={colorPlayer} colorStart={colorStart} turn={turn} turnNumber={turnNumber} diceValue={diceValue} skipped={skipped} moves={moves} busy={busy} onRestart={onRestart}
                       dice={{onDiceRoll: handleDiceRoll, canRoll: canRollDice, handleError, botRollDice, playerColor: turn, mainColor: colorPlayer, preGame, count, lastRoll}}/>
        </div>
    )
}
