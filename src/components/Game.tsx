'use client'

import {useEffect, useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {Button} from "@/components/Button";
import {ColorSelector} from "@/components/ColorSelector";
import {DrawPanel} from "@/components/DrawPanel";
import {PreGameBoard} from "@/components/PreGameBoard";
import {GameBoard} from "@/components/GameBoard";
import {BotIcon, DiceIcon, PersonIcon} from "@/components/Icons";
import {TurnCard} from "@/components/TurnCard";
import {useToasts} from "@/components/ToastContext";
import {resetPlayerColors} from "@/game/functions";
import {DrawState, newDraw} from "@/game/draw";
import {colorLabel, displayColor, playerName, TURN_ORDER} from "@/game/ui/players";

type Phase = "idle" | "color" | "draw" | "playing"

export function Game() {
    const [phase, setPhase] = useState<Phase>("idle")
    const [color, setColor] = useState<PlayerColor | null>(null)
    const [colorWin, setColorWin] = useState<PlayerColor | null>(null)
    const [draw, setDraw] = useState<DrawState>(() => newDraw(TURN_ORDER))
    const {pushToast} = useToasts();

    useEffect(() => {
        if (phase !== "color")
            return
        const toast = { title: "Choisissez votre couleur", content: "Cliquez sur une couleur pour la jouer !", duration: 1.8 }
        pushToast(toast)
        const intervalId = setInterval(() => pushToast(toast), 8000)
        return () => clearInterval(intervalId)
    }, [phase, pushToast]);

    const handleStart = () => {
        resetPlayerColors()
        setPhase("color")
    }

    const handleColor = (color: PlayerColor) => {
        setColor(color)
        setDraw(newDraw(TURN_ORDER))
        setPhase("draw")
    }

    const handleRestart = () => {
        resetPlayerColors()
        setColor(null)
        setColorWin(null)
        setPhase("idle")
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
        content = <GameBoard colorStart={draw.winner as PlayerColor} colorPlayer={color as PlayerColor} handleColorWin={setColorWin}/>
    } else {
        content = (
            <div className="game-layout">
                <PreGameBoard/>
                {phase === "draw"
                    ? <DrawPanel draw={draw} human={color as PlayerColor} onChange={setDraw} onReset={() => setDraw(newDraw(TURN_ORDER))} onStart={() => setPhase("playing")}/>
                    : <aside className="game-panel" aria-label="Préparation de la partie">
                        <TurnCard avatarClass="avatar--accent" icon={<DiceIcon size={24}/>} label="Avant la partie"
                                  name={phase === "idle" ? "Prêt à jouer ?" : "Votre couleur"}>
                            {phase === "idle"
                                ? <Button variant="roll" onClick={handleStart}>Jouer</Button>
                                : <ColorSelector handleColor={handleColor}/>}
                        </TurnCard>
                    </aside>}
            </div>
        )
    }

    return (
        <>
            <div className="game-head">
                <div className="game-head__title">
                    <p className="eyebrow">Le jeu des petits chevaux en ligne</p>
                    <h1 className="h1 h1--game">Jouez au <span className="ludo-highlight">Ludo</span>, c&apos;est gratuit !</h1>
                </div>
                <p className={`game-head__meta ${color ? `game-head__meta--${displayColor[color]}` : ""}`}>
                    Partie contre 3 bots{color && <> · Vous jouez les <strong>{colorLabel[color].plural}</strong></>}
                </p>
            </div>
            {content}
        </>
    )
}
