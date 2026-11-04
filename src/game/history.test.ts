import {describeMove, PiecesSnapshot} from "@/game/history";
import {countPieces, piecesStatus} from "@/game/ui/players";
import {PlayerColor} from "@/type/PlayerColor";

const {YELLOW, GREEN, RED} = PlayerColor;
const home = {out: false, indexPath: -1};
const at = (indexPath: number) => ({out: true, indexPath});
const board = (yellow: PiecesSnapshot[string], green: PiecesSnapshot[string] = [home]): PiecesSnapshot => ({yellow, green});

describe("describeMove", () => {
    it("reports a roll without any move", () => {
        expect(describeMove(board([home]), board([home]), YELLOW, 3, GREEN)).toBe("Bot Jaune fait 3, aucun pion à déplacer");
        expect(describeMove(board([home]), board([home]), YELLOW, 3, YELLOW)).toBe("Vous faites 3, aucun pion à déplacer");
    });

    it("reports a piece leaving the start", () => {
        expect(describeMove(board([home]), board([at(0)]), YELLOW, 6, GREEN)).toBe("Bot Jaune fait 6 et sort un pion");
    });

    it("reports a regular move and handles the singular", () => {
        expect(describeMove(board([at(2)]), board([at(7)]), YELLOW, 5, YELLOW)).toBe("Vous avancez de 5 cases");
        expect(describeMove(board([at(2)]), board([at(3)]), YELLOW, 1, GREEN)).toBe("Bot Jaune avance de 1 case");
    });

    it("reports the entry into the final lane", () => {
        expect(describeMove(board([at(38)]), board([at(41)]), YELLOW, 3, GREEN)).toBe("Bot Jaune entre à l'écurie");
    });

    it("reports a capture, whoever is taken", () => {
        const before = board([at(2)], [at(10)]);
        const after = board([at(7)], [home]);
        expect(describeMove(before, after, YELLOW, 5, RED)).toBe("Bot Jaune avance de 5 cases et prend un pion à Bot Vert");
        expect(describeMove(before, after, YELLOW, 5, YELLOW)).toBe("Vous avancez de 5 cases et prenez un pion à Bot Vert");
        expect(describeMove(before, after, YELLOW, 5, GREEN)).toBe("Bot Jaune avance de 5 cases et prend un de vos pions");
    });
});

describe("piecesStatus", () => {
    const start = {indexPrison: 0, out: false, indexPath: -1};
    const piece = (indexPath: number) => ({indexPrison: 0, out: true, indexPath});

    it("describes a player with nothing out", () => {
        expect(piecesStatus([start, start, start, start])).toBe("Aucun pion en jeu");
    });

    it("separates the track, the final lane and arrived pieces", () => {
        const pieces = [piece(43), piece(41), piece(12), start];
        expect(countPieces(pieces)).toEqual({out: 3, onTrack: 1, lastLine: 1, arrived: 1});
        expect(piecesStatus(pieces)).toBe("1 pion en jeu · 1 dans la dernière ligne · 1 arrivé");
    });

    it("counts stacked arrivals from the end of the lane", () => {
        expect(countPieces([piece(43), piece(42), piece(41), piece(40)]).arrived).toBe(4);
    });
});
