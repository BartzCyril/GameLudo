export const LOCALES = {
    fr: {prefix: "", hreflang: "fr", htmlLang: "fr", ogLocale: "fr_FR", dir: "ltr"},
    en: {prefix: "/en", hreflang: "en", htmlLang: "en", ogLocale: "en_US", dir: "ltr"},
    es: {prefix: "/es", hreflang: "es", htmlLang: "es", ogLocale: "es_ES", dir: "ltr"},
    de: {prefix: "/de", hreflang: "de", htmlLang: "de", ogLocale: "de_DE", dir: "ltr"},
    it: {prefix: "/it", hreflang: "it", htmlLang: "it", ogLocale: "it_IT", dir: "ltr"},
    pt: {prefix: "/pt", hreflang: "pt", htmlLang: "pt", ogLocale: "pt_BR", dir: "ltr"},
    ru: {prefix: "/ru", hreflang: "ru", htmlLang: "ru", ogLocale: "ru_RU", dir: "ltr"},
    zh: {prefix: "/zh", hreflang: "zh-Hans", htmlLang: "zh-Hans", ogLocale: "zh_CN", dir: "ltr"},
    ja: {prefix: "/ja", hreflang: "ja", htmlLang: "ja", ogLocale: "ja_JP", dir: "ltr"},
    ko: {prefix: "/ko", hreflang: "ko", htmlLang: "ko", ogLocale: "ko_KR", dir: "ltr"},
    ar: {prefix: "/ar", hreflang: "ar", htmlLang: "ar", ogLocale: "ar_AR", dir: "rtl"},
} as const;

export type Locale = keyof typeof LOCALES;
export const DEFAULT_LOCALE: Locale = "fr";
export const X_DEFAULT_LOCALE: Locale = "en"; // visitors whose language is not offered
export const ACTIVE_LOCALES: Locale[] = ["fr", "en", "es", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar"];

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameludo.fr";

// Every path keeps its final slash: the site exports with trailingSlash.
export const homePath = (locale: Locale) => `${LOCALES[locale].prefix}/`;
export const guidePath = (locale: Locale) => `${LOCALES[locale].prefix}/guide/`;
export const articlePath = (locale: Locale, slug: string) => `${guidePath(locale)}${slug}/`;
export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;

// The same page in each language that has it.
export type LocalePaths = Partial<Record<Locale, string>>;

export const pathsEverywhere = (path: (locale: Locale) => string): LocalePaths =>
    Object.fromEntries(ACTIVE_LOCALES.map(locale => [locale, path(locale)]));

// hreflang map shared by the page metadata and the sitemap, so the two can never disagree.
export function languageAlternates(paths: LocalePaths): Record<string, string> {
    const languages = Object.entries(paths).map(([locale, path]) => [LOCALES[locale as Locale].hreflang, absoluteUrl(path)]);
    return {...Object.fromEntries(languages), "x-default": absoluteUrl((paths[X_DEFAULT_LOCALE] ?? paths[DEFAULT_LOCALE]) as string)};
}
