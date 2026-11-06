import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {ACTIVE_LOCALES, articlePath, configPath, DEFAULT_LOCALE, guidePath, homePath, Locale, LocalePaths, pathsEverywhere} from "@/i18n/config";
import {Article, Category} from "@/lib/categories";
import {getInfoPage, INFO_PAGES, InfoPageId, infoPagePaths} from "@/lib/pages";

function loadArticles(locale: Locale) {
    const folder = path.join(process.cwd(), "content", locale);
    return fs.readdirSync(folder)
        .filter(file => file.endsWith(".md"))
        .map(file => {
            const {data, content} = matter(fs.readFileSync(path.join(folder, file), "utf8"));
            const [lead, ...body] = content.trim().split(/\n\s*\n/);
            return {article: data as Article, lead, body: body.join("\n\n")};
        })
        .sort((a, b) => a.article.order - b.article.order);
}

export const getArticles = (locale: Locale): Article[] => loadArticles(locale).map(({article}) => article);

export const getArticle = (locale: Locale, slug: string) => loadArticles(locale).find(({article}) => article.slug === slug) ?? null;

export const getArticleById = (locale: Locale, id: string) => loadArticles(locale).find(({article}) => article.id === id) ?? null;

// The slug of an article in each active language that has it.
export function translationsOf(id: string): Partial<Record<Locale, string>> {
    return Object.fromEntries(ACTIVE_LOCALES.flatMap(locale => {
        const found = getArticleById(locale, id);
        return found ? [[locale, found.article.slug]] : [];
    }));
}

export const articlePaths = (id: string): LocalePaths =>
    Object.fromEntries(Object.entries(translationsOf(id)).map(([locale, slug]) => [locale, articlePath(locale as Locale, slug)]));

// Cuts an article at its `## ` headings, so that an ad only ever falls between two parts.
export function articleSections(body: string) {
    const parts = body.split(/^(?=## )/m);
    const isHeaded = (part: string) => part.startsWith("## ");
    const headings = parts.filter(isHeaded).length;
    let heading = 0;
    return parts.map(markdown => {
        heading += isHeaded(markdown) ? 1 : 0;
        const ad = !isHeaded(markdown) ? undefined
            : heading === 2 ? "articleTop" as const
            : heading === 4 && headings >= 5 ? "articleMiddle" as const
            : undefined;
        return {ad, markdown};
    });
}

export type SitePage = { paths: LocalePaths, id?: string, category?: Category, info?: InfoPageId, noindex?: boolean };

// Every page of the site with its address in each language: the language switcher and the sitemap start from here.
export function sitePages(): SitePage[] {
    return [
        {paths: pathsEverywhere(homePath)},
        {paths: pathsEverywhere(guidePath)},
        ...getArticles(DEFAULT_LOCALE).map(({id, category}) => ({id, category, paths: articlePaths(id)})),
        ...INFO_PAGES.map(info => ({info, paths: infoPagePaths(info), noindex: getInfoPage(DEFAULT_LOCALE, info).page.robots === "noindex"})),
        {paths: pathsEverywhere(configPath), noindex: true},
    ];
}
