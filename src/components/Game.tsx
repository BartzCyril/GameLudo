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
import {resetPlayerColors} from "@/game/functions";
import {DrawState, newDraw} from "@/game/draw";
import {applyPieces, BoardSave, clearGame, loadGame, SavedGame, saveGame, SAVE_VERSION} from "@/game/save";
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

    // localStorage only exists in the browser: read it after the first render (no hydration mismatch).
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSaved(loadGame())
    }, []);

    // Save the draw at every roll. This is also what replaces an old save, once a color is picked.
    useEffect(() => {
        if (phase === "draw" && color)
            saveGame({version: SAVE_VERSION, savedAt: new Date().toISOString(), phase: "draw", color, draw})
    }, [phase, color, draw]);

    // A finished game is not resumable.
    useEffect(() => {
        if (colorWin)
            clearGame()
    }, [colorWin]);

    const handleBoardChange = useCallback((board: BoardSave) => {
        if (color && !colorWin)
            saveGame({version: SAVE_VERSION, savedAt: new Date().toISOString(), phase: "playing", color, draw, board})
    }, [color, colorWin, draw])

    // The old save stays until a color is picked: a misclick on "new game" only costs a reload.
    const handleStart = () => {
        setSaved(null)
        resetPlayerColors()
        setPhase("color")
    }

    const handleResume = () => {
        if (!saved)
            return
        resetPlayerColors()
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
        setColor(color)
        setDraw(newDraw(TURN_ORDER))
        setPhase("draw")
    }

    const handleDrawStart = useCallback(() => setPhase("playing"), [])

    // After a win and from the restart icon.
    const handleRestart = () => {
        clearGame()
        resetPlayerColors()
        setColor(null)
        setColorWin(null)
        setBoardInit(null)
        setPhase("color")
    }

    let content
    if (phase === "playing") {
        content = <GameBoard colorStart={draw.winner as PlayerColor} colorPlayer={color as PlayerColor} colorWin={colorWin} handleColorWin={setColorWin}
                             initial={boardInit} onChange={handleBoardChange} onRestart={handleRestart}/>
    } else if (phase === "draw") {
        content = <DrawBoard draw={draw} human={color as PlayerColor} onChange={setDraw} onStart={handleDrawStart} onRestart={handleRestart}/>
    } else if (phase === "color") {
        content = <Board bar={<BoardBar message={t("prepare.pickCorner")}/>} front={<ColorPicker onPick={handleColor}/>}/>
    } else {
        // A saved game: the play button resumes it, the restart icon starts a new one.
        content = (
            <Board intro
                   bar={<BoardBar message={saved ? resumeSummary(i18n, saved) : t("prepare.ready")} tint={saved ? displayColor[saved.color] : undefined}
                                  action={saved && <RestartButton label={t("resume.newGame")} onConfirm={handleStart}/>}/>}
                   front={<PlayButton label={saved ? t("resume.resume") : t("prepare.play")} onPlay={saved ? handleResume : handleStart}/>}/>
        )
    }

    return (
        <>
            <h1 className="h1 h1--game">{t("home.h1Before")}<span className="ludo-highlight">{t("home.h1Highlight")}</span>{t("home.h1After")}</h1>
            <div className="board-stage">
                {rails?.left}
                {content}
                {rails?.right}
            </div>
        </>
    )
}
