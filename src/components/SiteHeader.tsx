'use client'

import Link from "next/link";
import {usePathname} from "next/navigation";
import {LogoIcon} from "@/components/Icons";
import {Language, LanguageSwitcher} from "@/components/LanguageSwitcher";
import {guidePath, homePath} from "@/i18n/config";
import {useI18n} from "@/i18n/I18nProvider";
import type {SitePage} from "@/lib/articles";

export function SiteHeader({pages, languages}: { pages: SitePage[], languages: Language[] }) {
    const {t, locale} = useI18n();
    const pathname = usePathname().replace(/\/?$/, "/");
    const page = pages.find(({paths}) => paths[locale] === pathname);
    const links = [
        {id: "play", href: homePath(locale), label: t("nav.play")},
        {id: "rules", href: `${guidePath(locale)}#regles`, label: t("nav.rules")},
        {id: "strategies", href: `${guidePath(locale)}#strategies`, label: t("nav.strategies")},
        {id: "history", href: pages.find(({category}) => category === "histoire")?.paths[locale] ?? guidePath(locale), label: t("nav.history")},
    ];
    const current = pathname === homePath(locale) ? "play"
        : page?.category === "histoire" ? "history"
        : page?.category === "strategies" ? "strategies" : "rules";

    return (
        <header className="site-header">
            <div className="container site-header__inner">
                <Link className="logo" href={homePath(locale)} aria-label={t("site.logoLabel")}>
                    <LogoIcon/>
                    <span className="logo__text">{t("site.brand")}</span>
                </Link>
                <div className="site-header__end">
                    <nav className="nav" aria-label={t("nav.label")}>
                        {links.map(({id, href, label}) => (
                            <Link key={id} href={href} aria-current={id === current ? "page" : undefined}>{label}</Link>
                        ))}
                    </nav>
                    <LanguageSwitcher languages={languages} paths={page?.paths ?? {}}/>
                </div>
            </div>
        </header>
    );
}
