import {PlayerColor} from "@/type/PlayerColor";
import {
    activeSeats, decodeSettings, DEFAULT_SETTINGS, durationLevel, encodeSettings, exactEntry, exportSettings, importSettings,
    freeSeatStyle, gameRules, isDefault, nextSeat, normalizeSettings, presetOf, PRESETS, rollFace, Settings, toggleFace
} from "@/game/settings";
import {TURN_ORDER} from "@/game/ui/players";

const quick: Settings = {...DEFAULT_SETTINGS, ...PRESETS.quick, speed: "fast"};

describe("normalizeSettings", () => {
    it("falls back to the defaults for anything missing or wrong", () => {
        expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
        expect(normalizeSettings({players: 7, pawns: "2", dice: "123", speed: "turbo"})).toEqual(DEFAULT_SETTINGS);
    });

    it("always keeps the 6 and at least two faces", () => {
        expect(normalizeSettings({dice: [3, 4]}).dice).toEqual([3, 4, 6]);
        expect(normalizeSettings({dice: [6]}).dice).toEqual(DEFAULT_SETTINGS.dice);
        expect(normalizeSettings({dice: [5, 5, 6, 9]}).dice).toEqual([5, 6]);
    });
});

describe("toggleFace", () => {
    it("never turns the 6 off", () => {
        expect(toggleFace([1, 2, 6], 6)).toBeNull();
    });

    it("keeps at least two faces", () => {
        expect(toggleFace([5, 6], 5)).toBeNull();
        expect(toggleFace([4, 5, 6], 4)).toEqual([5, 6]);
        expect(toggleFace([5, 6], 1)).toEqual([1, 5, 6]);
    });
});

describe("share code", () => {
    it("round-trips every shared setting", () => {
        const code = encodeSettings(quick);
        expect(code).toBe("LUDO-3J2P-3456-R3");
        expect(decodeSettings(code)).toEqual(quick);
    });

    it("reads a code in lower case, and without the three tries", () => {
        expect(decodeSettings("ludo-2j1p-456-n")).toMatchObject({players: 2, pawns: 1, dice: [4, 5, 6], speed: "normal", rules: {threeTries: false}});
    });

    it("refuses broken codes", () => {
        expect(decodeSettings("LUDO-5J2P-3456-R")).toBeNull();
        expect(decodeSettings("LUDO-3J2P-345-R")).toBeNull();     // no 6
        expect(decodeSettings("LUDO-3J2P-3456-R63-VYGC")).toBeNull();
        expect(decodeSettings("hello")).toBeNull();
    });

    it("never shares the reduced-motion choice", () => {
        const reduced = {...quick, reducedMotion: true};
        expect(decodeSettings(encodeSettings(reduced), DEFAULT_SETTINGS)?.reducedMotion).toBe(false);
    });

    it("imports a code or an exported file, and nothing else", () => {
        expect(importSettings(exportSettings(quick))).toEqual(quick);
        expect(importSettings("  LUDO-3J2P-3456-R3 ")).toEqual(quick);
        expect(importSettings('{"app":"other","code":"LUDO-3J2P-3456-R3"}')).toBeNull();
        expect(importSettings("{not json")).toBeNull();
    });
});

describe("presets and duration", () => {
    it("recognises presets", () => {
        expect(presetOf(DEFAULT_SETTINGS)).toBe("classic");
        expect(presetOf(quick)).toBe("quick");
        expect(presetOf({...quick, pawns: 3})).toBeNull();
        expect(isDefault(DEFAULT_SETTINGS)).toBe(true);
        expect(isDefault(quick)).toBe(false);
    });

    it("ranks the presets from long to very short", () => {
        expect(durationLevel(DEFAULT_SETTINGS)).toBe(4);
        expect(durationLevel(quick)).toBe(3);
        expect(durationLevel({...DEFAULT_SETTINGS, ...PRESETS.express})).toBe(1);
    });
});

describe("seats", () => {
    it("seats two players face to face, and leaves the seat after the human free with three", () => {
        expect(activeSeats(2, PlayerColor.RED)).toEqual([PlayerColor.YELLOW, PlayerColor.RED]);
        expect(activeSeats(3, PlayerColor.RED)).toEqual([PlayerColor.YELLOW, PlayerColor.GREEN, PlayerColor.RED]);
        expect(activeSeats(4, PlayerColor.GREEN)).toHaveLength(4);
    });

    it("skips free seats when the turn passes", () => {
        const seats = activeSeats(3, PlayerColor.RED);
        expect(nextSeat(PlayerColor.RED, seats)).toBe(PlayerColor.YELLOW);
        expect(nextSeat(PlayerColor.GREEN, seats)).toBe(PlayerColor.RED);
    });
});

describe("dice", () => {
    it("only lands on active faces", () => {
        expect(rollFace([4, 5, 6], () => 0)).toBe(4);
        expect(rollFace([4, 5, 6], () => 0.999)).toBe(6);
        expect(exactEntry([1, 2, 3, 4, 5, 6])).toBe(true);
        expect(exactEntry([3, 4, 5, 6])).toBe(false);
    });
});

describe("additions for the engine", () => {
    it("turns the settings into the rules of the game", () => {
        expect(gameRules(DEFAULT_SETTINGS)).toEqual({exact: true, maxTries: 3});
        expect(gameRules({...DEFAULT_SETTINGS, dice: [3, 6], rules: {threeTries: false}})).toEqual({exact: false, maxTries: 1});
    });

    it("paints only the free seats neutral", () => {
        const style = freeSeatStyle(activeSeats(3, PlayerColor.YELLOW)) as Record<string, string>;
        expect(Object.keys(style)).toEqual(["--green-tile", "--green-pawn"]);
        expect(freeSeatStyle(TURN_ORDER)).toEqual({});
    });
});
