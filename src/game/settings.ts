// Game settings chosen on the Configuration page: players, pawns, die faces, pace.
// Stored in localStorage, shared as a short code or a .json file. Everything here is pure, except load/save.
import {CSSProperties} from "react";
import {PlayerColor} from "@/type/PlayerColor";
import {GameRules} from "@/interface/GameBoard";
import {displayColor, TURN_ORDER} from "@/game/ui/players";

export const SETTINGS_VERSION = 1;
export const SETTINGS_KEY = "ludo:reglages";

export type PlayerCount = 2 | 3 | 4;
export type PawnCount = 1 | 2 | 3 | 4;
export type Speed = "slow" | "normal" | "fast";
export type PresetId = "classic" | "quick" | "express";

export interface Settings {
    version: typeof SETTINGS_VERSION,
    players: PlayerCount,
    pawns: PawnCount,
    dice: number[],             // sorted, unique, always holds 6, at least 2 faces
    speed: Speed,
    rules: { threeTries: boolean },
    reducedMotion: boolean      // personal: never in the share code
}

export const DEFAULT_SETTINGS: Settings = {
    version: SETTINGS_VERSION,
    players: 4,
    pawns: 4,
    dice: [1, 2, 3, 4, 5, 6],
    speed: "normal",
    rules: {threeTries: true},
    reducedMotion: false,
};

export const PRESETS: Record<PresetId, Pick<Settings, "players" | "pawns" | "dice">> = {
    classic: {players: 4, pawns: 4, dice: [1, 2, 3, 4, 5, 6]},
    quick: {players: 3, pawns: 2, dice: [3, 4, 5, 6]},
    express: {players: 2, pawns: 1, dice: [4, 5, 6]},
};

const SPEED_LETTER: Record<Speed, string> = {slow: "L", normal: "N", fast: "R"};

// How long bots wait, in ms, before rolling (draw and game) and after a roll before moving.
export const BOT_DELAYS: Record<Speed, { roll: number, drawRoll: number, afterRoll: number }> = {
    slow: {roll: 1600, drawRoll: 1200, afterRoll: 900},
    normal: {roll: 1000, drawRoll: 800, afterRoll: 500},
    fast: {roll: 450, drawRoll: 400, afterRoll: 200},
};

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

// Anything read from storage, a file or a code goes through here. Bad fields fall back to the default, never throw.
export function normalizeSettings(input: unknown): Settings {
    const raw = isObject(input) ? input : {};
    const players = [2, 3, 4].includes(raw.players as number) ? raw.players as PlayerCount : DEFAULT_SETTINGS.players;
    const pawns = [1, 2, 3, 4].includes(raw.pawns as number) ? raw.pawns as PawnCount : DEFAULT_SETTINGS.pawns;
    const faces = Array.isArray(raw.dice) ? [...new Set(raw.dice.filter(v => Number.isInteger(v) && v >= 1 && v <= 6) as number[])] : [];
    if (!faces.includes(6))
        faces.push(6);
    const dice = faces.length >= 2 ? faces.sort((a, b) => a - b) : [...DEFAULT_SETTINGS.dice];
    const speed = ["slow", "normal", "fast"].includes(raw.speed as string) ? raw.speed as Speed : DEFAULT_SETTINGS.speed;
    const rules = isObject(raw.rules) ? raw.rules : {};
    return {
        version: SETTINGS_VERSION,
        players, pawns, dice, speed,
        rules: {
            threeTries: typeof rules.threeTries === "boolean" ? rules.threeTries : DEFAULT_SETTINGS.rules.threeTries,
        },
        reducedMotion: typeof raw.reducedMotion === "boolean" ? raw.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
    };
}

export function presetOf(settings: Settings): PresetId | null {
    const match = (Object.keys(PRESETS) as PresetId[]).find(id => {
        const preset = PRESETS[id];
        return preset.players === settings.players && preset.pawns === settings.pawns && preset.dice.join() === settings.dice.join();
    });
    return match ?? null;
}

export function isDefault(settings: Settings): boolean {
    return encodeSettings(settings) === encodeSettings(DEFAULT_SETTINGS);
}

// Turning a face on or off. The 6 never goes off, and at least 2 faces stay on: then the change is refused (null).
export function toggleFace(dice: number[], face: number): number[] | null {
    if (face === 6)
        return null;
    if (dice.includes(face))
        return dice.length <= 2 ? null : dice.filter(value => value !== face);
    return [...dice, face].sort((a, b) => a - b);
}

