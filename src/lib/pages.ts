import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {homePath, Locale, LocalePaths, pathsEverywhere} from "@/i18n/config";

export const INFO_PAGES = ["about", "privacy", "legal"] as const;

export type InfoPageId = typeof INFO_PAGES[number];

export type InfoPage = {
    id: InfoPageId;
    slug: string;
    title: string;
    metaTitle: string;
    metaDescription: string;
    robots: "index" | "noindex";
    updated: string;
};

export function getInfoPage(locale: Locale, id: InfoPageId) {
    const {data, content} = matter(fs.readFileSync(path.join(process.cwd(), "content", locale, "pages", `${id}.md`), "utf8"));
    return {page: data as InfoPage, body: content.trim()};
}

export const infoPageId = (locale: Locale, slug: string) =>
    INFO_PAGES.find(id => getInfoPage(locale, id).page.slug === slug) as InfoPageId;

export const infoPagePath = (locale: Locale, id: InfoPageId) => `${homePath(locale)}${getInfoPage(locale, id).page.slug}/`;

export const infoPagePaths = (id: InfoPageId): LocalePaths => pathsEverywhere(locale => infoPagePath(locale, id));
