import type {Metadata} from "next";
import {Bricolage_Grotesque, DM_Sans} from "next/font/google";
import {SiteFooter} from "@/components/SiteFooter";
import {SiteHeader} from "@/components/SiteHeader";
import {SITE_URL} from "@/lib/articles";
import "./globals.css"
import "./animations.css"

const display = Bricolage_Grotesque({subsets: ["latin"], weight: ["600", "800"], variable: "--font-display-loaded"});
const body = DM_Sans({subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body-loaded"});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" className={`${display.variable} ${body.variable}`}>
        <head>
            {/* Plain script tag so the AdSense crawler finds it in the static HTML. */}
            <script async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4145165029182891"
                    crossOrigin="anonymous"></script>
        </head>
        <body>
        <div className="page">
            <SiteHeader/>
            {children}
            <SiteFooter/>
        </div>
        </body>
        </html>
    );
}
