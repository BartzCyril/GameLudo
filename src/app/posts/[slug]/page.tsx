import type {Metadata} from "next";
import {ComponentProps, Fragment} from "react";
import Link from "next/link";
import {notFound} from "next/navigation";
import Markdown from "markdown-to-jsx";
import {ArticleCard, Tag} from "@/components/ArticleCard";
import {ArrowIcon} from "@/components/Icons";
import {JsonLd} from "@/components/JsonLd";
import {MiniBoard} from "@/components/MiniBoard";
import {articleUrl, getArticle, getArticles, pageUrl} from "@/lib/articles";
import {Category, CATEGORIES} from "@/lib/categories";

export const dynamicParams = false;

export const generateStaticParams = async () => getArticles().map(({slug}) => ({slug}));

type PostPageProps = {
    params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({params}: PostPageProps): Promise<Metadata> => {
    const {slug} = await params;
    const post = getArticle(slug);
    if (!post)
        return {};
    const {metaTitle, metaDescription, updated} = post.article;
    return {
        title: `${metaTitle} | Ludo`,
        description: metaDescription,
        alternates: {canonical: articleUrl(slug)},
        openGraph: {
            type: "article", title: metaTitle, description: metaDescription,
            url: articleUrl(slug), locale: "fr_FR", siteName: "Ludo", modifiedTime: updated,
        },
    };
};

function MarkdownLink({href = "", ...props}: ComponentProps<"a">) {
    return href.startsWith("/") ? <Link href={href} {...props}/> : <a href={href} {...props}/>;
}

function MarkdownTable(props: ComponentProps<"table">) {
    return <div className="table-wrap"><table {...props}/></div>;
}

const shortTitle = (title: string) => title.replace(" du jeu des petits chevaux", "").replace("Stratégies d'observation et d'adaptation", "Observation et adaptation");

const PostPage = async ({params}: PostPageProps) => {
    const {slug} = await params;
    const post = getArticle(slug);
    if (!post)
        notFound();
    const {article, lead, body} = post;
    const articles = getArticles();
    const related = articles.filter(({slug}) => article.related.includes(slug));
    const categories = Object.keys(CATEGORIES) as Category[];
    const date = new Intl.DateTimeFormat("fr-FR", {dateStyle: "long", timeZone: "UTC"}).format(new Date(article.updated));

    return (
        <main className="container article-main">
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "Article",
                headline: article.title,
                description: article.metaDescription,
                inLanguage: "fr",
                dateModified: article.updated,
                mainEntityOfPage: articleUrl(slug),
                publisher: {"@type": "Organization", name: "Ludo", url: pageUrl("/")},
            }}/>
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                    {"@type": "ListItem", position: 1, name: "Accueil", item: pageUrl("/")},
                    {"@type": "ListItem", position: 2, name: "Guide", item: pageUrl("/guide")},
                    {"@type": "ListItem", position: 3, name: article.title, item: articleUrl(slug)},
                ],
            }}/>
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: article.faq.map(({q, a}) => ({"@type": "Question", name: q, acceptedAnswer: {"@type": "Answer", text: a}})),
            }}/>
            <nav className="breadcrumb" aria-label="Fil d'Ariane">
                <ol>
                    <li><Link href="/">Accueil</Link></li>
                    <li><Link href="/guide">Guide</Link></li>
                    <li><Link href={`/guide#${article.category}`}>{CATEGORIES[article.category].label}</Link></li>
                    <li aria-current="page">{article.title}</li>
                </ol>
            </nav>
            <div className="article-layout">
                <article className="article">
                    <header className="article__head">
                        <Tag category={article.category}/>
                        <h1 className="h1">{article.title}</h1>
                        <p className="article__lead"><Markdown options={{forceInline: true, wrapper: Fragment}}>{lead}</Markdown></p>
                        <p className="article__date">Mis à jour le <time dateTime={article.updated}>{date}</time></p>
                    </header>
                    <div className="color-bar" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
                    <div className="prose">
                        <Markdown options={{wrapper: Fragment, overrides: {a: MarkdownLink, table: MarkdownTable}}}>{body}</Markdown>
                    </div>
                    <section className="faq" aria-labelledby="faq-title">
                        <h2 id="faq-title">Questions fréquentes</h2>
                        {article.faq.map(({q, a}) => (
                            <details key={q}><summary>{q}</summary><p>{a}</p></details>
                        ))}
                    </section>
                    <section className="related" aria-labelledby="related-title">
                        <h2 id="related-title">À lire aussi</h2>
                        <div className="article-grid">
                            {related.map(item => <ArticleCard key={item.slug} article={item} compact/>)}
                        </div>
                    </section>
                    <div><Link className="btn btn--secondary" href="/guide"><ArrowIcon back/>Tous les articles</Link></div>
                </article>
                <aside className="sidebar">
                    <section className="cta-card">
                        <MiniBoard/>
                        <h2>Envie de faire une partie ?</h2>
                        <p>Jouez contre trois bots, directement dans votre navigateur. Gratuit, sans inscription.</p>
                        <Link className="btn btn--primary" href="/">Jouer aux petits chevaux</Link>
                    </section>
                    <nav className="card toc" aria-label="Dans ce guide">
                        <h2 className="panel-title">Dans ce guide</h2>
                        {categories.map(category => (
                            <Fragment key={category}>
                                <p className={`toc__group toc__group--${category}`}>{CATEGORIES[category].label}</p>
                                {articles.filter(item => item.category === category).map(item => (
                                    <Link key={item.slug} className={category} href={`/posts/${item.slug}`} aria-current={item.slug === slug ? "page" : undefined}>
                                        {shortTitle(item.title)}
                                    </Link>
                                ))}
                            </Fragment>
                        ))}
                    </nav>
                </aside>
            </div>
        </main>
    );
};

export default PostPage;
