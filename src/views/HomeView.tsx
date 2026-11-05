import {Game} from "@/components/Game";
import {GuideSections} from "@/components/GuideSections";
import {JsonLd} from "@/components/JsonLd";
import {ProgressGame} from "@/components/ProgressGame";
import {absoluteUrl, ACTIVE_LOCALES, homePath, Locale, LOCALES, pathsEverywhere} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
import {getArticles} from "@/lib/articles";
import {organization, pageMetadata} from "@/views/seo";

export function homeMetadata(locale: Locale) {
    const {home} = getDictionary(locale);
    return pageMetadata({locale, paths: pathsEverywhere(homePath), title: home.metaTitle, description: home.metaDescription});
}

export function HomeView({locale}: { locale: Locale }) {
    const dict = getDictionary(locale);
    return (
        <main className="container game-main">
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: dict.site.name,
                alternateName: dict.site.brand,
                url: absoluteUrl("/"),
                inLanguage: ACTIVE_LOCALES.map(code => LOCALES[code].hreflang),
            }}/>
            <JsonLd data={{"@context": "https://schema.org", ...organization(dict)}}/>
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: dict.home.appName,
                description: dict.home.metaDescription,
                url: absoluteUrl(homePath(locale)),
                applicationCategory: "GameApplication",
                operatingSystem: "Web",
                inLanguage: LOCALES[locale].hreflang,
                isAccessibleForFree: true,
                offers: {"@type": "Offer", price: "0", priceCurrency: "EUR"},
            }}/>
            <Game/>
            <ProgressGame locale={locale}/>
            <section className="home-guide" aria-labelledby="home-guide">
                <h2 className="steps__title" id="home-guide">{dict.guide.eyebrow}</h2>
                <GuideSections articles={getArticles(locale)} filters={false}/>
            </section>
        </main>
    );
}
