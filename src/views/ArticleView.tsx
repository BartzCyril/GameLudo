import {ComponentProps, Fragment} from "react";
import Link from "next/link";
import {notFound} from "next/navigation";
import Markdown from "markdown-to-jsx";
import {ArticleCard, Tag} from "@/components/ArticleCard";
import {ArrowIcon} from "@/components/Icons";
import {JsonLd} from "@/components/JsonLd";
import {MiniBoard} from "@/components/MiniBoard";
import {absoluteUrl, articlePath, guidePath, homePath, Locale, LOCALES} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
import {translator} from "@/i18n/translate";
import {articlePaths, getArticle, getArticleById, getArticles} from "@/lib/articles";
import {CATEGORIES} from "@/lib/categories";
import {organization, pageMetadata, SHARE_IMAGE} from "@/views/seo";

export function articleMetadata(locale: Locale, slug: string) {
    const post = getArticle(locale, slug);
    if (!post)
        return {};
    const {id, metaTitle, metaDescription, published, updated} = post.article;
    return pageMetadata({
        locale,
        paths: articlePaths(id),
        title: `${metaTitle} | ${getDictionary(locale).site.name}`,
        socialTitle: metaTitle,
        description: metaDescription,
        article: {publishedTime: published, modifiedTime: updated},
    });
}

// [text](@gameplay) targets an article in the language of the page, [text](@play) its home page.
function resolveHref(href: string, locale: Locale) {
    if (!href.startsWith("@"))
        return href;
    if (href === "@play")
        return homePath(locale);
    const target = getArticleById(locale, href.slice(1));
    // Thrown while rendering, so a broken link fails the build.
    if (!target)
        throw new Error(`Unknown Markdown link ${href} in content/${locale}`);
    return articlePath(locale, target.article.slug);
}

function MarkdownLink({href = "", locale, ...props}: ComponentProps<"a"> & { locale: Locale }) {
    const target = resolveHref(href, locale);
    return target.startsWith("/") ? <Link href={target} {...props}/> : <a href={target} {...props}/>;
}

function MarkdownTable(props: ComponentProps<"table">) {
    return <div className="table-wrap"><table {...props}/></div>;
}

export function ArticleView({locale, slug}: { locale: Locale, slug: string }) {
    const post = getArticle(locale, slug);
    if (!post)
        notFound();
    const {article, lead, body} = post;
    const dict = getDictionary(locale);
    const {t, formatDate} = translator(locale, dict);
    const articles = getArticles(locale);
    const related = articles.filter(({id}) => article.related.includes(id));
    const url = absoluteUrl(articlePath(locale, slug));
    const overrides = {a: {component: MarkdownLink, props: {locale}}, table: MarkdownTable};

    return (
        <main className="container article-main">
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "Article",
                headline: article.title,
                description: article.metaDescription,
                inLanguage: LOCALES[locale].hreflang,
                datePublished: article.published,
                dateModified: article.updated,
                image: absoluteUrl(SHARE_IMAGE),
                author: organization(dict),
                publisher: organization(dict),
                mainEntityOfPage: url,
            }}/>
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                    {"@type": "ListItem", position: 1, name: dict.article.home, item: absoluteUrl(homePath(locale))},
                    {"@type": "ListItem", position: 2, name: dict.article.guide, item: absoluteUrl(guidePath(locale))},
                    {"@type": "ListItem", position: 3, name: article.title, item: url},
                ],
            }}/>
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: article.faq.map(({q, a}) => ({"@type": "Question", name: q, acceptedAnswer: {"@type": "Answer", text: a}})),
            }}/>
            <nav className="breadcrumb" aria-label={dict.article.breadcrumbLabel}>
                <ol>
                    <li><Link href={homePath(locale)}>{dict.article.home}</Link></li>
                    <li><Link href={guidePath(locale)}>{dict.article.guide}</Link></li>
                    <li><Link href={`${guidePath(locale)}#${article.category}`}>{dict.categories[article.category].label}</Link></li>
                    <li aria-current="page">{article.title}</li>
                </ol>
            </nav>
            <div className="article-layout">
                <article className="article">
                    <header className="article__head">
                        <Tag category={article.category}/>
                        <h1 className="h1">{article.title}</h1>
                        <p className="article__lead"><Markdown options={{forceInline: true, wrapper: Fragment, overrides}}>{lead}</Markdown></p>
                        <p className="article__date"><time dateTime={article.updated}>{t("article.updated", {date: formatDate(new Date(article.updated))})}</time></p>
                    </header>
                    <div className="color-bar" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
                    <div className="prose">
                        <Markdown options={{wrapper: Fragment, overrides}}>{body}</Markdown>
                    </div>
                    <section className="faq" aria-labelledby="faq-title">
                        <h2 id="faq-title">{dict.article.faqTitle}</h2>
                        {article.faq.map(({q, a}) => (
                            <details key={q}><summary>{q}</summary><p>{a}</p></details>
                        ))}
                    </section>
                    <section className="related" aria-labelledby="related-title">
                        <h2 id="related-title">{dict.article.relatedTitle}</h2>
                        <div className="article-grid">
                            {related.map(item => <ArticleCard key={item.slug} article={item} compact/>)}
                        </div>
                    </section>
                    <div><Link className="btn btn--secondary" href={guidePath(locale)}><ArrowIcon back/>{dict.article.allArticles}</Link></div>
                </article>
                <aside className="sidebar">
                    <section className="cta-card">
                        <MiniBoard/>
                        <h2>{dict.article.ctaTitle}</h2>
                        <p>{dict.article.ctaText}</p>
                        <Link className="btn btn--primary" href={homePath(locale)}>{dict.article.ctaButton}</Link>
                    </section>
                    <nav className="card toc" aria-label={dict.article.tocTitle}>
                        <h2 className="panel-title">{dict.article.tocTitle}</h2>
                        {CATEGORIES.map(category => (
                            <Fragment key={category}>
                                <p className={`toc__group toc__group--${category}`}>{dict.categories[category].label}</p>
                                {articles.filter(item => item.category === category).map(item => (
                                    <Link key={item.slug} className={category} href={articlePath(locale, item.slug)} aria-current={item.slug === slug ? "page" : undefined}>
                                        {item.shortTitle}
                                    </Link>
                                ))}
                            </Fragment>
                        ))}
                    </nav>
                </aside>
            </div>
        </main>
    );
}
