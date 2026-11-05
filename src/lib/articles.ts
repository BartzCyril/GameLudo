import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {ACTIVE_LOCALES, articlePath, DEFAULT_LOCALE, guidePath, homePath, Locale, LocalePaths, pathsEverywhere} from "@/i18n/config";
import {Article, Category} from "@/lib/categories";

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

export type SitePage = { paths: LocalePaths, id?: string, category?: Category };

// Every page of the site with its address in each language: the language switcher and the sitemap start from here.
export function sitePages(): SitePage[] {
    return [
        {paths: pathsEverywhere(homePath)},
        {paths: pathsEverywhere(guidePath)},
        ...getArticles(DEFAULT_LOCALE).map(({id, category}) => ({id, category, paths: articlePaths(id)})),
    ];
}
