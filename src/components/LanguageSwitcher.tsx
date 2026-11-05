'use client'

import {useEffect, useRef} from "react";
import {homePath, Locale, LOCALES, LocalePaths} from "@/i18n/config";
import {useI18n} from "@/i18n/I18nProvider";

export type Language = { code: Locale, name: string }

// Plain <a>: each link is a real address for crawlers, and leaving for another root layout reloads the page anyway.
export function LanguageSwitcher({languages, paths}: { languages: Language[], paths: LocalePaths }) {
    const {t, locale} = useI18n();
    const menu = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        const close = (event: Event) => {
            if (menu.current && (event instanceof KeyboardEvent ? event.key === "Escape" : !menu.current.contains(event.target as Node)))
                menu.current.open = false;
        };
        document.addEventListener("click", close);
        document.addEventListener("keydown", close);
        return () => {
            document.removeEventListener("click", close);
            document.removeEventListener("keydown", close);
        };
    }, []);

    return (
        <details className="lang" ref={menu}>
            <summary title={t("language.switcherLabel")}>
                <span className="sr-only">{t("language.switcherLabel")} </span>{locale.toUpperCase()}
            </summary>
            <ul className="lang__list">
                {languages.map(({code, name}) => (
                    <li key={code}>
                        <a href={paths[code] ?? homePath(code)} hrefLang={LOCALES[code].hreflang} lang={LOCALES[code].htmlLang}
                           aria-current={code === locale ? "true" : undefined} title={code === locale ? t("language.current") : undefined}><span dir={LOCALES[code].dir}>{name}</span></a>
                    </li>
                ))}
            </ul>
        </details>
    );
}
