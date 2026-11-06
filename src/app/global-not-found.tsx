import type {Metadata} from "next";
import {ACTIVE_LOCALES, DEFAULT_LOCALE, homePath, LOCALES} from "@/i18n/config";
import {THEME_SCRIPT} from "@/game/ui/theme";
import {getDictionary} from "@/i18n/dictionaries";
import {fontClasses} from "@/views/RootShell";

const {notFound} = getDictionary(DEFAULT_LOCALE);

export const metadata: Metadata = {
    title: notFound.metaTitle,
    description: notFound.text,
    robots: {index: false, follow: true},
};

// Plain <a>: this page sits outside both root layouts.
export default function GlobalNotFound() {
    return (
        <html lang={LOCALES[DEFAULT_LOCALE].htmlLang} dir={LOCALES[DEFAULT_LOCALE].dir} className={fontClasses} suppressHydrationWarning>
        <body>
        <script dangerouslySetInnerHTML={{__html: THEME_SCRIPT}}/>
        <main className="container not-found">
            <h1 className="h1">{notFound.title}</h1>
            <p className="lead">{notFound.text}</p>
            <a className="btn btn--primary" href={homePath(DEFAULT_LOCALE)}>{notFound.home}</a>
            <ul className="not-found__others">
                {ACTIVE_LOCALES.filter(locale => locale !== DEFAULT_LOCALE).map(locale => {
                    const other = getDictionary(locale).notFound;
                    return (
                        <li key={locale} lang={LOCALES[locale].htmlLang} dir={LOCALES[locale].dir}>
                            {other.title} · <a href={homePath(locale)} hrefLang={LOCALES[locale].hreflang}>{other.home}</a>
                        </li>
                    );
                })}
            </ul>
        </main>
        </body>
        </html>
    );
}
