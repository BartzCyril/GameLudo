'use client'

import {Board} from "@/components/Board";
import {useCallback, useEffect, useRef, useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {
    canMovePiece,
    canRetryRollDice,
    isLastTry,
    isPieceOut,
    moveForwardPiece,
    playerColors,
    switchPlayer
} from "@/game/functions";
import {moveForwardPieceBot} from "@/game/bot/functions";
import {CornerBadges} from "@/components/CornerBadges";
import {Die3DHandle} from "@/components/Die3D";
import {BoardBar} from "@/components/board/BoardBar";
import {BoardDie} from "@/components/board/BoardDie";
import {RestartButton} from "@/components/board/RestartButton";
import {WinOverlay} from "@/components/board/WinOverlay";
import {describeMove, HistoryEntry, moveText, MoveText, PiecesSnapshot, readMove, snapshotPieces} from "@/game/history";
import {BOT_DELAYS, gameRules, nextSeat, rollFace, Settings} from "@/game/settings";
import {motion, useWait} from "@/game/ui/motion";
import {displayColor, playerName} from "@/game/ui/players";
import {usePawnAnimator} from "@/game/ui/usePawnAnimator";
import {BoardSave, nextHistoryId, snapshotBoard} from "@/game/save";
import {useI18n} from "@/i18n/I18nProvider";
import type {Translator} from "@/i18n/translate";

type Move = (onSwitch: () => void, onWin: (color: PlayerColor) => void) => unknown

type GameBoardProps = {
    colorPlayer: PlayerColor,
    colorStart: PlayerColor,
    colorWin: PlayerColor | null,
    settings: Settings,
    seats: PlayerColor[],
    handleColorWin : (color: PlayerColor) => void,
    initial?: BoardSave | null,
    onChange: (board: BoardSave) => void,
    onRestart: () => void
}

type MessageState = { colorPlayer: PlayerColor, turn: PlayerColor, diceValue: number, busy: boolean, preGame: boolean, count: number, maxTries: number }

// What the bar says. The human is told what to do; during a bot's turn, who is playing.
function getMessage({t, tp}: Translator, {colorPlayer, turn, diceValue, busy, preGame, count, maxTries}: MessageState): string {
    if (turn !== colorPlayer)
        return t("game.botTitle", {name: playerName(t, turn, colorPlayer)});
    if (busy)
        return t("game.messages.moving");
    if (diceValue === 6)
        return playerColors[turn].pieces.every(piece => piece.out)
            ? t("game.messages.sixAllOut")
            : t("game.messages.sixRelease");
    if (diceValue !== -1)
        return tp("game.messages.choosePawn", diceValue);
    if (preGame)
        return tp("game.messages.preGameTries", maxTries + 1 - count);
    return t("game.messages.clickDie");
}


export function GameBoard({colorPlayer, colorStart, colorWin, settings, seats, handleColorWin, initial, onChange, onRestart}: GameBoardProps) {
    const i18n = useI18n()
    const {t} = i18n
    const wait = useWait()
    const rules = gameRules(settings)
    const delays = BOT_DELAYS[settings.speed]
    const [diceValue, setDiceValue] = useState(initial?.diceValue ?? -1);
    const [turn, setTurn] = useState<PlayerColor>(initial?.turn ?? colorStart)
    const [preGame, setPreGame] = useState(initial?.preGame ?? true)
    const [count, setCount] = useState(initial?.count ?? 1)
    const [canRollDice, setCanRollDice] = useState(initial?.canRollDice ?? true)
    // Rerenders after every roll: a bot that could not move rolls again from that render.
    const [, setForwardBot] = useState(0)
    const [busy, setBusy] = useState(false)
    const {layerRef, cardRef, animateMove} = usePawnAnimator()
    const botRollDice = turn !== colorPlayer && !busy && !colorWin
    const [lastRoll, setLastRoll] = useState<number | null>(initial?.lastRoll ?? null)
    const [skipped, setSkipped] = useState(initial?.skipped ?? false)
    const [moves, setMoves] = useState<HistoryEntry[]>(initial?.moves ?? [])
    const nextMoveId = useRef(initial ? nextHistoryId(initial.moves) : 0)
    const [turnNumber, setTurnNumber] = useState(initial?.turnNumber ?? 1)

    // Save at every step. During an animation the pieces are ahead of this state, playMove has saved the end of the move instead.
    // A ref, not busy: an effect still pending from the previous render must not overwrite that save.
    const animating = useRef(false)
    useEffect(() => {
        if (!animating.current)
            onChange(snapshotBoard({turn, diceValue, preGame, count, canRollDice, lastRoll, skipped, moves, turnNumber}))
    }, [busy, onChange, turn, diceValue, preGame, count, canRollDice, lastRoll, skipped, moves, turnNumber]);

    const pushMove = useCallback((color: PlayerColor, move: MoveText) => {
        const id = nextMoveId.current++
        setMoves(list => [{id, color, ...move}, ...list].slice(0, 4))
    }, [])

    const logMove = useCallback((before: PiecesSnapshot, color: PlayerColor, value: number) => {
        pushMove(color, describeMove(before, snapshotPieces(playerColors), color, value))
    }, [pushMove])

    // The rules settle the move at once; the turn only changes hands when the animation is over.
    const playMove = async (value: number, move: Move) => {
        const before = snapshotPieces(playerColors)
        const outcome = {switched: false, winner: null as PlayerColor | null}
        const result = move(() => outcome.switched = true, color => outcome.winner = color)
        if (result === -1)
            return
        const after = snapshotPieces(playerColors)
        const read = readMove(before, after, turn)
        const described = describeMove(before, after, turn, value)
        if (read) {
            animating.current = true
            // A reload in mid-animation resumes after the move. A winning move stays unsaved: the game ends once it has played.
            if (!outcome.winner) {
                const nextTurn = outcome.switched ? nextSeat(turn, seats) : turn
                onChange(snapshotBoard({
                    turn: nextTurn, diceValue: -1, preGame: false, count, canRollDice: true, lastRoll: value, skipped: false,
                    moves: [{id: nextMoveId.current, color: turn, ...described}, ...moves],
                    turnNumber: nextTurn === turn ? turnNumber : turnNumber + 1
                }))
            }
            setBusy(true)
            await animateMove(turn, read)
            animating.current = false
            setBusy(false)
        }
        pushMove(turn, described)
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
                    playMove(value, (onSwitch, onWin) => moveForwardPieceBot(value, turn, onSwitch, onWin, rules))
            }
            else {
                pushMove(turn, {key: "roll", vars: {value}})
                setDiceValue(-1)
                setCount(c => c + 1)
                if (isLastTry(count, rules)) {
                    setCount(1)
                    handleSwitchTurn()
                }
            }
        } else if (turn !== colorPlayer) {
            playMove(value, (onSwitch, onWin) => {
                moveForwardPieceBot(value, turn, onSwitch, onWin, rules)
                if (switchPlayer(turn, value, rules))
                    onSwitch()
            })
        } else {
            if (!isPieceOut(turn) && value === 6)
                setCanRollDice(false)
            if (switchPlayer(turn, value, rules)) {
                logMove(snapshotPieces(playerColors), turn, value)
                setSkipped(true)
                handleSwitchTurn()
                setDiceValue(-1)
            } else {
                setCanRollDice(value === 6 && canRetryRollDice(turn, value, rules) && isPieceOut(turn))
            }
        }
    }

    const handleSwitchTurn = useCallback(() => {
        setTurn(nextSeat(turn, seats));
        setTurnNumber(n => n + 1)
    }, [turn, seats])

    const handlePawnClick = (index: number) =>
        playMove(diceValue, (onSwitch, onWin) => moveForwardPiece(diceValue, index, turn, onSwitch, onWin, rules))

    const movable = turn === colorPlayer && diceValue !== -1 && !busy
        ? playerColors[turn].pieces.map((_, index) => index).filter(index => canMovePiece(diceValue, index, turn, rules))
        : []

    // The die, rolled by the human's click or by a bot's timer.
    const die = useRef<Die3DHandle>(null)
    const rolling = useRef(false)
    const [isRolling, setIsRolling] = useState(false)
    const rollTheDie = async () => {
        if (rolling.current)
            return
        rolling.current = true
        setIsRolling(true)
        const value = rollFace(settings.dice)
        await die.current?.roll(value)
        // Pause on a bot's roll so the player can read the die before the pawn moves.
        if (turn !== colorPlayer)
            await wait(Math.max(motion().pop, delays.afterRoll))
        rolling.current = false
        setIsRolling(false)
        handleDiceRoll(value)
    }

    // A bot rolls some time after its turn begins (settings.speed), and again after every roll that leaves it the turn.
    // Rerun on every render (rollTheDie is new each time), as the old <Dice> did: setForwardBot relies on it.
    useEffect(() => {
        if (!botRollDice)
            return
        const timeout = setTimeout(rollTheDie, delays.roll)
        return () => clearTimeout(timeout)
    })

    const canClick = turn === colorPlayer && canRollDice && !busy && !isRolling && !colorWin
    const last = moves[0]

    return (
        <Board human={colorPlayer} seats={seats} movable={movable} onPawnClick={handlePawnClick} cardRef={cardRef} layerRef={layerRef}
                   bar={<BoardBar chip={t("game.chip", {n: turnNumber})} tint={displayColor[colorWin ?? turn]} settings={settings}
                                  message={colorWin ? t("game.win.label") : isRolling ? t("die.rollingMessage") : getMessage(i18n, {colorPlayer, turn, diceValue, busy, preGame, count, maxTries: rules.maxTries})}
                                  detail={last && !colorWin ? moveText(i18n, last, colorPlayer) : undefined}
                                  action={<RestartButton label={t("game.restart.button")} onConfirm={onRestart}/>}/>}
                   overlay={<CornerBadges human={colorPlayer} seats={seats} turn={colorWin ? null : turn}/>}
                   front={colorWin
                       ? <WinOverlay winner={colorWin} human={colorPlayer} onRestart={onRestart}/>
                       : <BoardDie dieRef={die} color={turn} value={lastRoll} clickable={canClick} onRoll={rollTheDie}/>}/>
    )
}
