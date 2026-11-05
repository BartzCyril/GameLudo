import Link from "next/link";
import {AdSlot} from "@/components/AdSlot";
import {GuideSections} from "@/components/GuideSections";
import {ArrowIcon} from "@/components/Icons";
import {JsonLd} from "@/components/JsonLd";
import {absoluteUrl, articlePath, guidePath, homePath, Locale, LOCALES, pathsEverywhere} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
import {getArticles} from "@/lib/articles";
import {pageMetadata} from "@/views/seo";

export function guideMetadata(locale: Locale) {
    const {guide} = getDictionary(locale);
    return pageMetadata({locale, paths: pathsEverywhere(guidePath), title: guide.metaTitle, description: guide.metaDescription});
}

export function GuideView({locale}: { locale: Locale }) {
    const {guide} = getDictionary(locale);
    const articles = getArticles(locale);
    return (
        <main className="container guide-main">
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: guide.collectionName,
                description: guide.metaDescription,
                url: absoluteUrl(guidePath(locale)),
                inLanguage: LOCALES[locale].hreflang,
                mainEntity: {
                    "@type": "ItemList",
                    itemListElement: articles.map((article, index) => ({
                        "@type": "ListItem",
                        position: index + 1,
                        name: article.title,
                        url: absoluteUrl(articlePath(locale, article.slug)),
                    })),
                },
            }}/>
            <div className="guide-head">
                <div className="guide-head__text">
                    <p className="eyebrow">{guide.eyebrow}</p>
                    <h1 className="h1">{guide.h1}</h1>
                    <p className="lead">{guide.lead}</p>
                </div>
                <Link className="btn btn--primary" href={homePath(locale)}>{guide.cta} <ArrowIcon/></Link>
            </div>
            <GuideSections articles={articles} ad={<AdSlot name="guideInline"/>}/>
        </main>
    );
}
