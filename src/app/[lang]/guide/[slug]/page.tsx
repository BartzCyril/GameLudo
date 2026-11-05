import {ACTIVE_LOCALES, DEFAULT_LOCALE, Locale} from "@/i18n/config";
import {getArticles} from "@/lib/articles";
import {articleMetadata, ArticleView} from "@/views/ArticleView";

type PageProps = { params: Promise<{ lang: string, slug: string }> };

export const dynamicParams = false;

export const generateStaticParams = async () => ACTIVE_LOCALES.filter(locale => locale !== DEFAULT_LOCALE)
    .flatMap(lang => getArticles(lang).map(({slug}) => ({lang, slug})));

export async function generateMetadata({params}: PageProps) {
    const {lang, slug} = await params;
    return articleMetadata(lang as Locale, slug);
}

export default async function Page({params}: PageProps) {
    const {lang, slug} = await params;
    return <ArticleView locale={lang as Locale} slug={slug}/>;
}
