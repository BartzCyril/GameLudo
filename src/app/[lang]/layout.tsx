import type {Metadata} from "next";
import {ReactNode} from "react";
import {ACTIVE_LOCALES, DEFAULT_LOCALE, Locale, SITE_URL} from "@/i18n/config";
import {RootShell} from "@/views/RootShell";

export const metadata: Metadata = {metadataBase: new URL(SITE_URL)};

export const dynamicParams = false;

export const generateStaticParams = async () => ACTIVE_LOCALES.filter(locale => locale !== DEFAULT_LOCALE).map(lang => ({lang}));

export default async function LocaleLayout({children, params}: { children: ReactNode, params: Promise<{ lang: string }> }) {
    return <RootShell locale={(await params).lang as Locale}>{children}</RootShell>;
}
