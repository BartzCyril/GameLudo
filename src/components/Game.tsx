'use client'

import {useCallback, useEffect, useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {Button} from "@/components/Button";
import {ColorSelector} from "@/components/ColorSelector";
import {DrawPanel} from "@/components/DrawPanel";
import {Board} from "@/components/Board";
import {GameBoard} from "@/components/GameBoard";
import {BotIcon, DiceIcon, PersonIcon} from "@/components/Icons";
import {TurnCard} from "@/components/TurnCard";
import {resetPlayerColors} from "@/game/functions";
import {DrawState, newDraw} from "@/game/draw";
import {applyPieces, BoardSave, clearGame, loadGame, SavedGame, saveGame, SAVE_VERSION} from "@/game/save";
import {displayColor, playerName, TURN_ORDER} from "@/game/ui/players";
import {useI18n} from "@/i18n/I18nProvider";
import type {Translator} from "@/i18n/translate";

type Phase = "idle" | "color" | "draw" | "playing"

function resumeSummary({t, formatDate}: Translator, saved: SavedGame) {
    const date = formatDate(new Date(saved.savedAt), {day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"})
    return [
        t(`colors.${saved.color}.youPlay`),
        saved.phase === "playing" ? t("resume.turn", {n: saved.board.turnNumber}) : t("resume.drawPhase"),
        t("resume.savedAt", {date}),
    ].join(t("resume.separator"))
}

export function Game() {
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
        if (color)
            saveGame({version: SAVE_VERSION, savedAt: new Date().toISOString(), phase: "playing", color, draw, board})
    }, [color, draw])

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

    // After a win and from the panel.
    const handleRestart = () => {
        clearGame()
        resetPlayerColors()
        setColor(null)
        setColorWin(null)
        setBoardInit(null)
        setPhase("color")
    }

    let content
    if (colorWin !== null) {
        const tint = displayColor[colorWin]
        content = (
            <TurnCard className="win-card" avatarClass={`avatar--${tint}`} icon={colorWin === color ? <PersonIcon size={24}/> : <BotIcon size={24}/>}
                      label={t("game.win.label")} name={colorWin === color ? t("game.win.you") : t("game.win.bot", {name: playerName(t, colorWin, color)})}>
                <Button variant="roll" onClick={handleRestart}>{t("game.win.restart")}</Button>
            </TurnCard>
        )
    } else if (phase === "playing") {
        content = <GameBoard colorStart={draw.winner as PlayerColor} colorPlayer={color as PlayerColor} handleColorWin={setColorWin}
                             initial={boardInit} onChange={handleBoardChange} onRestart={handleRestart}/>
    } else {
        content = (
            <div className="game-layout">
                <Board intro/>
                {phase === "draw"
                    ? <DrawPanel draw={draw} human={color as PlayerColor} onChange={setDraw} onReset={() => setDraw(newDraw(TURN_ORDER))}
                                 onStart={() => setPhase("playing")} onRestart={handleRestart}/>
                    : <aside className="game-panel" aria-label={t("prepare.regionLabel")}>
                        {phase === "idle" && saved
                            ? <TurnCard avatarClass={`avatar--${displayColor[saved.color]}`} icon={<PersonIcon size={24}/>} label={t("resume.label")} name={t("resume.title")}>
                                <p className="resume-note">{resumeSummary(i18n, saved)}</p>
                                <Button variant="roll" onClick={handleResume}>{t("resume.resume")}</Button>
                                <Button variant="secondary" onClick={handleStart}>{t("resume.newGame")}</Button>
                            </TurnCard>
                            : <TurnCard avatarClass="avatar--accent" icon={<DiceIcon size={24}/>} label={t("prepare.label")}
                                        name={phase === "idle" ? t("prepare.ready") : t("prepare.chooseColor")}>
                                {phase === "idle"
                                    ? <Button variant="roll" onClick={handleStart}>{t("prepare.play")}</Button>
                                    : <ColorSelector handleColor={handleColor}/>}
                            </TurnCard>}
                    </aside>}
            </div>
        )
    }

    return (
        <>
            <div className="game-head">
                <div className="game-head__title">
                    <p className="eyebrow">{t("home.eyebrow")}</p>
                    <h1 className="h1 h1--game">{t("home.h1Before")}<span className="ludo-highlight">{t("home.h1Highlight")}</span>{t("home.h1After")}</h1>
                    <p className="lead">{t("home.intro")}</p>
                </div>
                <p className={`game-head__meta ${color ? `game-head__meta--${displayColor[color]}` : ""}`}>
                    {color && <strong>{t(`colors.${color}.youPlay`)}</strong>}
                </p>
            </div>
            {content}
        </>
    )
}