// LUDO-3J2P-3456-R3: players, pawns, faces, speed + rules (3 = three tries).
export function encodeSettings(settings: Settings): string {
    return `LUDO-${settings.players}J${settings.pawns}P-${settings.dice.join("")}-${SPEED_LETTER[settings.speed]}${settings.rules.threeTries ? "3" : ""}`;
}

export function decodeSettings(code: string, base: Settings = DEFAULT_SETTINGS): Settings | null {
    const match = /^LUDO-([2-4])J([1-4])P-([1-6]{2,6})-([LNR])(3?)$/i.exec(code.trim());
    if (!match)
        return null;
    const [, players, pawns, faces, speed, three] = match;
    const dice = [...new Set(faces.split("").map(Number))].sort((a, b) => a - b);
    if (!dice.includes(6) || dice.length < 2)
        return null;
    const fromSpeed = Object.fromEntries(Object.entries(SPEED_LETTER).map(([id, letter]) => [letter, id]));
    return normalizeSettings({
        players: Number(players), pawns: Number(pawns), dice,
        speed: fromSpeed[speed.toUpperCase()],
        rules: {threeTries: three === "3"},
        reducedMotion: base.reducedMotion,
    });
}

// The exported file. The code inside is what import reads back; `settings` is there for humans.
export function exportSettings(settings: Settings): string {
    return JSON.stringify({app: "gameludo", type: "settings", version: SETTINGS_VERSION, code: encodeSettings(settings), settings}, null, 2);
}

// A pasted code, or the text of an exported file. null when it holds no settings.
export function importSettings(text: string, base: Settings = DEFAULT_SETTINGS): Settings | null {
    const code = decodeSettings(text, base);
    if (code)
        return code;
    try {
        const data = JSON.parse(text);
        return isObject(data) && data.app === "gameludo" && typeof data.code === "string" ? decodeSettings(data.code, base) : null;
    } catch {
        return null;
    }
}

export function loadSettings(): Settings {
    try {
        const text = localStorage.getItem(SETTINGS_KEY);
        return text ? normalizeSettings(JSON.parse(text)) : {...DEFAULT_SETTINGS};
    } catch {
        return {...DEFAULT_SETTINGS};
    }
}

export function saveSettings(settings: Settings): boolean {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch {
        // Private browsing or full storage: the settings simply last for this visit.
        return false;
    }
}

// Seats in play, in turn order. 2 players sit face to face; with 3, the seat right after the human stays free.
export function activeSeats(players: PlayerCount, human: PlayerColor): PlayerColor[] {
    const start = TURN_ORDER.indexOf(human);
    const around = [0, 1, 2, 3].map(offset => TURN_ORDER[(start + offset) % 4]);
    const seats = players === 4 ? around : players === 3 ? [around[0], around[2], around[3]] : [around[0], around[2]];
    return TURN_ORDER.filter(seat => seats.includes(seat));
}

export function nextSeat(turn: PlayerColor, seats: PlayerColor[]): PlayerColor {
    return seats[(seats.indexOf(turn) + 1) % seats.length];
}

// A free seat paints its corner neutral, so a colour left unused there cannot be mistaken for a player's.
export function freeSeatStyle(seats: PlayerColor[]): CSSProperties {
    const free = TURN_ORDER.filter(seat => !seats.includes(seat)).map(seat => displayColor[seat]);
    return Object.fromEntries(free.flatMap(skin => [[`--${skin}-tile`, "var(--color-surface-muted)"], [`--${skin}-pawn`, "var(--color-border-strong)"]]));
}

export function rollFace(dice: number[], random: () => number = Math.random): number {
    return dice[Math.floor(random() * dice.length)];
}

// Without the small values, a pawn could wait forever in front of its lane for an exact 1 or 2.
// So when a face is missing, a roll that is big enough lets it in: it stops at the deepest free cell.
export function exactEntry(dice: number[]): boolean {
    return dice.length === 6;
}

export function gameRules(settings: Settings): GameRules {
    return {exact: exactEntry(settings.dice), maxTries: settings.rules.threeTries ? 3 : 1};
}

// 1 = very short … 4 = long. A scale, not minutes: the dice make any duration in minutes unreliable.
// classic → 4, quick → 3, express → 1.
export function durationLevel(settings: Settings): 1 | 2 | 3 | 4 {
    const average = settings.dice.reduce((sum, value) => sum + value, 0) / settings.dice.length;
    const score = (settings.players - 2) + (settings.pawns - 1) + (average < 4 ? 2 : average < 4.6 ? 1 : 0);
    return score >= 6 ? 4 : score >= 3 ? 3 : score >= 1 ? 2 : 1;
}
