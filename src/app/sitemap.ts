import type {MetadataRoute} from "next";
import {absoluteUrl, languageAlternates, Locale} from "@/i18n/config";
import {getArticleById, getArticles, sitePages} from "@/lib/articles";
import {getInfoPage} from "@/lib/pages";

export const dynamic = "force-static";

const latestUpdate = (locale: Locale) => getArticles(locale).map(article => article.updated).sort().at(-1);

export default function sitemap(): MetadataRoute.Sitemap {
    return sitePages().filter(({noindex}) => !noindex).flatMap(({id, info, paths}) => Object.entries(paths).map(([code, path]) => {
        const locale = code as Locale;
        return {
            url: absoluteUrl(path),
            lastModified: info ? getInfoPage(locale, info).page.updated : id ? getArticleById(locale, id)?.article.updated : latestUpdate(locale),
            alternates: {languages: languageAlternates(paths)},
        };
    }));
}
