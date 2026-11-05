import {Locale} from "@/i18n/config";
import {guideMetadata, GuideView} from "@/views/GuideView";

type PageProps = { params: Promise<{ lang: string }> };

export const generateMetadata = async ({params}: PageProps) => guideMetadata((await params).lang as Locale);

export default async function Page({params}: PageProps) {
    return <GuideView locale={(await params).lang as Locale}/>;
}
