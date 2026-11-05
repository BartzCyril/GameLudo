import {describeMove, moveText, PiecesSnapshot, readMove} from "@/game/history";
import {countPieces, joinNames} from "@/game/ui/players";
import {translator} from "@/i18n/translate";
import {PlayerColor} from "@/type/PlayerColor";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";

const {YELLOW, GREEN, RED} = PlayerColor;
const home = {out: false, indexPath: -1};
const at = (indexPath: number) => ({out: true, indexPath});
const board = (yellow: PiecesSnapshot[string], green: PiecesSnapshot[string] = [home]): PiecesSnapshot => ({yellow, green});
const inFrench = translator("fr", fr);
const inEnglish = translator("en", en);

describe("describeMove", () => {
    it("reports a roll without any move", () => {
        expect(describeMove(board([home]), board([home]), YELLOW, 3)).toEqual({key: "rollNoMove", vars: {value: 3}});
    });

    it("reports a piece leaving the start", () => {
        expect(describeMove(board([home]), board([at(0)]), YELLOW, 6)).toEqual({key: "exit", vars: {value: 6}});
    });

    it("reports a regular move", () => {
        expect(describeMove(board([at(2)]), board([at(7)]), YELLOW, 5)).toEqual({key: "advance", vars: {value: 5}});
    });

    it("reports the entry into the final lane", () => {
        expect(describeMove(board([at(38)]), board([at(41)]), YELLOW, 3)).toEqual({key: "enterHome", vars: {value: 3}});
    });

    it("reports a capture", () => {
        expect(describeMove(board([at(2)], [at(10)]), board([at(7)], [home]), YELLOW, 5)).toEqual({key: "advance", vars: {value: 5, victim: GREEN}});
    });
});

describe("moveText", () => {
    const advance = {key: "advance", color: YELLOW, vars: {value: 5}} as const;
    const capture = {key: "advance", color: YELLOW, vars: {value: 5, victim: GREEN}} as const;

    it("words a move for the human and for a bot", () => {
        expect(moveText(inFrench, {key: "exit", color: YELLOW, vars: {value: 6}}, YELLOW)).toBe("Vous faites 6 et sortez un pion");
        expect(moveText(inFrench, {key: "exit", color: YELLOW, vars: {value: 6}}, GREEN)).toBe("Bot Jaune fait 6 et sort un pion");
    });

    it("handles the singular", () => {
        expect(moveText(inFrench, {...advance, vars: {value: 1}}, GREEN)).toBe("Bot Jaune avance de 1 case");
        expect(moveText(inFrench, advance, YELLOW)).toBe("Vous avancez de 5 cases");
    });

    it("words a capture, whoever is taken", () => {
        expect(moveText(inFrench, capture, RED)).toBe("Bot Jaune avance de 5 cases et prend un pion à Bot Vert");
        expect(moveText(inFrench, capture, YELLOW)).toBe("Vous avancez de 5 cases et prenez un pion à Bot Vert");
        expect(moveText(inFrench, capture, GREEN)).toBe("Bot Jaune avance de 5 cases et prend un de vos pions");
    });

    it("words the same entry in the language of the page", () => {
        expect(moveText(inEnglish, capture, GREEN)).toContain("Yellow bot");
    });
});

describe("joinNames", () => {
    it("joins the last name with the word of the language", () => {
        expect(joinNames(inFrench.t, ["Vous", "Bot Vert", "Bot Rose"])).toBe("Vous, Bot Vert et Bot Rose");
        expect(joinNames(inEnglish.t, ["You", "Green bot"])).toBe("You and Green bot");
        expect(joinNames(inFrench.t, ["Vous"])).toBe("Vous");
    });
});

describe("readMove", () => {
    it("returns nothing when no piece moved", () => {
        expect(readMove(board([home]), board([home]), YELLOW)).toBeNull();
    });

    it("gives the moved piece and the piece it took", () => {
        const before = board([home, at(2)], [at(10), at(20)]);
        const after = board([home, at(7)], [at(10), home]);
        expect(readMove(before, after, YELLOW)).toEqual({index: 1, from: 2, to: 7, victim: {color: GREEN, index: 1}});
    });

    it("reads a piece leaving the stable", () => {
        expect(readMove(board([home]), board([at(0)]), YELLOW)).toEqual({index: 0, from: -1, to: 0, victim: null});
    });
});

describe("countPieces", () => {
    const start = {indexPrison: 0, out: false, indexPath: -1};
    const piece = (indexPath: number) => ({indexPrison: 0, out: true, indexPath});

    it("counts nothing for a player with every pawn at home", () => {
        expect(countPieces([start, start, start, start])).toEqual({out: 0, onTrack: 0, lastLine: 0, arrived: 0});
    });

    it("separates the track, the final lane and arrived pieces", () => {
        expect(countPieces([piece(43), piece(41), piece(12), start])).toEqual({out: 3, onTrack: 1, lastLine: 1, arrived: 1});
    });

    it("counts stacked arrivals from the end of the lane", () => {
        expect(countPieces([piece(43), piece(42), piece(41), piece(40)]).arrived).toBe(4);
    });
});
