import fs from "fs";
import path from "path";
import {ACTIVE_LOCALES} from "@/i18n/config";
import {getInfoPage, INFO_PAGES, infoPageId, infoPagePath} from "@/lib/pages";

it("has a French folder named after each slug", () => {
    for (const id of INFO_PAGES)
        expect([id, fs.existsSync(path.join(process.cwd(), "src/app/(fr)", getInfoPage("fr", id).page.slug, "page.tsx"))]).toEqual([id, true]);
});

it("keeps about indexed, and the other two out of Google", () => {
    for (const locale of ACTIVE_LOCALES)
        expect(INFO_PAGES.map(id => getInfoPage(locale, id).page.robots)).toEqual(["index", "noindex", "noindex"]);
});

it("builds the address of a page and finds it back", () => {
    expect(infoPagePath("fr", "about")).toBe("/a-propos/");
    expect(infoPagePath("de", "legal")).toBe("/de/impressum/");
    expect(infoPageId("de", "impressum")).toBe("legal");
});
