'use client'

import {ReactNode, useCallback, useEffect, useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {Board} from "@/components/Board";
import {DrawBoard} from "@/components/DrawBoard";
import {GameBoard} from "@/components/GameBoard";
import {BoardBar} from "@/components/board/BoardBar";
import {ColorPicker} from "@/components/board/ColorPicker";
import {PlayButton} from "@/components/board/PlayButton";
import {RestartButton} from "@/components/board/RestartButton";
import {setupPlayers} from "@/game/functions";
import {DrawState, newDraw} from "@/game/draw";
import {applyPieces, BoardSave, clearGame, loadGame, SavedGame, saveGame, SAVE_VERSION} from "@/game/save";
import {activeSeats, DEFAULT_SETTINGS, freeSeatStyle, loadSettings, Settings} from "@/game/settings";
import {displayColor, TURN_ORDER} from "@/game/ui/players";
import {useI18n} from "@/i18n/I18nProvider";
import type {Translator} from "@/i18n/translate";

type Phase = "idle" | "color" | "draw" | "playing"

function resumeSummary({t, formatDate}: Translator, saved: SavedGame) {
    const date = formatDate(new Date(saved.savedAt), {day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"})
    return [
        saved.phase === "playing" ? t("resume.turn", {n: saved.board.turnNumber}) : t("resume.drawPhase"),
        t("resume.savedAt", {date}),
    ].join(t("resume.separator"))
}

type GameProps = {
    // Ad columns, placed by the CSS at least 150 px from the board (and only when the screen is wide enough).
    rails?: { left?: ReactNode, right?: ReactNode }
}

export function Game({rails}: GameProps) {
    const i18n = useI18n()
    const {t} = i18n
    const [phase, setPhase] = useState<Phase>("idle")
    const [color, setColor] = useState<PlayerColor | null>(null)
    const [colorWin, setColorWin] = useState<PlayerColor | null>(null)
    const [draw, setDraw] = useState<DrawState>(() => newDraw(TURN_ORDER))
    const [saved, setSaved] = useState<SavedGame | null>(null)
    const [boardInit, setBoardInit] = useState<BoardSave | null>(null)
    // A game keeps the settings it started with: read at Play, or from its save, never in between.
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
    const [seats, setSeats] = useState<PlayerColor[]>(TURN_ORDER)


    // localStorage only exists in the browser: read it after the first render (no hydration mismatch).
    useEffect(() => {
        const game = loadGame()
        const current = game?.settings ?? loadSettings()
        const players = game?.seats ?? TURN_ORDER
        setupPlayers(players, current.pawns)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSaved(game)
        setSettings(current)
        setSeats(players)
    }, []);

    // Save the draw at every roll. This is also what replaces an old save, once a color is picked.
    useEffect(() => {
        if (phase === "draw" && color)
            saveGame({version: SAVE_VERSION, savedAt: new Date().toISOString(), phase: "draw", color, draw, settings, seats})
    }, [phase, color, draw, settings, seats]);

    // A finished game is not resumable.
    useEffect(() => {
        if (colorWin)
            clearGame()
    }, [colorWin]);

    const handleBoardChange = useCallback((board: BoardSave) => {
        if (color && !colorWin)
            saveGame({version: SAVE_VERSION, savedAt: new Date().toISOString(), phase: "playing", color, draw, board, settings, seats})
    }, [color, colorWin, draw, settings, seats])

    const prepareGame = () => {
        const current = loadSettings()
        setSettings(current)
        setSeats(TURN_ORDER)
        setupPlayers(TURN_ORDER, current.pawns)
        setPhase("color")
    }

    // The old save stays until a color is picked: a misclick on "new game" only costs a reload.
    const handleStart = () => {
        setSaved(null)
        prepareGame()
    }

    const handleResume = () => {
        if (!saved)
            return
        setupPlayers(saved.seats, saved.settings.pawns)
        setColor(saved.color)
        setDraw(saved.draw)
        if (saved.phase === "playing") {
            applyPieces(saved.board)
            setBoardInit(saved.board)
        }
        setSaved(null)
        setPhase(saved.phase)
    }

    const handleColor = (color: PlayerColor) => {
        const players = activeSeats(settings.players, color)
        setupPlayers(players, settings.pawns)
        setSeats(players)
        setColor(color)
        setDraw(newDraw(players))
        setPhase("draw")
    }

    const handleDrawStart = useCallback(() => setPhase("playing"), [])

    // After a win and from the restart icon.
    const handleRestart = () => {
        clearGame()
        setColor(null)
        setColorWin(null)
        setBoardInit(null)
        prepareGame()
    }

    let content
    if (phase === "playing") {
        content = <GameBoard colorStart={draw.winner as PlayerColor} colorPlayer={color as PlayerColor} colorWin={colorWin} settings={settings} seats={seats} handleColorWin={setColorWin}
                             initial={boardInit} onChange={handleBoardChange} onRestart={handleRestart}/>
    } else if (phase === "draw") {
        content = <DrawBoard draw={draw} human={color as PlayerColor} settings={settings} seats={seats} onChange={setDraw} onStart={handleDrawStart} onRestart={handleRestart}/>
    } else if (phase === "color") {
        content = <Board bar={<BoardBar message={t("prepare.pickCorner")} settings={settings}/>} front={<ColorPicker onPick={handleColor}/>}/>
    } else {
        // A saved game: the play button resumes it, the restart icon starts a new one.
        content = (
            <Board intro seats={seats}
                   bar={<BoardBar message={saved ? resumeSummary(i18n, saved) : t("prepare.ready")} tint={saved ? displayColor[saved.color] : undefined} settings={settings}
                                  action={saved && <RestartButton label={t("resume.newGame")} onConfirm={handleStart}/>}/>}
                   front={<PlayButton label={saved ? t("resume.resume") : t("prepare.play")} onPlay={saved ? handleResume : handleStart}/>}/>
        )
    }

    return (
        <>
            <h1 className="h1 h1--game">{t("home.h1Before")}<span className="ludo-highlight">{t("home.h1Highlight")}</span>{t("home.h1After")}</h1>
            <div className="board-stage" style={freeSeatStyle(seats)}>
                {rails?.left}
                {content}
                {rails?.right}
            </div>
        </>
    )
}
