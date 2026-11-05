import type {MetadataRoute} from "next";
import {absoluteUrl, languageAlternates, Locale} from "@/i18n/config";
import {getArticleById, getArticles, sitePages} from "@/lib/articles";

export const dynamic = "force-static";

const latestUpdate = (locale: Locale) => getArticles(locale).map(article => article.updated).sort().at(-1);

export default function sitemap(): MetadataRoute.Sitemap {
    return sitePages().flatMap(({id, paths}) => Object.entries(paths).map(([code, path]) => {
        const locale = code as Locale;
        return {
            url: absoluteUrl(path),
            lastModified: id ? getArticleById(locale, id)?.article.updated : latestUpdate(locale),
            alternates: {languages: languageAlternates(paths)},
        };
    }));
}
