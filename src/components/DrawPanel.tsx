'use client'

import {useCallback, useEffect, useRef, useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {currentDrawPlayer, DrawEvent, DrawState, rollDie, rollDraw} from "@/game/draw";
import {joinNames, playerName, TURN_ORDER} from "@/game/ui/players";
import {Button} from "@/components/Button";
import {Die3D, Die3DHandle} from "@/components/Die3D";
import {DiceIcon} from "@/components/Icons";
import {MoveHistory} from "@/components/MoveHistory";
import {PlayerList} from "@/components/PlayerList";
import {RestartGame} from "@/components/RestartGame";
import {TurnCard} from "@/components/TurnCard";

const BOT_ROLL_DELAY = 800

type DrawPanelProps = {
    draw: DrawState,
    human: PlayerColor,
    onChange: (draw: DrawState) => void,
    onReset: () => void,
    onStart: () => void,
    onRestart: () => void
}

function starts(color: PlayerColor, human: PlayerColor) {
    return color === human ? "Vous commencez" : `${playerName(color, human)} commence`;
}

function tiedNames(tied: PlayerColor[], human: PlayerColor) {
    return joinNames(tied.map(color => playerName(color, human)));
}

function historyText(event: DrawEvent, human: PlayerColor) {
    switch (event.type) {
        case "roll":
            return `${playerName(event.color, human)} ${event.color === human ? "faites" : "fait"} ${event.value}`;
        case "tie":
            return `Égalité sur le ${event.max} : ${tiedNames(event.tied, human)} relancent`;
        case "win":
            return `${starts(event.winner, human)} la partie`;
    }
}

function historyColor(event: DrawEvent) {
    switch (event.type) {
        case "roll":
            return event.color;
        case "tie":
            return event.tied[0];
        case "win":
            return event.winner;
    }
}

function getMessage(draw: DrawState, human: PlayerColor) {
    const last = draw.events.at(-1);
    const next = currentDrawPlayer(draw);
    if (last?.type === "win")
        return `${starts(last.winner, human)} la partie avec un ${last.max} !`;
    if (last?.type === "tie")
        return `Égalité sur le ${last.max} entre ${tiedNames(last.tied, human)} : ${last.tied.length > 2 ? "ils relancent." : "ils relancent tous les deux."}`;
    if (!last)
        return "Chaque joueur lance le dé une fois : le plus grand nombre commence.";
    return next === human ? "À vous de lancer le dé." : `${playerName(next as PlayerColor, human)} lance le dé…`;
}

function getStatus(draw: DrawState, color: PlayerColor, human: PlayerColor, current: PlayerColor | null) {
    if (color === draw.winner)
        return "Commence la partie";
    if (draw.out[color] !== undefined)
        return "Hors course";
    if (draw.rolls[color] !== undefined)
        return `A fait ${draw.rolls[color]}`;
    if (color === current)
        return color === human ? "À vous de lancer" : "Lance le dé…";
    return draw.round > 1 ? "À égalité · doit relancer" : "Doit lancer";
}

export function DrawPanel({draw, human, onChange, onReset, onStart, onRestart}: DrawPanelProps) {
    const current = currentDrawPlayer(draw);
    const rolls = draw.events.filter(event => event.type === "roll");
    const lastRoll = rolls.at(-1)?.value ?? null;
    const die = useRef<Die3DHandle>(null);
    const [rolling, setRolling] = useState(false);
    const [resets, setResets] = useState(0);

    // The draw only learns the result once the die has landed, so nothing gives it away early.
    const roll = useCallback(async () => {
        const value = rollDie();
        setRolling(true);
        await die.current?.roll(value);
        setRolling(false);
        onChange(rollDraw(draw, () => value));
    }, [draw, onChange]);

    useEffect(() => {
        if (!current || current === human || rolling)
            return
        const timer = setTimeout(roll, BOT_ROLL_DELAY)
        return () => clearTimeout(timer)
    }, [current, human, roll, rolling]);

    const rows = TURN_ORDER.map(color => {
        const isOut = draw.out[color] !== undefined;
        const value = draw.out[color] ?? draw.rolls[color];
        const stateClass = color === draw.winner ? "is-winner"
            : isOut ? "is-out"
            : draw.round > 1 && !draw.winner ? "is-tied" : "";
        return {
            color,
            active: color === current,
            status: getStatus(draw, color, human, current),
            stateClass,
            aside: (
                <span className={`draw-badge${value ? "" : " is-empty"}`} role="img" aria-label={value ? `Résultat : ${value}` : "Pas encore lancé"}>
                    {value ?? "–"}
                </span>
            ),
        };
    });

    const entries = draw.events.map((event, id) => ({id, color: historyColor(event), text: historyText(event, human)})).reverse().slice(0, 4);

    return (
        <aside className="game-panel" aria-label="Tirage du premier joueur">
            <TurnCard avatarClass="avatar--accent" icon={<DiceIcon size={24}/>} label="Avant la partie"
                      name={draw.winner ? (draw.winner === human ? "Vous commencez !" : `${playerName(draw.winner, human)} commence`) : "Qui commence ?"}
                      chip={draw.winner ? "Tirage terminé" : `Manche ${draw.round}`}>
                <Die3D key={resets} ref={die} value={lastRoll} message={getMessage(draw, human)} idle={current === human && !rolling}/>
                {draw.winner
                    ? <Button variant="roll" onClick={onStart}>Commencer la partie</Button>
                    : <Button variant="roll" disabled={current !== human || rolling} onClick={roll}><DiceIcon/>Lancer le dé</Button>}
            </TurnCard>
            <PlayerList title="Tirage" human={human} rows={rows}/>
            <MoveHistory title="Derniers lancers" entries={entries}/>
            <Button variant="secondary" disabled={rolling} onClick={() => {
                setResets(count => count + 1);
                onReset();
            }}>Recommencer le tirage</Button>
            <RestartGame onConfirm={onRestart}/>
        </aside>
    );
}
