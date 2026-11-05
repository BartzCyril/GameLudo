import {getArticles} from "@/lib/articles";
import {articleMetadata, ArticleView} from "@/views/ArticleView";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export const generateStaticParams = async () => getArticles("fr").map(({slug}) => ({slug}));

export const generateMetadata = async ({params}: PageProps) => articleMetadata("fr", (await params).slug);

export default async function Page({params}: PageProps) {
    return <ArticleView locale="fr" slug={(await params).slug}/>;
}
