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
import {colorLabel, displayColor, playerName, TURN_ORDER} from "@/game/ui/players";

type Phase = "idle" | "color" | "draw" | "playing"

const savedAtFormat = new Intl.DateTimeFormat("fr-FR", {day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"})

function resumeSummary(saved: SavedGame) {
    const parts = [`Vous jouez les ${colorLabel[saved.color].plural}`]
    parts.push(saved.phase === "playing" ? `tour ${saved.board.turnNumber}` : "tirage du premier joueur")
    parts.push(`sauvegardée le ${savedAtFormat.format(new Date(saved.savedAt))}`)
    return parts.join(" · ")
}

export function Game() {
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

    // The old save stays until a color is picked: a misclick on « Nouvelle partie » only costs a reload.
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

    // After a win (« Recommencer une partie ») and from the panel (« Recommencer la partie »).
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
                      label="Bravo !" name={colorWin === color ? "Vous avez gagné" : `${playerName(colorWin, color)} a gagné`}>
                <Button variant="roll" onClick={handleRestart}>Recommencer une partie</Button>
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
                    : <aside className="game-panel" aria-label="Préparation de la partie">
                        {phase === "idle" && saved
                            ? <TurnCard avatarClass={`avatar--${displayColor[saved.color]}`} icon={<PersonIcon size={24}/>} label="Partie en cours" name="Reprendre la partie ?">
                                <p className="resume-note">{resumeSummary(saved)}</p>
                                <Button variant="roll" onClick={handleResume}>Reprendre la partie</Button>
                                <Button variant="secondary" onClick={handleStart}>Nouvelle partie</Button>
                            </TurnCard>
                            : <TurnCard avatarClass="avatar--accent" icon={<DiceIcon size={24}/>} label="Avant la partie"
                                        name={phase === "idle" ? "Prêt à jouer ?" : "Votre couleur"}>
                                {phase === "idle"
                                    ? <Button variant="roll" onClick={handleStart}>Jouer</Button>
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
                    <h1 className="h1 h1--game">Jouez au <span className="ludo-highlight">Ludo</span>, c&apos;est gratuit !</h1>
                </div>
                <p className={`game-head__meta ${color ? `game-head__meta--${displayColor[color]}` : ""}`}>
                    {color && <>Vous jouez les <strong>{colorLabel[color].plural}</strong></>}
                </p>
            </div>
            {content}
        </>
    )
}
