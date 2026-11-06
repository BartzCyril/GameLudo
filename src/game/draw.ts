import {PlayerColor} from "@/type/PlayerColor";

type Rolls = Partial<Record<PlayerColor, number>>;

export type DrawResult = { winner: PlayerColor; max: number } | { tied: PlayerColor[]; max: number };

export type DrawEvent =
    | { type: "roll"; color: PlayerColor; value: number }
    | { type: "tie"; tied: PlayerColor[]; max: number }
    | { type: "win"; winner: PlayerColor; max: number };

export type DrawState = {
    round: number;
    contenders: PlayerColor[];
    rolls: Rolls;
    out: Rolls;
    winner: PlayerColor | null;
    events: DrawEvent[];
};

export function resolveDraw(contenders: PlayerColor[], rolls: Rolls): DrawResult {
    const max = Math.max(...contenders.map((id) => rolls[id] as number));
    const top = contenders.filter((id) => rolls[id] === max);
    return top.length === 1 ? {winner: top[0], max} : {tied: top, max};
}

export function newDraw(players: PlayerColor[]): DrawState {
    return {round: 1, contenders: players, rolls: {}, out: {}, winner: null, events: []};
}

export function currentDrawPlayer(draw: DrawState): PlayerColor | null {
    if (draw.winner)
        return null;
    return draw.contenders.find((id) => draw.rolls[id] === undefined) ?? null;
}

export function rollDraw(draw: DrawState, roll: () => number): DrawState {
    const color = currentDrawPlayer(draw);
    if (!color)
        return draw;
    const value = roll();
    const rolls = {...draw.rolls, [color]: value};
    const events: DrawEvent[] = [...draw.events, {type: "roll", color, value}];
    if (draw.contenders.some((id) => rolls[id] === undefined))
        return {...draw, rolls, events};

    const result = resolveDraw(draw.contenders, rolls);
    const staying = "winner" in result ? [result.winner] : result.tied;
    const out = {...draw.out};
    draw.contenders.filter((id) => !staying.includes(id)).forEach((id) => out[id] = rolls[id]);
    if ("winner" in result)
        return {...draw, rolls, out, winner: result.winner, events: [...events, {type: "win", winner: result.winner, max: result.max}]};
    return {...draw, round: draw.round + 1, contenders: result.tied, rolls: {}, out, events: [...events, {type: "tie", tied: result.tied, max: result.max}]};
}
