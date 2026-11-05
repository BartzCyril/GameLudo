import type {Metadata} from "next";
import {absoluteUrl, languageAlternates, Locale, LOCALES, LocalePaths} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
import type {Messages} from "@/i18n/translate";

export const SHARE_IMAGE = "/og-image.png";

type PageSeo = {
    locale: Locale,
    paths: LocalePaths,
    title: string,
    description: string,
    socialTitle?: string,
    noindex?: boolean,
    article?: { publishedTime: string, modifiedTime: string }
}

export function pageMetadata({locale, paths, title, description, socialTitle = title, noindex = false, article}: PageSeo): Metadata {
    const dict = getDictionary(locale);
    const url = absoluteUrl(paths[locale] as string);
    return {
        title,
        description,
        alternates: {canonical: url, languages: languageAlternates(paths)},
        openGraph: {
            ...(article ? {type: "article", ...article} : {type: "website"}),
            title: socialTitle,
            description,
            url,
            siteName: dict.site.name,
            locale: LOCALES[locale].ogLocale,
            alternateLocale: (Object.keys(paths) as Locale[]).filter(other => other !== locale).map(other => LOCALES[other].ogLocale),
            images: [{url: SHARE_IMAGE, width: 1200, height: 630, alt: dict.home.appName}],
        },
        twitter: {card: "summary_large_image", images: [SHARE_IMAGE]},
        robots: noindex ? {index: false, follow: true} : {index: true, follow: true, googleBot: {"max-image-preview": "large", "max-snippet": -1}},
    };
}

export const organization = (dict: Messages) => ({
    "@type": "Organization",
    name: dict.site.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo-512.png"),
});
