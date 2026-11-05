import {Fragment} from "react";
import Link from "next/link";
import Markdown from "markdown-to-jsx";
import {JsonLd} from "@/components/JsonLd";
import {CONTACT_EMAIL, EDITOR_NAME} from "@/config/site";
import {absoluteUrl, homePath, Locale, LOCALES} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
import {translator} from "@/i18n/translate";
import {getInfoPage, InfoPageId, infoPagePath, infoPagePaths} from "@/lib/pages";
import {markdownOverrides} from "@/views/ArticleView";
import {pageMetadata} from "@/views/seo";

export function infoPageMetadata(locale: Locale, id: InfoPageId) {
    const {metaTitle, metaDescription, robots} = getInfoPage(locale, id).page;
    return pageMetadata({
        locale,
        paths: infoPagePaths(id),
        title: `${metaTitle} | ${getDictionary(locale).site.name}`,
        socialTitle: metaTitle,
        description: metaDescription,
        noindex: robots === "noindex",
    });
}

// <bdi> keeps the address readable inside the Arabic page.
const fillIdentity = (markdown: string) => markdown
    .replaceAll("{editorName}", EDITOR_NAME)
    .replaceAll("{contactEmail}", `<bdi><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></bdi>`);

export function InfoPageView({locale, id}: { locale: Locale, id: InfoPageId }) {
    const {page, body} = getInfoPage(locale, id);
    const dict = getDictionary(locale);
    const {t, formatDate} = translator(locale, dict);
    const url = absoluteUrl(infoPagePath(locale, id));

    return (
        <main className="container article-main">
            {id === "about" && <>
                <JsonLd data={{
                    "@context": "https://schema.org",
                    "@type": "AboutPage",
                    name: page.title,
                    description: page.metaDescription,
                    url,
                    inLanguage: LOCALES[locale].hreflang,
                }}/>
                <JsonLd data={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    itemListElement: [
                        {"@type": "ListItem", position: 1, name: dict.article.home, item: absoluteUrl(homePath(locale))},
                        {"@type": "ListItem", position: 2, name: page.title, item: url},
                    ],
                }}/>
            </>}
            <nav className="breadcrumb" aria-label={dict.article.breadcrumbLabel}>
                <ol>
                    <li><Link href={homePath(locale)}>{dict.article.home}</Link></li>
                    <li aria-current="page">{page.title}</li>
                </ol>
            </nav>
            <div className="article-layout">
                <article className="article">
                    <header className="article__head">
                        <h1 className="h1">{page.title}</h1>
                        <p className="article__date"><time dateTime={page.updated}>{t("pages.updated", {date: formatDate(new Date(page.updated))})}</time></p>
                    </header>
                    <div className="prose">
                        <Markdown options={{wrapper: Fragment, overrides: markdownOverrides(locale)}}>{fillIdentity(body)}</Markdown>
                    </div>
                </article>
            </div>
        </main>
    );
}
