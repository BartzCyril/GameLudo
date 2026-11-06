import {PropsWithChildren} from "react";
import {Bricolage_Grotesque, DM_Sans} from "next/font/google";
import {MotionPreference} from "@/components/MotionPreference";
import {SiteFooter} from "@/components/SiteFooter";
import {SiteHeader} from "@/components/SiteHeader";
import {ACTIVE_LOCALES, Locale, LOCALES} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
import {I18nProvider} from "@/i18n/I18nProvider";
import {sitePages} from "@/lib/articles";
import "@/app/globals.css"
import "@/app/animations.css"

const display = Bricolage_Grotesque({subsets: ["latin"], weight: ["600", "800"], variable: "--font-display-loaded"});
const body = DM_Sans({subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body-loaded"});

export const fontClasses = `${display.variable} ${body.variable}`;

export function RootShell({locale, children}: PropsWithChildren<{ locale: Locale }>) {
    const languages = ACTIVE_LOCALES.map(code => ({code, name: getDictionary(code).locale.name}));
    return (
        <html lang={LOCALES[locale].htmlLang} dir={LOCALES[locale].dir} className={fontClasses}>
        {/* eslint-disable-next-line @next/next/no-head-element -- this is the root layout, shared by both route groups. */}
        <head>
            {/* Plain script tag so the AdSense crawler finds it in the static HTML. */}
            <script async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4145165029182891"
                    crossOrigin="anonymous"></script>
        </head>
        <body>
        <MotionPreference/>
        <I18nProvider locale={locale} dict={getDictionary(locale)}>
            <div className="page">
                <SiteHeader pages={sitePages()} languages={languages}/>
                {children}
                <SiteFooter locale={locale}/>
            </div>
        </I18nProvider>
        </body>
        </html>
    );
}
