'use client'

import {createContext, PropsWithChildren, useContext, useMemo} from "react";
import type {Locale} from "@/i18n/config";
import {Messages, translator, Translator} from "@/i18n/translate";

const I18nContext = createContext<Translator | null>(null);

export function I18nProvider({locale, dict, children}: PropsWithChildren<{ locale: Locale, dict: Messages }>) {
    const value = useMemo(() => translator(locale, dict), [locale, dict]);
    return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n() {
    const value = useContext(I18nContext);
    if (!value)
        throw new Error("useI18n must be used inside I18nProvider");
    return value;
}
