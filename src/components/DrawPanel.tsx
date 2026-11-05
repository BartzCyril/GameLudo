'use client'

import {useCallback, useEffect, useRef, useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {currentDrawPlayer, DrawEvent, DrawState, rollDie, rollDraw} from "@/game/draw";
import {joinNames, playerName, TURN_ORDER} from "@/game/ui/players";
import {Button} from "@/components/Button";
import {Die3D, Die3DHandle} from "@/components/Die3D";
import {DiceIcon} from "@/components/Icons";
import {MoveHistory} from "@/components/MoveHistory";
import {useI18n} from "@/i18n/I18nProvider";
import type {Translator} from "@/i18n/translate";
import {PlayerList} from "@/components/PlayerList";
import {RestartGame} from "@/components/RestartGame";
import {TurnCard} from "@/components/TurnCard";

const BOT_ROLL_DELAY = 800

type Translate = Translator["t"]

type DrawPanelProps = {
    draw: DrawState,
    human: PlayerColor,
    onChange: (draw: DrawState) => void,
    onReset: () => void,
    onStart: () => void,
    onRestart: () => void
}

function tiedNames(t: Translate, tied: PlayerColor[], human: PlayerColor) {
    return joinNames(t, tied.map(color => playerName(t, color, human)));
}

const variant = (color: PlayerColor, human: PlayerColor) => color === human ? "human" : "bot";

function historyText(t: Translate, event: DrawEvent, human: PlayerColor) {
    switch (event.type) {
        case "roll":
            return t(`draw.history.roll.${variant(event.color, human)}`, {name: playerName(t, event.color, human), value: event.value});
        case "tie":
            return t("draw.history.tie", {max: event.max, names: tiedNames(t, event.tied, human)});
        case "win":
            return t(`draw.history.win.${variant(event.winner, human)}`, {name: playerName(t, event.winner, human)});
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

function getMessage(t: Translate, draw: DrawState, human: PlayerColor) {
    const last = draw.events.at(-1);
    const next = currentDrawPlayer(draw);
    if (last?.type === "win")
        return t(`draw.winMessage.${variant(last.winner, human)}`, {name: playerName(t, last.winner, human), max: last.max});
    if (last?.type === "tie")
        return t(`draw.tieMessage.${last.tied.length > 2 ? "group" : "pair"}`, {max: last.max, names: tiedNames(t, last.tied, human)});
    if (!last)
        return t("draw.intro");
    return next === human ? t("draw.yourRoll") : t("draw.botRolling", {name: playerName(t, next as PlayerColor, human)});
}

function getStatus(t: Translate, draw: DrawState, color: PlayerColor, human: PlayerColor, current: PlayerColor | null) {
    if (color === draw.winner)
        return t("draw.status.starts");
    if (draw.out[color] !== undefined)
        return t("draw.status.out");
    if (draw.rolls[color] !== undefined)
        return t("draw.status.rolled", {value: draw.rolls[color] as number});
    if (color === current)
        return color === human ? t("draw.status.yourRoll") : t("draw.status.botRolling");
    return draw.round > 1 ? t("draw.status.tied") : t("draw.status.waiting");
}

export function DrawPanel({draw, human, onChange, onReset, onStart, onRestart}: DrawPanelProps) {
    const {t} = useI18n();
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
            status: getStatus(t, draw, color, human, current),
            stateClass,
            aside: (
                <span className={`draw-badge${value ? "" : " is-empty"}`} role="img" aria-label={value ? t("draw.badge.result", {value}) : t("draw.badge.notRolled")}>
                    {value ?? "–"}
                </span>
            ),
        };
    });

    const entries = draw.events.map((event, id) => ({id, color: historyColor(event), text: historyText(t, event, human)})).reverse().slice(0, 4);

    return (
        <aside className="game-panel" aria-label={t("draw.regionLabel")}>
            <TurnCard avatarClass="avatar--accent" icon={<DiceIcon size={24}/>} label={t("draw.label")}
                      name={draw.winner ? (draw.winner === human ? t("draw.youStart") : t("draw.botStarts", {name: playerName(t, draw.winner, human)})) : t("draw.who")}
                      chip={draw.winner ? t("draw.done") : t("draw.round", {n: draw.round})}>
                <Die3D key={resets} ref={die} value={lastRoll} message={getMessage(t, draw, human)} idle={current === human && !rolling}/>
                {draw.winner
                    ? <Button variant="roll" onClick={onStart}>{t("draw.start")}</Button>
                    : <Button variant="roll" disabled={current !== human || rolling} onClick={roll}><DiceIcon/>{t("draw.roll")}</Button>}
            </TurnCard>
            <PlayerList title={t("draw.listTitle")} human={human} rows={rows}/>
            <MoveHistory title={t("draw.historyTitle")} entries={entries}/>
            <Button variant="secondary" disabled={rolling} onClick={() => {
                setResets(count => count + 1);
                onReset();
            }}>{t("draw.resetDraw")}</Button>
            <RestartGame onConfirm={onRestart}/>
        </aside>
    );
}
