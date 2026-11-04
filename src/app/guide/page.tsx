import type {Metadata} from "next";
import Link from "next/link";
import {GuideSections} from "@/components/GuideSections";
import {ArrowIcon} from "@/components/Icons";
import {JsonLd} from "@/components/JsonLd";
import {articleUrl, getArticles, pageUrl} from "@/lib/articles";

const title = "Guide du jeu des petits chevaux : règles, stratégies | Ludo";
const description = "Règles du jeu des petits chevaux, stratégies pour gagner et histoire du jeu : tout le guide pour bien jouer, du premier 6 à la dernière case.";

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: pageUrl("/guide")},
    openGraph: {type: "website", title, description, url: pageUrl("/guide"), locale: "fr_FR", siteName: "Ludo"},
}

export default function GuidePage() {
    const articles = getArticles();
    return (
        <main className="container guide-main">
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: "Guide du jeu des petits chevaux",
                url: pageUrl("/guide"),
                inLanguage: "fr",
                hasPart: articles.map(article => ({"@type": "Article", headline: article.title, url: articleUrl(article.slug)})),
            }}/>
            <div className="guide-head">
                <div className="guide-head__text">
                    <p className="eyebrow">Le guide</p>
                    <h1 className="h1">Tout savoir sur les petits chevaux</h1>
                    <p className="lead">Les règles de la première à la dernière case, des stratégies pour gagner plus souvent, et l&apos;histoire d&apos;un jeu né en Inde il y a plusieurs siècles.</p>
                </div>
                <Link className="btn btn--primary" href="/">Lancer une partie <ArrowIcon/></Link>
            </div>
            <GuideSections articles={articles}/>
        </main>
    );
}
