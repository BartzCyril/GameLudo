import {Locale} from "@/i18n/config";
import {homeMetadata, HomeView} from "@/views/HomeView";

type PageProps = { params: Promise<{ lang: string }> };

export const generateMetadata = async ({params}: PageProps) => homeMetadata((await params).lang as Locale);

export default async function Page({params}: PageProps) {
    return <HomeView locale={(await params).lang as Locale}/>;
}
