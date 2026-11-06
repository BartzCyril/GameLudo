import {ACTIVE_LOCALES, CONFIG_SLUGS, DEFAULT_LOCALE, Locale} from "@/i18n/config";
import {getInfoPage, INFO_PAGES, infoPageId} from "@/lib/pages";
import {configMetadata, ConfigView} from "@/views/ConfigView";
import {infoPageMetadata, InfoPageView} from "@/views/InfoPageView";

type PageProps = { params: Promise<{ lang: string, page: string }> };

export const dynamicParams = false;

export const generateStaticParams = async () => ACTIVE_LOCALES.filter(locale => locale !== DEFAULT_LOCALE)
    .flatMap(lang => [...INFO_PAGES.map(id => ({lang, page: getInfoPage(lang, id).page.slug})), {lang, page: CONFIG_SLUGS[lang]}]);

export async function generateMetadata({params}: PageProps) {
    const {lang, page} = await params;
    if (page === CONFIG_SLUGS[lang as Locale])
        return configMetadata(lang as Locale);
    return infoPageMetadata(lang as Locale, infoPageId(lang as Locale, page));
}

export default async function Page({params}: PageProps) {
    const {lang, page} = await params;
    if (page === CONFIG_SLUGS[lang as Locale])
        return <ConfigView/>;
    return <InfoPageView locale={lang as Locale} id={infoPageId(lang as Locale, page)}/>;
}
