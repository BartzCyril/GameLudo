import type {MetadataRoute} from "next";
import {articleUrl, getArticles, pageUrl} from "@/lib/articles";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    const articles = getArticles();
    const lastModified = articles.map(article => article.updated).sort().at(-1);
    return [
        {url: pageUrl("/"), lastModified},
        {url: pageUrl("/guide"), lastModified},
        ...articles.map(article => ({url: articleUrl(article.slug), lastModified: article.updated})),
    ];
}
