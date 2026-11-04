import type {Metadata} from "next";
import {Game} from "@/components/Game";
import {JsonLd} from "@/components/JsonLd";
import {ProgressGame} from "@/components/ProgressGame";
import {ToastContextProvider} from "@/components/ToastContext";
import {pageUrl} from "@/lib/articles";

const title = "Jeu des petits chevaux en ligne gratuit | Ludo";
const description = "Jouez gratuitement au jeu des petits chevaux en ligne contre trois bots, sans inscription. Règles, stratégies et histoire du jeu dans notre guide.";

export const metadata: Metadata = {
    title,
    description,
    alternates: {canonical: pageUrl("/")},
    openGraph: {type: "website", title, description, url: pageUrl("/"), locale: "fr_FR", siteName: "Ludo"},
}

function Page() {
    return (
        <main className="container game-main">
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Ludo – Jeu des petits chevaux",
                url: pageUrl("/"),
                applicationCategory: "GameApplication",
                operatingSystem: "Web",
                inLanguage: "fr",
                isAccessibleForFree: true,
                offers: {"@type": "Offer", price: "0", priceCurrency: "EUR"},
            }}/>
            <ToastContextProvider>
                <Game/>
            </ToastContextProvider>
            <ProgressGame/>
        </main>
    )
}

export default Page
