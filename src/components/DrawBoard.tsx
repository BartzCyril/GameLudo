'use client'

import {useCallback, useEffect, useRef, useState} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {currentDrawPlayer, DrawState, rollDie, rollDraw} from "@/game/draw";
import {motion, useWait} from "@/game/ui/motion";
import {displayColor, joinNames, playerName} from "@/game/ui/players";
import {Board} from "@/components/Board";
import {CornerBadges} from "@/components/CornerBadges";
import {Die3DHandle} from "@/components/Die3D";
import {BoardBar} from "@/components/board/BoardBar";
import {BoardDie} from "@/components/board/BoardDie";
import {RestartButton} from "@/components/board/RestartButton";
import {useI18n} from "@/i18n/I18nProvider";
import type {Translator} from "@/i18n/translate";

const BOT_ROLL_DELAY = 800
// How long "Green bot starts with a 6!" stays before the game begins on its own.
const START_DELAY = 1800

type Translate = Translator["t"]

const variant = (color: PlayerColor, human: PlayerColor) => color === human ? "human" : "bot";

function getMessage(t: Translate, draw: DrawState, human: PlayerColor) {
    const last = draw.events.at(-1);
    const next = currentDrawPlayer(draw);
    if (last?.type === "win")
        return t(`draw.winMessage.${variant(last.winner, human)}`, {name: playerName(t, last.winner, human), max: last.max});
    if (last?.type === "tie")
        return t(`draw.tieMessage.${last.tied.length > 2 ? "group" : "pair"}`, {max: last.max, names: joinNames(t, last.tied.map(color => playerName(t, color, human)))});
    if (!last)
        return next === human ? `${t("draw.intro")} ${t("game.messages.clickDie")}` : t("draw.intro");
    return next === human ? t("game.messages.clickDie") : t("draw.botRolling", {name: playerName(t, next as PlayerColor, human)});
}

type DrawBoardProps = {
    draw: DrawState,
    human: PlayerColor,
    onChange: (draw: DrawState) => void,
    onStart: () => void,
    onRestart: () => void
}

// Who starts: every player rolls the die in their own corner, the badges keep the score.
export function DrawBoard({draw, human, onChange, onStart, onRestart}: DrawBoardProps) {
    const {t} = useI18n();
    const wait = useWait();
    const current = currentDrawPlayer(draw);
    const lastRoll = draw.events.filter(event => event.type === "roll").at(-1);
    const die = useRef<Die3DHandle>(null);
    const [rolling, setRolling] = useState(false);
    // The die waits in the corner of whoever rolls next, then of the winner.
    const dieColor = current ?? draw.winner ?? human;

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
        // Let the die slide to the bot's corner first.
        const timer = setTimeout(roll, BOT_ROLL_DELAY)
        return () => clearTimeout(timer)
    }, [current, human, roll, rolling]);

    // Once someone has won, the game begins by itself. Once only, even if the parent passes a new onStart meanwhile.
    const started = useRef(false);
    useEffect(() => {
        if (!draw.winner)
            return
        wait(Math.max(START_DELAY, motion().pop)).then(() => {
            if (!started.current) {
                started.current = true;
                onStart();
            }
        });
    }, [draw.winner, onStart, wait]);

    return (
        <Board bar={<BoardBar message={getMessage(t, draw, human)} tint={displayColor[draw.winner ?? current ?? human]}
                              action={<RestartButton label={t("game.restart.button")} onConfirm={onRestart}/>}/>}
               overlay={<CornerBadges human={human} turn={current ?? draw.winner} draw={draw}/>}
               front={<BoardDie dieRef={die} color={dieColor} value={lastRoll?.value ?? null}
                                clickable={current === human && !rolling} onRoll={roll}/>}/>
    );
}
