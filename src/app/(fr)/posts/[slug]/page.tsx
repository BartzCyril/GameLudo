import {getArticleById} from "@/lib/articles";
import {articlePath} from "@/i18n/config";

// Old site URLs, still indexed by Google. GitHub Pages cannot send a 301, so each one
// is a static page with a meta refresh and a canonical link.
// shortcut: not a real 301, replace it if the host ever allows server redirects.
const LEGACY: Record<string, string> = {
    StartRules: "start",
    GameplayRules: "gameplay",
    EndRules: "end",
    StrategiesOffensive: "offensive",
    StrategiesDefensive: "defensive",
    StrategiesObservationAndAdaptation: "observation",
};

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export const generateStaticParams = () => Object.keys(LEGACY).map(slug => ({slug}));

const target = async ({params}: PageProps) => articlePath("fr", getArticleById("fr", LEGACY[(await params).slug])!.article.slug);

export const generateMetadata = async (props: PageProps) => ({alternates: {canonical: await target(props)}});

export default async function Page(props: PageProps) {
    const url = await target(props);
    return (
        <>
            <meta httpEquiv="refresh" content={`0;url=${url}`}/>
            <p><a href={url}>{url}</a></p>
        </>
    );
}
