import fs from "fs";
import path from "path";
import {translator} from "@/i18n/translate";
import fr from "../../messages/fr.json";

const FOLDER = path.join(process.cwd(), "messages");
const EXTRA_PLURALS = ["zero", "two", "few", "many"];

type Tree = string | { [key: string]: Tree };

// Every text by its dotted path. Arrays flatten too: their indexes are keys.
function flatten(node: Tree, prefix = ""): Record<string, string> {
    if (typeof node === "string")
        return {[prefix]: node};
    return Object.assign({}, ...Object.entries(node).map(([key, value]) => flatten(value, prefix ? `${prefix}.${key}` : key)));
}

const variables = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();

const reference = flatten(fr as unknown as Tree);

describe.each(fs.readdirSync(FOLDER).filter(file => file.endsWith(".json")))("%s", file => {
    const catalogue = flatten(JSON.parse(fs.readFileSync(path.join(FOLDER, file), "utf8")));

    it("has the same keys as fr.json", () => {
        const isExtraPlural = (key: string) => EXTRA_PLURALS.includes(key.split(".").at(-1) as string) && key.replace(/\.\w+$/, ".other") in reference;
        expect(Object.keys(catalogue).filter(key => !isExtraPlural(key)).sort()).toEqual(Object.keys(reference).sort());
    });

    it("uses the same variables in every text", () => {
        for (const [key, text] of Object.entries(catalogue)) {
            const expected = reference[key] ?? reference[key.replace(/\.\w+$/, ".other")];
            // Arabic spells out 0, 1 and 2 ("خانتين"), so those forms may leave {count} out.
            const spelledOut = /\.(zero|one|two)$/.test(key) && key.replace(/\.\w+$/, ".other") in reference;
            const comparable = (names: string[]) => spelledOut ? names.filter(name => name !== "count") : names;
            expect([key, comparable(variables(text))]).toEqual([key, comparable(variables(expected))]);
        }
    });
});

describe("translator", () => {
    const {t, tp, formatDate} = translator("fr", fr);

    it("fills the variables and leaves unknown ones visible", () => {
        expect(t("game.chip", {n: 3})).toBe("Tour 3");
        expect(t("game.chip")).toBe("Tour {n}");
    });

    it("picks the plural form", () => {
        expect(tp("game.status.arrived", 1)).toBe("1 arrivé");
        expect(tp("game.status.arrived", 3)).toBe("3 arrivés");
    });

    it("falls back on other when the language has no such form", () => {
        const ru = {...fr, game: {...fr.game, status: {...fr.game.status, arrived: {one: "{count} a", other: "{count} b"}}}};
        expect(translator("ru", ru).tp("game.status.arrived", 3)).toBe("3 b");
    });

    it("accepts a plural form without {count}", () => {
        const ar = {...fr, game: {...fr.game, status: {...fr.game.status, arrived: {one: "واحد", other: "{count} ب"}}}};
        expect(translator("ar", ar).tp("game.status.arrived", 1)).toBe("واحد");
        expect(translator("ar", ar).tp("game.status.arrived", 11)).toBe("11 ب");
    });

    it("formats a date in the language of the page", () => {
        expect(formatDate(new Date("2026-11-04"))).toBe("4 novembre 2026");
    });
});
